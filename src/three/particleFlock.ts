import * as THREE from 'three';
import {
  evaluateCatmullRom,
  type Point3,
} from '../math/geometryMath';
import type { FlowConfig } from '../types/msaart';

export interface SplineStreamPath {
  stream: 'blue' | 'orange';
  points: Point3[];
  swirlRadius: number;
  swirlTurns: number;
  speed: number;
  weight: number;
}

export interface CavitationZone {
  center: Point3;
  radius: number;
  height: number;
}

export class VolumetricParticleFlock {
  public readonly group: THREE.Group;
  private readonly material: THREE.ShaderMaterial;
  private readonly geometry: THREE.InstancedBufferGeometry;
  private readonly mesh: THREE.Mesh;

  private readonly count: number;
  private readonly paths: SplineStreamPath[];
  private readonly cavitationZone: CavitationZone | null;

  // Per-particle immutable seeds
  private readonly particlePathIdx: Uint16Array;
  private readonly particlePhase: Float32Array;
  private readonly particleRadialOffset: Float32Array;
  private readonly particleThetaOffset: Float32Array;
  private readonly particleSpeedMul: Float32Array;
  private readonly particleIsCavitation: Uint8Array;

  // Dynamic per-instance GPU buffers (zero allocation in render loop)
  private readonly posArray: Float32Array;
  private readonly velArray: Float32Array;
  private readonly metaArray: Float32Array; // [streamId (0=blue,1=orange,2=cavitation), lifeAlpha, seed, scale]
  private readonly posAttr: THREE.InstancedBufferAttribute;
  private readonly velAttr: THREE.InstancedBufferAttribute;
  private readonly metaAttr: THREE.InstancedBufferAttribute;

  private simTime = 0;

