import * as THREE from 'three';

export interface StudioMaterialLibrary {
  mirror304: THREE.MeshPhysicalMaterial;
  brushed304: THREE.MeshPhysicalMaterial;
  weldBead: THREE.MeshPhysicalMaterial;
  rod304: THREE.MeshPhysicalMaterial;
  acrylicPMMA: THREE.MeshPhysicalMaterial;
  waterColumn: THREE.MeshPhysicalMaterial;
  ptfeSeal: THREE.MeshPhysicalMaterial;
  copperBus: THREE.MeshPhysicalMaterial;
  uvEmitter: THREE.MeshStandardMaterial;
  siliconeCoupler: THREE.MeshStandardMaterial;
  studioStage: THREE.MeshStandardMaterial;
  sectionGuide: THREE.MeshBasicMaterial;
  updateAnimatedUniforms: (time: number, pulseHz: number) => void;
  setHighlightPart: (partId: string | null) => void;
  dispose: () => void;
}

function createBrushedMetalMaps(maxAnisotropy: number): {
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#505050';
  rCtx.fillRect(0, 0, size, size);

  // Subtle deterministic brushed satin grain lines
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 2200; i++) {
    const y = rand() * size;
    const h = 0.5 + rand() * 0.9;
    const vBump = Math.floor(120 + rand() * 16);
    bCtx.fillStyle = `rgb(${vBump},${vBump},${vBump})`;
    bCtx.fillRect(0, y, size, h);

    const vRough = Math.floor(68 + rand() * 32);
    rCtx.fillStyle = `rgb(${vRough},${vRough},${vRough})`;
    rCtx.fillRect(0, y, size, h);
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 3);
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(3, 3);
  roughnessMap.anisotropy = maxAnisotropy;

  return { bumpMap, roughnessMap };
}

function createStageGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0e121a';
  ctx.fillRect(0, 0, size, size);

  // Subtle metrology sub-grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1;
  const step = size / 8;
  for (let i = 0; i <= 8; i++) {
    const p = i * step;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  // Primary major line
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Adds crisp solid-wall cutaway backface shading so slicing reveals unmistakable
 * machined metal / acrylic cross-section faces without stencil overhead.
 */
function applyCutawayBackfaceShader(
  material: THREE.MeshPhysicalMaterial,
  cutColorHex: number,
  cacheKey: string
): void {
  const cutColor = new THREE.Color(cutColorHex);
  material.customProgramCacheKey = () => cacheKey;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCutColor = { value: cutColor };
    shader.fragmentShader =
      `uniform vec3 uCutColor;\n` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      if (!gl_FrontFacing) {
        gl_FragColor.rgb = mix(gl_FragColor.rgb * 0.45, uCutColor, 0.72);
      }
      #include <dithering_fragment>
      `
    );
  };
}

export function createStudioMaterialLibrary(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean
): StudioMaterialLibrary {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const { bumpMap, roughnessMap } = createBrushedMetalMaps(maxAniso);
  const stageTex = createStageGridTexture(maxAniso);

  // 1. Mirror-Polished 304 Stainless Steel (Commercial Gazing Sphere finish)
  const mirror304 = new THREE.MeshPhysicalMaterial({
    color: 0xf1f5f9,
    metalness: 1.0,
    roughness: 0.032,
    clearcoat: 0.9,
    clearcoatRoughness: 0.025,
    envMapIntensity: 1.85,
    side: THREE.DoubleSide,
  });
  applyCutawayBackfaceShader(mirror304, 0x94a3b8, 'cut-mirror304');

  // 2. Brushed / Satin 304 Stainless Pipe Stock & End Plates
  const brushed304 = new THREE.MeshPhysicalMaterial({
    color: 0xd6dee8,
    metalness: 0.96,
    roughness: 0.22,
    roughnessMap,
    bumpMap,
    bumpScale: 0.0024,
    anisotropy: 0.85,
    anisotropyRotation: 0,
    envMapIntensity: 1.4,
    side: THREE.DoubleSide,
  });
  applyCutawayBackfaceShader(brushed304, 0x64748b, 'cut-brushed304');

  // 3. TIG ER308L Weld Bead (metallic silver with subtle heat-affected tint)
  const weldBead = new THREE.MeshPhysicalMaterial({
    color: 0xd7d2c8,
    metalness: 0.95,
    roughness: 0.22,
    bumpMap,
    bumpScale: 0.008,
    envMapIntensity: 1.35,
    side: THREE.DoubleSide,
  });

  // 4. 304 Support Rods
  const rod304 = new THREE.MeshPhysicalMaterial({
    color: 0xdde5ee,
    metalness: 0.95,
    roughness: 0.16,
    anisotropy: 0.65,
    envMapIntensity: 1.35,
    side: THREE.DoubleSide,
  });

  // 5. Clear Cast Acrylic (PMMA, IOR ~1.49) with optical Fresnel edge refraction
  const acrylicPMMA = new THREE.MeshPhysicalMaterial({
    color: 0xeaf6ff,
    metalness: 0.0,
    roughness: 0.04,
    ior: 1.49,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    transmission: isSoftwareGl ? 0 : 0.9,
    thickness: 0.35,
    attenuationColor: new THREE.Color(0xdcf4ff),
    attenuationDistance: 4.5,
    transparent: true,
    opacity: isSoftwareGl ? 0.24 : 0.98,
    depthWrite: false,
    envMapIntensity: 1.35,
    side: THREE.DoubleSide,
  });

  acrylicPMMA.customProgramCacheKey = () =>
    isSoftwareGl ? 'acrylic-sw' : 'acrylic-gpu';
  acrylicPMMA.onBeforeCompile = (shader) => {
    shader.uniforms.uIsSw = { value: isSoftwareGl ? 1.0 : 0.0 };
    shader.fragmentShader =
      `uniform float uIsSw;\n` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      vec3 viewDirNorm = normalize(vViewPosition);
      float fresnelTerm = pow(1.0 - abs(dot(normal, viewDirNorm)), 2.6);
      gl_FragColor.rgb += vec3(0.55, 0.85, 1.0) * fresnelTerm * 0.35;
      if (uIsSw > 0.5) {
        gl_FragColor.a = clamp(0.18 + fresnelTerm * 0.62, 0.18, 0.82);
      }
      if (!gl_FrontFacing) {
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.58, 0.88, 1.0), 0.55);
        gl_FragColor.a = max(gl_FragColor.a, 0.68);
      }
      #include <dithering_fragment>
      `
    );
  };

  // 6. Animated Ambient Cavitation Water Column
  const waterTimeUniform = { value: 0 };
  const waterPulseUniform = { value: 2.4 };
  const waterColumn = new THREE.MeshPhysicalMaterial({
    color: 0x1e6091,
    roughness: 0.07,
    metalness: 0.02,
    ior: 1.333,
    clearcoat: 0.9,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    envMapIntensity: 1.2,
    side: THREE.DoubleSide,
  });
  waterColumn.customProgramCacheKey = () => 'water-meniscus';
  waterColumn.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = waterTimeUniform;
    shader.uniforms.uPulseHz = waterPulseUniform;
    shader.vertexShader =
      `uniform float uTime;\nuniform float uPulseHz;\n` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // Animate top meniscus height & radial standing capillary wave
      if (position.y > 0.0) {
        float radial = length(position.xz);
        float omega = uPulseHz * 6.2831853;
        float surge = sin(uTime * omega) * 0.055;
        float ripple = cos(radial * 4.5 - uTime * omega * 1.5) * 0.032;
        transformed.y += surge + ripple * smoothstep(0.0, 2.5, radial);
      }
      `
    );
  };

  // 7. PTFE UV-Inert Seal / Insulator
  const ptfeSeal = new THREE.MeshPhysicalMaterial({
    color: 0xf1f5f9,
    metalness: 0.0,
    roughness: 0.36,
    clearcoat: 0.25,
    side: THREE.DoubleSide,
  });

  // 8. Pure C110 Copper Grounding / Charge Bus (Optional Layer)
  const copperBus = new THREE.MeshPhysicalMaterial({
    color: 0xd9804e,
    metalness: 0.96,
    roughness: 0.16,
    anisotropy: 0.72,
    clearcoat: 0.25,
    envMapIntensity: 1.35,
    side: THREE.DoubleSide,
  });

  // 9. UV-C Emitter Sleeve Glow
  const uvEmitter = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    emissive: new THREE.Color(0x6366f1),
    emissiveIntensity: 1.85,
    roughness: 0.2,
    metalness: 0.1,
  });

  // 10. High-Temp Fluorosilicone Couplers
  const siliconeCoupler = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.65,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  // 11. Studio Floor Metrology Stage
  const studioStage = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: stageTex,
    roughness: 0.78,
    metalness: 0.18,
  });

  // 12. Subtle Section Plane Guide
  const sectionGuide = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.11,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  return {
    mirror304,
    brushed304,
    weldBead,
    rod304,
    acrylicPMMA,
    waterColumn,
    ptfeSeal,
    copperBus,
    uvEmitter,
    siliconeCoupler,
    studioStage,
    sectionGuide,
    updateAnimatedUniforms(time: number, pulseHz: number) {
      waterTimeUniform.value = time;
      waterPulseUniform.value = pulseHz;
    },
    setHighlightPart(_partId: string | null) {
      // Handled per-mesh outline / emissive pulse in viewport controller
    },
    dispose() {
      bumpMap.dispose();
      roughnessMap.dispose();
      stageTex.dispose();
      mirror304.dispose();
      brushed304.dispose();
      weldBead.dispose();
      rod304.dispose();
      acrylicPMMA.dispose();
      waterColumn.dispose();
      ptfeSeal.dispose();
      copperBus.dispose();
      uvEmitter.dispose();
      siliconeCoupler.dispose();
      studioStage.dispose();
      sectionGuide.dispose();
    },
  };
}
