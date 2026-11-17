import * as THREE from 'three';
import type { StudioMaterialLibrary } from '../materials';
import {
  VolumetricParticleFlock,
  type SplineStreamPath,
} from '../particleFlock';
import type { BuiltDeviceAssembly } from './buildVajra432';
import {
  createThickConeFrustum,
  createThickTube,
  tagPart,
} from './geometryHelpers';

export function buildDualConeAssembly(
  materials: StudioMaterialLibrary
): BuiltDeviceAssembly {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const weldGuideGroup = new THREE.Group();

  // Twin opposing 51.84-deg convergent cones (off-the-shelf 4"x1.5" 304 concentric reducers)
  const coneGeo = createThickConeFrustum(2.1, 0.58, 0.09, 3.0, 112);

  const leftCone = new THREE.Mesh(coneGeo, materials.mirror304);
  leftCone.rotation.z = -Math.PI * 0.5;
  leftCone.position.x = -1.72;
  tagPart(leftCone, 'dual_cone_shells', interactables);
  root.add(leftCone);

  const rightCone = new THREE.Mesh(coneGeo, materials.mirror304);
  rightCone.rotation.z = Math.PI * 0.5;
  rightCone.position.x = 1.72;
  tagPart(rightCone, 'dual_cone_shells', interactables);
  root.add(rightCone);

  // Central cylindrical implosion throat collar + end caps
  const throatMesh = new THREE.Mesh(
    createThickTube(0.62, 0.51, 0.56, 96),
    materials.brushed304
  );
  throatMesh.rotation.z = Math.PI * 0.5;
  tagPart(throatMesh, 'dual_cone_throat', interactables);
  root.add(throatMesh);

  // End plates on outer cone mouths
  for (const sx of [-1, 1]) {
    const cap = new THREE.Mesh(
      createThickTube(2.1, 0.25, 0.14, 96),
      materials.brushed304
    );
    cap.rotation.z = Math.PI * 0.5;
    cap.position.x = sx * 3.24;
    tagPart(cap, 'dual_cone_shells', interactables);
    root.add(cap);

    const endStub = new THREE.Mesh(
      createThickTube(0.28, 0.2, 0.85, 64),
      materials.brushed304
    );
    endStub.rotation.z = Math.PI * 0.5;
    endStub.position.x = sx * 3.65;
    tagPart(endStub, 'dual_cone_shells', interactables);
    root.add(endStub);
  }

  // Dual tangential throat ports
  for (const side of [-1, 1]) {
    const tPort = new THREE.Mesh(
      createThickTube(0.22, 0.16, 1.55, 64),
      materials.brushed304
    );
    tPort.position.set(0, side * 0.85, side * 0.48);
    tagPart(tPort, 'dual_cone_throat', interactables);
    root.add(tPort);
  }

  // TIG weld seams
  for (const wx of [-0.26, 0.26]) {
    const w = new THREE.Mesh(
      new THREE.TorusGeometry(0.61, 0.017, 12, 72),
      materials.weldBead
    );
    w.rotation.y = Math.PI * 0.5;
    w.position.x = wx;
    tagPart(w, 'vajra_weld_seams', interactables);
    weldGuideGroup.add(w);
  }
  root.add(weldGuideGroup);
  root.position.y = 2.6;

  const bluePath: SplineStreamPath = {
    stream: 'blue',
    swirlRadius: 0.35,
    swirlTurns: 4.5,
    speed: 0.26,
    weight: 1.0,
    points: [
      { x: -3.9, y: 2.6, z: 0 },
      { x: -2.4, y: 2.6, z: 0.45 },
      { x: -0.6, y: 2.6, z: 0.22 },
      { x: 0.0, y: 2.6, z: 0.0 },
      { x: 0.6, y: 2.6, z: -0.22 },
      { x: 2.4, y: 2.6, z: -0.45 },
      { x: 3.9, y: 2.6, z: 0 },
    ],
  };

  const orangePath: SplineStreamPath = {
    stream: 'orange',
    swirlRadius: 0.24,
    swirlTurns: -5.0,
    speed: 0.28,
    weight: 1.0,
    points: [
      { x: 0.0, y: 4.15, z: 0.48 },
      { x: 0.0, y: 2.95, z: 0.48 },
      { x: 0.9, y: 2.6, z: 0.0 },
      { x: 0.0, y: 2.6, z: -0.35 },
      { x: -0.9, y: 2.6, z: 0.0 },
      { x: 0.0, y: 2.25, z: -0.48 },
      { x: 0.0, y: 1.05, z: -0.48 },
    ],
  };

  const flock = new VolumetricParticleFlock([bluePath, orangePath], 920);

  return {
    root,
    interactables,
    flock,
    weldGuideGroup,
    boundsRadius: 4.6,
    cameraPosition: new THREE.Vector3(6.4, 4.9, 9.2),
    cameraTarget: new THREE.Vector3(0, 2.6, 0),
  };
}