  constructor(
    paths: SplineStreamPath[],
    count = 960,
    cavitationZone: CavitationZone | null = null
  ) {
    this.group = new THREE.Group();
    this.paths = paths;
    this.cavitationZone = cavitationZone;
    this.count = count;

    this.particlePathIdx = new Uint16Array(count);
    this.particlePhase = new Float32Array(count);
    this.particleRadialOffset = new Float32Array(count);
    this.particleThetaOffset = new Float32Array(count);
    this.particleSpeedMul = new Float32Array(count);
    this.particleIsCavitation = new Uint8Array(count);

    this.posArray = new Float32Array(count * 3);
    this.velArray = new Float32Array(count * 3);
    this.metaArray = new Float32Array(count * 4);

    // Deterministic seeded distribution
    let seed = 424242;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const cavCount = cavitationZone ? Math.floor(count * 0.28) : 0;
    const totalWeight = paths.reduce((acc, p) => acc + p.weight, 0) || 1;

    for (let i = 0; i < count; i++) {
      if (i < cavCount) {
        this.particleIsCavitation[i] = 1;
        this.particlePhase[i] = rand();
        this.particleRadialOffset[i] = Math.sqrt(rand());
        this.particleThetaOffset[i] = rand() * Math.PI * 2;
        this.particleSpeedMul[i] = 0.75 + rand() * 0.55;
      } else {
        this.particleIsCavitation[i] = 0;
        let pick = rand() * totalWeight;
        let chosen = 0;
        for (let pIdx = 0; pIdx < paths.length; pIdx++) {
          pick -= paths[pIdx].weight;
          if (pick <= 0) {
            chosen = pIdx;
            break;
          }
        }
        this.particlePathIdx[i] = chosen;
        this.particlePhase[i] = rand();
        this.particleRadialOffset[i] = 0.15 + rand() * 0.85;
        this.particleThetaOffset[i] = rand() * Math.PI * 2;
        this.particleSpeedMul[i] = 0.82 + rand() * 0.36;
      }
      this.metaArray[i * 4 + 2] = rand();
      this.metaArray[i * 4 + 3] = 0.65 + rand() * 0.7;
    }

    const basePlane = new THREE.PlaneGeometry(1, 1);
    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.index = basePlane.index;
    this.geometry.attributes.position = basePlane.attributes.position;
    this.geometry.attributes.uv = basePlane.attributes.uv;
    this.geometry.instanceCount = count;

    this.posAttr = new THREE.InstancedBufferAttribute(this.posArray, 3);
    this.posAttr.setUsage(THREE.DynamicDrawUsage);
    this.velAttr = new THREE.InstancedBufferAttribute(this.velArray, 3);
    this.velAttr.setUsage(THREE.DynamicDrawUsage);
    this.metaAttr = new THREE.InstancedBufferAttribute(this.metaArray, 4);
    this.metaAttr.setUsage(THREE.DynamicDrawUsage);

    this.geometry.setAttribute('aPos', this.posAttr);
    this.geometry.setAttribute('aVel', this.velAttr);
    this.geometry.setAttribute('aMeta', this.metaAttr);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uStreamMask: { value: 0 },
        uParticleType: { value: 0 }, // 0 wisps, 1 dots, 2 streaks
        uParticleSize: { value: 1.0 },
        uOpacity: { value: 0.86 },
        uElongation: { value: 0.55 },
        uBlueColor: { value: new THREE.Color(0x38bdf8) },
        uOrangeColor: { value: new THREE.Color(0xfb923c) },
        uPlasmoidColor: { value: new THREE.Color(0xc4b5fd) },
      },
      vertexShader: `
        attribute vec3 aPos;
        attribute vec3 aVel;
        attribute vec4 aMeta;

        uniform float uStreamMask;
        uniform float uParticleType;
        uniform float uParticleSize;
        uniform float uElongation;

        varying vec2 vUv;
        varying vec4 vMeta;
        varying float vSpeedNorm;

        void main() {
          vUv = uv;
          vMeta = aMeta;

          // Filter stream visibility cleanly
          float streamId = aMeta.x;
          bool hidden = false;
          if (uStreamMask > 0.5 && uStreamMask < 1.5 && streamId > 0.5 && streamId < 1.5) hidden = true;
          if (uStreamMask > 1.5 && streamId < 0.5) hidden = true;

          vec4 mvCenter = modelViewMatrix * vec4(aPos, 1.0);
          vec3 mvVel = (modelViewMatrix * vec4(aVel, 0.0)).xyz;
          float velLen = length(mvVel.xy);
          vSpeedNorm = clamp(velLen * 0.4, 0.0, 2.0);

          vec2 dir = velLen > 0.0005 ? mvVel.xy / velLen : vec2(1.0, 0.0);
          vec2 perp = vec2(-dir.y, dir.x);

          float baseScale = 0.095 * uParticleSize * aMeta.w;
          if (streamId > 1.5) {
            baseScale *= 1.15;
          }
          if (hidden || aMeta.y <= 0.001) {
            baseScale = 0.0;
          }

          float stretch = 1.0;
          float widthMul = 1.0;
          if (uParticleType < 0.5) {
            // Wisps: gentle directional stretch
            stretch = 1.0 + uElongation * (0.85 + vSpeedNorm * 0.65);
            widthMul = 1.15;
          } else if (uParticleType < 1.5) {
            // Dots: circular micro-beads
            stretch = 1.0 + uElongation * 0.12;
            widthMul = 0.85;
          } else {
            // Streaks: sleek velocity-aligned filaments
            stretch = 1.6 + uElongation * (2.2 + vSpeedNorm * 1.1);
            widthMul = 0.45;
          }

          vec2 localQuad = position.xy;
          vec2 orientedOffset =
            dir * (localQuad.x * baseScale * stretch) +
            perp * (localQuad.y * baseScale * widthMul);

          mvCenter.xy += orientedOffset;
          gl_Position = projectionMatrix * mvCenter;
        }
      `,
      fragmentShader: `
        uniform float uParticleType;
        uniform float uOpacity;
        uniform vec3 uBlueColor;
        uniform vec3 uOrangeColor;
        uniform vec3 uPlasmoidColor;

        varying vec2 vUv;
        varying vec4 vMeta;
        varying float vSpeedNorm;

        void main() {
          float envelope = vMeta.y;
          if (envelope <= 0.001) discard;

          vec2 p = (vUv - 0.5) * 2.0;
          float r2 = dot(p, p);
          if (r2 > 1.0) discard;

          float r = sqrt(r2);
          float alpha = 0.0;
          float coreHot = 0.0;

          if (uParticleType < 0.5) {
            // Soft volumetric Gaussian wisp
            alpha = exp(-r2 * 3.4) * (1.0 - smoothstep(0.75, 1.0, r));
            coreHot = exp(-r2 * 7.5) * 0.45;
          } else if (uParticleType < 1.5) {
            // Crisp spherical bead / micro-plasmoid dot
            alpha = 1.0 - smoothstep(0.45, 0.98, r);
            coreHot = (1.0 - smoothstep(0.0, 0.55, r)) * 0.7;
          } else {
            // Sleek tapered plasma streak
            float axialFade = 1.0 - smoothstep(0.15, 1.0, abs(p.x));
            float radialFade = exp(-p.y * p.y * 5.2);
            alpha = axialFade * radialFade;
            coreHot = exp(-p.y * p.y * 12.0) * axialFade * 0.55;
          }

          vec3 baseCol = uBlueColor;
          if (vMeta.x > 0.5 && vMeta.x < 1.5) {
            baseCol = uOrangeColor;
          } else if (vMeta.x > 1.5) {
            baseCol = mix(uBlueColor, uPlasmoidColor, 0.65);
          }

          vec3 finalCol = mix(baseCol, vec3(1.0), coreHot);
          float finalAlpha = alpha * envelope * uOpacity;
          gl_FragColor = vec4(finalCol, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      clipping: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 18;
    this.group.add(this.mesh);

    // Populate initial frame
    this.update(0.016, {
      streamFilter: 'both',
      isPlaying: true,
      pulseHz: 2.4,
      particleType: 'wisps',
      particleSize: 1.0,
      opacity: 0.86,
      fadeDistance: 0.14,
      elongation: 0.55,
      swirlIntensity: 0.68,
    });
  }

  public update(dt: number, config: FlowConfig): void {
    const safeDt = Math.min(dt, 0.08);
    if (config.isPlaying) {
      this.simTime += safeDt * (0.42 + config.pulseHz * 0.24);
    }

    // Update shader uniforms
    this.material.uniforms.uStreamMask.value =
      config.streamFilter === 'both'
        ? 0
        : config.streamFilter === 'blue'
          ? 1
          : 2;
    this.material.uniforms.uParticleType.value =
      config.particleType === 'wisps'
        ? 0
        : config.particleType === 'dots'
          ? 1
          : 2;
    this.material.uniforms.uParticleSize.value = config.particleSize;
    this.material.uniforms.uOpacity.value = config.opacity;
    this.material.uniforms.uElongation.value = config.elongation;

    const fade = Math.max(0.02, Math.min(0.42, config.fadeDistance));
    const swirlScale = config.swirlIntensity;
    const pulseWave = Math.sin(this.simTime * config.pulseHz * Math.PI * 1.4);

    for (let i = 0; i < this.count; i++) {
      if (this.particleIsCavitation[i] === 1 && this.cavitationZone) {
        const cz = this.cavitationZone;
        const t =
          (this.particlePhase[i] +
            this.simTime * 0.26 * this.particleSpeedMul[i]) %
          1;
        const y = cz.center.y - cz.height * 0.5 + t * cz.height;

        // Symmetric vacuum expansion & implosive collapse driven by engine pulse
        const collapseCycle =
          0.5 +
          0.5 *
            Math.sin(
              this.simTime * config.pulseHz * 3.1 +
                this.particleThetaOffset[i] * 0.5
            );
        const r =
          cz.radius *
          this.particleRadialOffset[i] *
          (0.45 + 0.55 * collapseCycle);
        const theta =
          this.particleThetaOffset[i] +
          this.simTime * (1.2 + swirlScale * 1.6) +
          t * 3.0 * swirlScale;

        const px = cz.center.x + Math.cos(theta) * r;
        const pz = cz.center.z + Math.sin(theta) * r;
        const py = y + Math.sin(theta * 2.0) * 0.06;

        this.posArray[i * 3] = px;
        this.posArray[i * 3 + 1] = py;
        this.posArray[i * 3 + 2] = pz;

        this.velArray[i * 3] = -Math.sin(theta) * 0.4 * swirlScale;
        this.velArray[i * 3 + 1] = 0.85;
        this.velArray[i * 3 + 2] = Math.cos(theta) * 0.4 * swirlScale;

        const fadeIn = Math.min(1, t / fade);
        const fadeOut = Math.min(1, (1 - t) / fade);
        const collapseFlash = collapseCycle < 0.16 ? 1.35 : 0.78;
        this.metaArray[i * 4] = 2.0; // Cavitation micro-plasmoid
        this.metaArray[i * 4 + 1] = Math.min(fadeIn, fadeOut) * collapseFlash;
        continue;
      }

      const path = this.paths[this.particlePathIdx[i]];
      if (!path) continue;

      const speed = path.speed * this.particleSpeedMul[i];
      const t = (this.particlePhase[i] + this.simTime * speed) % 1;
      const tNext = Math.min(0.999, t + 0.012);

      const p0 = evaluateCatmullRom(path.points, t);
      const p1 = evaluateCatmullRom(path.points, tNext);

      let tx = p1.x - p0.x;
      let ty = p1.y - p0.y;
      let tz = p1.z - p0.z;
      const tLen = Math.hypot(tx, ty, tz) || 1;
      tx /= tLen;
      ty /= tLen;
      tz /= tLen;

      // Build stable orthogonal frame around tangent for helical swirl offset
      let ux = 0;
      let uy = 1;
      let uz = 0;
      if (Math.abs(ty) > 0.92) {
        ux = 1;
        uy = 0;
        uz = 0;
      }
      // n1 = normalize(cross(tangent, up))
      let n1x = ty * uz - tz * uy;
      let n1y = tz * ux - tx * uz;
      let n1z = tx * uy - ty * ux;
      const n1Len = Math.hypot(n1x, n1y, n1z) || 1;
      n1x /= n1Len;
      n1y /= n1Len;
      n1z /= n1Len;

      // n2 = cross(tangent, n1)
      const n2x = ty * n1z - tz * n1y;
      const n2y = tz * n1x - tx * n1z;
      const n2z = tx * n1y - ty * n1x;

      const angle =
        this.particleThetaOffset[i] +
        t * path.swirlTurns * Math.PI * 2 * (0.65 + swirlScale * 1.15) +
        this.simTime * (path.stream === 'blue' ? 2.1 : -2.1) * swirlScale;

      const swirlR =
        path.swirlRadius *
        this.particleRadialOffset[i] *
        (0.35 + swirlScale * 0.72) *
        (1.0 + 0.1 * pulseWave);

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const px = p0.x + (n1x * cosA + n2x * sinA) * swirlR;
      const py = p0.y + (n1y * cosA + n2y * sinA) * swirlR;
      const pz = p0.z + (n1z * cosA + n2z * sinA) * swirlR;

      this.posArray[i * 3] = px;
      this.posArray[i * 3 + 1] = py;
      this.posArray[i * 3 + 2] = pz;

      // Strong tangential + helical azimuthal velocity so wisps/streaks twist visibly with vorticity
      const swirlVel =
        (0.55 + swirlR * 2.4) * swirlScale * (path.stream === 'blue' ? 1 : -1);
      this.velArray[i * 3] = tx + (-n1x * sinA + n2x * cosA) * swirlVel;
      this.velArray[i * 3 + 1] = ty + (-n1y * sinA + n2y * cosA) * swirlVel;
      this.velArray[i * 3 + 2] = tz + (-n1z * sinA + n2z * cosA) * swirlVel;

      // Smooth fade-in and fade-out at inlets/outlets (never hard pops!)
      const envIn = Math.min(1, t / fade);
      const envOut = Math.min(1, (1 - t) / fade);
      const smoothEnv = Math.min(envIn, envOut);
      // Cubic smoothstep
      const s = smoothEnv * smoothEnv * (3 - 2 * smoothEnv);

      this.metaArray[i * 4] = path.stream === 'blue' ? 0.0 : 1.0;
      this.metaArray[i * 4 + 1] = s;
    }

    this.posAttr.needsUpdate = true;
    this.velAttr.needsUpdate = true;
    this.metaAttr.needsUpdate = true;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
