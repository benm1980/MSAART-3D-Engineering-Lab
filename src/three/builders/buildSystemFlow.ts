import * as THREE from 'three';
import type { StudioMaterialLibrary } from '../materials';
import {
  VolumetricParticleFlock,
  type SplineStreamPath,
} from '../particleFlock';
import { buildBubblerAssembly } from './buildBubbler';
import {
  buildVajra432Assembly,
  type BuiltDeviceAssembly,
} from './buildVajra432';
import { createThickTube, tagPart } from './geometryHelpers';

export function buildCoupledSystemAssembly(
  materials: StudioMaterialLibrary
): BuiltDeviceAssembly {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const weldGuideGroup = new THREE.Group();
  const copperBusGroup = new THREE.Group();

  // Position UV+Bubbler on the left (-4.6) and 432 Stubby Vajra on the right (+2.8)
  const bubbler = buildBubblerAssembly(materials);
  bubbler.root.position.set(-4.8, 0, 0);
  bubbler.root.scale.setScalar(0.72);
  root.add(bubbler.root);
  interactables.push(...bubbler.interactables);
  if (bubbler.weldGuideGroup) weldGuideGroup.add(bubbler.weldGuideGroup);
  if (bubbler.copperBusGroup) copperBusGroup.add(bubbler.copperBusGroup);

  const vajra = buildVajra432Assembly(materials);
  vajra.root.position.set(2.8, 2.55, 0);
  vajra.root.scale.setScalar(0.84);
  root.add(vajra.root);
  interactables.push(...vajra.interactables);
  if (vajra.weldGuideGroup) weldGuideGroup.add(vajra.weldGuideGroup);

  // Coupled Transfer Manifold: Bubbler top outlet -> smooth 304 curve -> Vajra outer-end inlet
  const transferCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.8 + 1.55 * 0.72, 7.2 * 0.72 + 0.3, 0),
    new THREE.Vector3(-3.3, 6.2, 0.4),
    new THREE.Vector3(-1.3, 5.4, 1.15),
    new THREE.Vector3(2.8 - 3.95 * 0.84, 2.55 + 2.15 * 0.84, 1.34 * 0.84),
  ]);
  const manifoldGeo = new THREE.TubeGeometry(transferCurve, 72, 0.18, 32, false);
  const manifoldMesh = new THREE.Mesh(manifoldGeo, materials.brushed304);
  tagPart(manifoldMesh, 'system_manifold', interactables);
  root.add(manifoldMesh);

  // High-temp fluorosilicone vibration isolator coupler along transfer line
  const couplerPos = transferCurve.getPoint(0.48);
  const couplerDir = transferCurve.getTangent(0.48);
  const couplerMesh = new THREE.Mesh(
    createThickTube(0.23, 0.18, 0.65, 48),
    materials.siliconeCoupler
  );
  couplerMesh.position.copy(couplerPos);
  couplerMesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    couplerDir
  );
  tagPart(couplerMesh, 'system_manifold', interactables);
  root.add(couplerMesh);

  // Engine exhaust pulse input stub feeding Vajra inner-end 3"-2" tangential inlet
  const exhaustPulseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(7.1, 0.55, 1.9),
    new THREE.Vector3(6.4, 0.72, 1.15),
    new THREE.Vector3(2.8 + 3.62 * 0.84, 2.55 - 1.95 * 0.84, 0.96 * 0.84),
  ]);
  const exhaustLine = new THREE.Mesh(
    new THREE.TubeGeometry(exhaustPulseCurve, 48, 0.15, 32, false),
    materials.brushed304
  );
  tagPart(exhaustLine, 'system_manifold', interactables);
  root.add(exhaustLine);

  // End-to-end coupled Blue & Orange streams with enhanced multi-wrap vorticity
  const blueSystemPath: SplineStreamPath = {
    stream: 'blue',
    swirlRadius: 0.14,
    swirlTurns: 9.5,
    speed: 0.14,
    weight: 1.15,
    points: [
      { x: -4.8 - 1.3, y: 6.8, z: 0 },
      { x: -4.8, y: 4.5, z: 0 },
      { x: -4.8, y: 0.9, z: 0 },
      { x: -4.8 + 0.75, y: 2.6, z: 0.5 },
      { x: -4.8 + 1.1, y: 5.4, z: 0.0 },
      { x: -3.2, y: 6.1, z: 0.42 },
      { x: -1.3, y: 5.38, z: 1.15 },
      { x: -0.52, y: 4.35, z: 1.13 },
      { x: 0.36, y: 1.4, z: 0.5 },
      { x: 0.36, y: 3.7, z: -0.8 },
      { x: 1.35, y: 2.85, z: 0.4 },
      { x: 2.8, y: 2.25, z: -0.4 },
      { x: 4.25, y: 2.85, z: 0.4 },
      { x: 5.2, y: 1.55, z: -0.9 },
      { x: 6.12, y: 2.55, z: -1.13 },
      { x: 6.12, y: 0.7, z: -1.13 },
    ],
  };

  const orangeSystemPath: SplineStreamPath = {
    stream: 'orange',
    swirlRadius: 0.1,
    swirlTurns: -10.5,
    speed: 0.19,
    weight: 0.95,
    points: [
      { x: 7.1, y: 0.55, z: 1.9 },
      { x: 5.84, y: 0.9, z: 0.81 },
      { x: 5.24, y: 3.4, z: -0.5 },
      { x: 4.2, y: 2.55, z: 0.25 },
      { x: 2.8, y: 2.75, z: -0.18 },
      { x: 1.4, y: 2.35, z: 0.18 },
      { x: 0.36, y: 1.85, z: -0.65 },
      { x: -0.24, y: 3.55, z: -0.81 },
      { x: -0.24, y: 4.4, z: -0.81 },
    ],
  };

  const flock = new VolumetricParticleFlock(
    [blueSystemPath, orangeSystemPath],
    1300,
    {
      center: { x: -4.8, y: 2.1, z: 0 },
      radius: 1.2,
      height: 2.3,
    }
  );

  return {
    root,
    interactables,
    flock,
    weldGuideGroup,
    copperBusGroup,
    boundsRadius: 8.6,
    cameraPosition: new THREE.Vector3(0.4, 7.4, 15.6),
    cameraTarget: new THREE.Vector3(-0.3, 3.2, 0),
  };
}