export function buildToroidAssembly(
  materials: StudioMaterialLibrary
): BuiltDeviceAssembly {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const weldGuideGroup = new THREE.Group();
  const copperBusGroup = new THREE.Group();

  const majorR = 2.45;
  const minorOuterR = 0.62;
  const minorInnerR = 0.53;

  // Closed thick-walled torus (outer + inner surface via smooth TorusGeometry pair)
  const outerTorus = new THREE.Mesh(
    new THREE.TorusGeometry(majorR, minorOuterR, 64, 128),
    materials.mirror304
  );
  outerTorus.rotation.x = Math.PI * 0.5;
  tagPart(outerTorus, 'toroid_ring', interactables);
  root.add(outerTorus);

  const innerTorus = new THREE.Mesh(
    new THREE.TorusGeometry(majorR, minorInnerR, 48, 112),
    materials.brushed304
  );
  innerTorus.rotation.x = Math.PI * 0.5;
  tagPart(innerTorus, 'toroid_ring', interactables);
  root.add(innerTorus);

  // 4× 90° mandrel-elbow weld seams
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2;
    const w = new THREE.Mesh(
      new THREE.TorusGeometry(minorOuterR + 0.01, 0.024, 14, 48),
      materials.weldBead
    );
    w.position.set(Math.cos(ang) * majorR, 0, Math.sin(ang) * majorR);
    w.rotation.y = -ang;
    tagPart(w, 'vajra_weld_seams', interactables);
    weldGuideGroup.add(w);
  }

  // Four tangential injection & extraction ports
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + Math.PI / 4;
    const p = new THREE.Mesh(
      createThickTube(0.22, 0.16, 1.35, 64),
      materials.brushed304
    );
    const tx = -Math.sin(ang);
    const tz = Math.cos(ang);
    p.position.set(
      Math.cos(ang) * majorR + tx * 0.65,
      0,
      Math.sin(ang) * majorR + tz * 0.65
    );
    p.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(tx, 0, tz)
    );
    tagPart(p, 'toroid_collector_ports', interactables);
    root.add(p);
  }

  // Optional Copper inductive pickup ring
  const copperRing = new THREE.Mesh(
    new THREE.TorusGeometry(majorR, 0.055, 24, 112),
    materials.copperBus
  );
  copperRing.rotation.x = Math.PI * 0.5;
  copperRing.position.y = minorOuterR + 0.12;
  tagPart(copperRing, 'bubbler_copper_bus', interactables);
  copperBusGroup.add(copperRing);

  root.add(weldGuideGroup);
  root.add(copperBusGroup);
  root.position.y = 2.4;

  // Build circular helical spline loops for Blue & Orange counter-circulating plasmoid streams
  const mkLoop = (
    stream: 'blue' | 'orange',
    dir: 1 | -1,
    yOff: number
  ): SplineStreamPath => {
    const pts = [];
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2 * dir;
      pts.push({
        x: Math.cos(a) * majorR,
        y: 2.4 + yOff,
        z: Math.sin(a) * majorR,
      });
    }
    return {
      stream,
      swirlRadius: 0.24,
      swirlTurns: 8.0,
      speed: 0.22,
      weight: 1.0,
      points: pts,
    };
  };

  const flock = new VolumetricParticleFlock(
    [mkLoop('blue', 1, 0.08), mkLoop('orange', -1, -0.08)],
    920
  );

  return {
    root,
    interactables,
    flock,
    weldGuideGroup,
    copperBusGroup,
    boundsRadius: 4.5,
    cameraPosition: new THREE.Vector3(6.2, 5.6, 8.2),
    cameraTarget: new THREE.Vector3(0, 2.4, 0),
  };
}
