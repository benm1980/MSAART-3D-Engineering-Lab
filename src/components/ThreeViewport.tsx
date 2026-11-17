import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { computeSlicePlaneParams } from '../math/geometryMath';
import { buildBubblerAssembly } from '../three/builders/buildBubbler';
import {
  buildDualConeAssembly,
  buildToroidAssembly,
} from '../three/builders/buildResonators';
import { buildCoupledSystemAssembly } from '../three/builders/buildSystemFlow';
import {
  buildVajra432Assembly,
  type BuiltDeviceAssembly,
} from '../three/builders/buildVajra432';
import { disposeHierarchy } from '../three/builders/geometryHelpers';
import { createStudioMaterialLibrary } from '../three/materials';
import type {
  DeviceId,
  FlowConfig,
  HoveredPartInfo,
  OptionalLayersState,
  SliceAxis,
} from '../types/msaart';

interface ThreeViewportProps {
  deviceId: DeviceId;
  sliceAxis: SliceAxis;
  sliceDepth: number;
  flowConfig: FlowConfig;
  layers: OptionalLayersState;
  pinnedPartId: string | null;
  resetCameraNonce: number;
  onHoverPart: (info: HoveredPartInfo | null) => void;
  onPinPart: (partId: string | null) => void;
  onContextLostChange?: (lost: boolean) => void;
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    8,
    size * 0.5,
    size * 0.5,
    size * 0.5
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function ThreeViewport({
  deviceId,
  sliceAxis,
  sliceDepth,
  flowConfig,
  layers,
  pinnedPartId,
  resetCameraNonce,
  onHoverPart,
  onPinPart,
  onContextLostChange,
}: ThreeViewportProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Refs keeping React HUD state decoupled from WebGL mount lifecycle
  const propsRef = useRef({
    deviceId,
    sliceAxis,
    sliceDepth,
    flowConfig,
    layers,
    pinnedPartId,
    onHoverPart,
    onPinPart,
    onContextLostChange,
  });
  propsRef.current = {
    deviceId,
    sliceAxis,
    sliceDepth,
    flowConfig,
    layers,
    pinnedPartId,
    onHoverPart,
    onPinPart,
    onContextLostChange,
  };

  const sceneControllerRef = useRef<{
    loadDevice: (id: DeviceId, snapCamera: boolean) => void;
    triggerCameraPreset: () => void;
    updateSliceAndLayers: () => void;
  } | null>(null);

  // Mount Three.js engine once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: isSoftwareGl,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      propsRef.current.onContextLostChange?.(true);
    };
    const handleContextRestored = () => {
      propsRef.current.onContextLostChange?.(false);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e14);
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.014);

    // Rich studio HDR reflection environment: RoomEnvironment + crisp softbox light strips
    const studioEnvScene = new RoomEnvironment();
    const overheadSoftbox = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 5),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(3.8, 4.1, 4.5),
        side: THREE.DoubleSide,
      })
    );
    overheadSoftbox.position.set(0, 9.5, 2.5);
    overheadSoftbox.rotation.x = Math.PI * 0.42;
    studioEnvScene.add(overheadSoftbox);

    const keyStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 10),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(3.2, 2.9, 2.5),
        side: THREE.DoubleSide,
      })
    );
    keyStrip.position.set(9, 4.5, 6);
    keyStrip.lookAt(0, 2, 0);
    studioEnvScene.add(keyStrip);

    const coolRimStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 9),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.4, 2.4, 3.8),
        side: THREE.DoubleSide,
      })
    );
    coolRimStrip.position.set(-9.5, 4.0, -5.5);
    coolRimStrip.lookAt(0, 2, 0);
    studioEnvScene.add(coolRimStrip);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(studioEnvScene, 0.018);
    scene.environment = envTarget.texture;
    studioEnvScene.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 140);
    camera.position.set(6.8, 5.2, 10.4);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.2;
    controls.maxDistance = 34;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 2.65, 0);

    // Warm/Cool 3-point studio lighting + studio softboxes
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.78);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.35);
    keyLight.position.set(8.5, 13.0, 9.0);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 36;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.35);
    rimLight.position.set(-9.0, 7.5, -8.5);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxTop = new THREE.RectAreaLight(0xffffff, 3.6, 10, 4);
      softboxTop.position.set(0, 10.5, 2.0);
      softboxTop.lookAt(0, 2.5, 0);
      scene.add(softboxTop);

      const softboxSide = new THREE.RectAreaLight(0xdbeafe, 2.4, 5, 7);
      softboxSide.position.set(-8.5, 4.5, 5.5);
      softboxSide.lookAt(0, 2.8, 0);
      scene.add(softboxSide);
    }

    const materials = createStudioMaterialLibrary(renderer, isSoftwareGl);

    // Studio floor metrology stage & soft contact shadow disc
    const floorGeo = new THREE.CircleGeometry(36, 96);
    floorGeo.rotateX(-Math.PI * 0.5);
    const floorMesh = new THREE.Mesh(floorGeo, materials.studioStage);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const contactTex = createContactShadowTexture();
    const contactGeo = new THREE.PlaneGeometry(11.5, 8.5);
    contactGeo.rotateX(-Math.PI * 0.5);
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactGeo, contactMat);
    contactShadow.position.y = 0.015;
    scene.add(contactShadow);

    // Clipping plane + subtle section plane guide
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 100);
    materials.mirror304.clippingPlanes = [clippingPlane];
    materials.brushed304.clippingPlanes = [clippingPlane];
    materials.weldBead.clippingPlanes = [clippingPlane];
    materials.rod304.clippingPlanes = [clippingPlane];
    materials.acrylicPMMA.clippingPlanes = [clippingPlane];
    materials.waterColumn.clippingPlanes = [clippingPlane];
    materials.ptfeSeal.clippingPlanes = [clippingPlane];
    materials.copperBus.clippingPlanes = [clippingPlane];
    materials.uvEmitter.clippingPlanes = [clippingPlane];
    materials.siliconeCoupler.clippingPlanes = [clippingPlane];

    const guideGroup = new THREE.Group();
    const guidePlaneGeo = new THREE.PlaneGeometry(13.5, 10.5);
    const guideMesh = new THREE.Mesh(guidePlaneGeo, materials.sectionGuide);
    const guideEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(guidePlaneGeo),
      new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.42,
      })
    );
    guideGroup.add(guideMesh, guideEdges);
    guideGroup.visible = false;
    scene.add(guideGroup);

    // Active assembly container
    let currentAssembly: BuiltDeviceAssembly | null = null;
    const deviceContainer = new THREE.Group();
    scene.add(deviceContainer);

    // Smooth camera preset transition state
    const desiredCamPos = new THREE.Vector3(6.8, 5.2, 8.6);
    const desiredCamTarget = new THREE.Vector3(0, 2.65, 0);
    let transitionActive = false;

    controls.addEventListener('start', () => {
      transitionActive = false;
    });

    const applySliceAndLayers = () => {
      if (!currentAssembly) return;
      const { sliceAxis: ax, sliceDepth: depth, layers: lyr } = propsRef.current;

      const slice = computeSlicePlaneParams(
        ax,
        depth,
        currentAssembly.boundsRadius
      );
      clippingPlane.normal.set(
        slice.normal[0],
        slice.normal[1],
        slice.normal[2]
      );
      clippingPlane.constant = slice.constant;

      // Align subtle visual section guide
      guideGroup.visible = slice.active && lyr.showSectionGuide;
      if (guideGroup.visible) {
        const normalVec = clippingPlane.normal;
        const centerY = currentAssembly.cameraTarget.y;
        const pointOnPlane = normalVec
          .clone()
          .multiplyScalar(-clippingPlane.constant);
        if (ax === 'longitudinal') {
          pointOnPlane.y = centerY;
        } else if (ax === 'transverse') {
          pointOnPlane.y = centerY;
        } else {
          pointOnPlane.y += centerY * 0.35;
        }
        guideGroup.position.copy(pointOnPlane);
        guideGroup.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          normalVec
        );
      }

      if (currentAssembly.weldGuideGroup) {
        currentAssembly.weldGuideGroup.visible = lyr.showWeldAndCopingGuides;
      }
      if (currentAssembly.copperBusGroup) {
        currentAssembly.copperBusGroup.visible = lyr.showCopperGroundingBus;
      }
    };

    const loadDevice = (id: DeviceId, snapCamera: boolean) => {
      if (currentAssembly) {
        deviceContainer.remove(currentAssembly.root);
        deviceContainer.remove(currentAssembly.flock.group);
        disposeHierarchy(currentAssembly.root);
        currentAssembly.flock.dispose();
        currentAssembly = null;
      }

      if (id === 'vajra432') {
        currentAssembly = buildVajra432Assembly(materials);
        contactShadow.scale.set(1.0, 1.0, 1.0);
        contactShadow.position.x = 0;
      } else if (id === 'bubbler') {
        currentAssembly = buildBubblerAssembly(materials);
        contactShadow.scale.set(0.75, 0.75, 0.75);
        contactShadow.position.x = 0;
      } else if (id === 'dualCone') {
        currentAssembly = buildDualConeAssembly(materials);
        contactShadow.scale.set(0.95, 0.85, 0.85);
        contactShadow.position.x = 0;
      } else if (id === 'toroid') {
        currentAssembly = buildToroidAssembly(materials);
        contactShadow.scale.set(0.85, 0.85, 0.85);
        contactShadow.position.x = 0;
      } else {
        currentAssembly = buildCoupledSystemAssembly(materials);
        contactShadow.scale.set(1.65, 1.2, 1.2);
        contactShadow.position.x = -0.8;
      }

      deviceContainer.add(currentAssembly.root);
      deviceContainer.add(currentAssembly.flock.group);

      desiredCamPos.copy(currentAssembly.cameraPosition);
      desiredCamTarget.copy(currentAssembly.cameraTarget);

      if (snapCamera || isSoftwareGl) {
        camera.position.copy(desiredCamPos);
        controls.target.copy(desiredCamTarget);
        controls.update();
        transitionActive = false;
      } else {
        transitionActive = true;
      }

      applySliceAndLayers();
    };

    sceneControllerRef.current = {
      loadDevice,
      triggerCameraPreset() {
        if (!currentAssembly) return;
        desiredCamPos.copy(currentAssembly.cameraPosition);
        desiredCamTarget.copy(currentAssembly.cameraTarget);
        if (isSoftwareGl) {
          camera.position.copy(desiredCamPos);
          controls.target.copy(desiredCamTarget);
          controls.update();
        } else {
          transitionActive = true;
        }
      },
      updateSliceAndLayers: applySliceAndLayers,
    };

    loadDevice(propsRef.current.deviceId, true);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for Hover Preview & Click-to-Pin
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let lastRaycastMs = 0;
    let downX = 0;
    let downY = 0;

    const getHitPart = (clientX: number, clientY: number): string | null => {
      if (!currentAssembly) return null;
      const rect = canvas.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(currentAssembly.interactables, false);
      for (const hit of hits) {
        if (!hit.object.visible) continue;
        // Skip hits on invisible optional parent groups
        let visibleChain = true;
        let cur: THREE.Object3D | null = hit.object;
        while (cur) {
          if (!cur.visible) {
            visibleChain = false;
            break;
          }
          cur = cur.parent;
        }
        if (!visibleChain) continue;
        // If clipping plane is active, skip front-side hits clipped away
        if (
          propsRef.current.sliceDepth > 0.5 &&
          clippingPlane.distanceToPoint(hit.point) < -0.02
        ) {
          continue;
        }
        const pid = hit.object.userData.partId as string | undefined;
        if (pid) return pid;
      }
      return null;
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastRaycastMs < 48) return;
      lastRaycastMs = now;
      const partId = getHitPart(e.clientX, e.clientY);
      canvas.style.cursor = partId ? 'pointer' : 'grab';
      propsRef.current.onHoverPart(
        partId
          ? { partId, screenX: e.clientX, screenY: e.clientY }
          : null
      );
    };

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 6) return; // Was orbit drag
      const partId = getHitPart(e.clientX, e.clientY);
      propsRef.current.onPinPart(partId);
    };

    const onPointerLeave = () => {
      propsRef.current.onHoverPart(null);
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);

    // Resize observer — immediately re-render so resizing never clears the canvas
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', onResize);

    // Render loop: bounded afterDraw on Software WebGL so compositor/screenshots never stall, rAF on GPU
    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let elapsedSim = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const started = performance.now();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED && performance.now() - started < 300) {
          frameId = window.setTimeout(poll, 10);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 210);
        }
      };
      frameId = window.setTimeout(poll, 10);
    }

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.08, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const { flowConfig: fc } = propsRef.current;
      if (fc.isPlaying) {
        elapsedSim += dt;
      }

      if (transitionActive) {
        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          desiredCamPos.x,
          5.5,
          dt
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          desiredCamPos.y,
          5.5,
          dt
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          desiredCamPos.z,
          5.5,
          dt
        );
        controls.target.x = THREE.MathUtils.damp(
          controls.target.x,
          desiredCamTarget.x,
          6.0,
          dt
        );
        controls.target.y = THREE.MathUtils.damp(
          controls.target.y,
          desiredCamTarget.y,
          6.0,
          dt
        );
        controls.target.z = THREE.MathUtils.damp(
          controls.target.z,
          desiredCamTarget.z,
          6.0,
          dt
        );
        if (
          camera.position.distanceTo(desiredCamPos) < 0.02 &&
          controls.target.distanceTo(desiredCamTarget) < 0.02
        ) {
          transitionActive = false;
        }
      }

      controls.update();
      materials.updateAnimatedUniforms(elapsedSim, fc.pulseHz);
      if (currentAssembly) {
        currentAssembly.flock.update(dt, fc);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      if (currentAssembly) {
        disposeHierarchy(currentAssembly.root);
        currentAssembly.flock.dispose();
      }
      floorGeo.dispose();
      contactGeo.dispose();
      contactMat.dispose();
      contactTex.dispose();
      guidePlaneGeo.dispose();
      guideEdges.geometry.dispose();
      (guideEdges.material as THREE.Material).dispose();
      envTarget.dispose();
      materials.dispose();
      controls.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  // Switch active 3D assembly cleanly without tearing down WebGL
  useEffect(() => {
    sceneControllerRef.current?.loadDevice(deviceId, false);
  }, [deviceId]);

  // Reset camera smoothly when triggered
  useEffect(() => {
    if (resetCameraNonce > 0) {
      sceneControllerRef.current?.triggerCameraPreset();
    }
  }, [resetCameraNonce]);

  // Update clipping plane & optional layers immediately
  useEffect(() => {
    sceneControllerRef.current?.updateSliceAndLayers();
  }, [sliceAxis, sliceDepth, layers]);

  return (
    <div
      ref={mountRef}
      data-testid="three-viewport"
      className="w-full h-full relative"
    />
  );
}
