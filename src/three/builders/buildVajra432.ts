import * as THREE from 'three';
import {
  computeTangentialPorts,
  computeTwoRodAnchors,
  computeVajraShellSpecs,
} from '../../math/geometryMath';
import type { StudioMaterialLibrary } from '../materials';
import {
  VolumetricParticleFlock,
  type SplineStreamPath,
} from '../particleFlock';
import {
  createThickSphericalShell,
  createThickTube,
  tagPart,
} from './geometryHelpers';

export interface BuiltDeviceAssembly {
  root: THREE.Group;
  interactables: THREE.Object3D[];
  flock: VolumetricParticleFlock;
  weldGuideGroup?: THREE.Group;
  copperBusGroup?: THREE.Group;
  boundsRadius: number;
  cameraPosition: THREE.Vector3;
  cameraTarget: THREE.Vector3;
}

export function buildVajra432Assembly(
  materials: StudioMaterialLibrary
): BuiltDeviceAssembly {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const weldGuideGroup = new THREE.Group();
  const spec = computeVajraShellSpecs();

  const xLeft = -spec.chamberSpacingHalf;
  const xRight = spec.chamberSpacingHalf;
  const chamberXs = [xLeft, xRight];

  // Shared high-subdivision thick-walled shell geometries (96-112 radial segments)
  const outerShellGeo = createThickSphericalShell(
    spec.outerShell.outerRadius,
    spec.outerShell.innerRadius,
    112,
    64
  );
  const midShellGeo = createThickSphericalShell(
    spec.middleShell.outerRadius,
    spec.middleShell.innerRadius,
    104,
    56
  );
  const innerShellGeo = createThickSphericalShell(
    spec.innerShell.outerRadius,
    spec.innerShell.innerRadius,
    96,
    48
  );

  // Rod & weld geometries
  const anchors = computeTwoRodAnchors(spec);
  const rodGeo = new THREE.CylinderGeometry(
    spec.supportRodRadius,
    spec.supportRodRadius,
    anchors[0].length + 0.04,
    32
  );
  const outerWeldGeo = new THREE.TorusGeometry(
    spec.outerShell.outerRadius + 0.005,
    0.017,
    16,
    112
  );
  const midWeldGeo = new THREE.TorusGeometry(
    spec.middleShell.outerRadius + 0.004,
    0.014,
    14,
    96
  );
  const innerWeldGeo = new THREE.TorusGeometry(
    spec.innerShell.outerRadius + 0.004,
    0.012,
    12,
    96
  );

  for (const cx of chamberXs) {
    // 4" Outer Gazing Shell
    const outerMesh = new THREE.Mesh(outerShellGeo, materials.mirror304);
    outerMesh.position.set(cx, 0, 0);
    tagPart(outerMesh, 'vajra_outer_4', interactables);
    root.add(outerMesh);

    // 3" Middle Partition Shell
    const midMesh = new THREE.Mesh(midShellGeo, materials.brushed304);
    midMesh.position.set(cx, 0, 0);
    tagPart(midMesh, 'vajra_mid_3', interactables);
    root.add(midMesh);

    // 2" Hollow Inner Core Shell (NOT solid)
    const innerMesh = new THREE.Mesh(innerShellGeo, materials.mirror304);
    innerMesh.position.set(cx, 0, 0);
    tagPart(innerMesh, 'vajra_inner_2', interactables);
    root.add(innerMesh);

    // Two opposing 304 SS support rods anchoring hollow 2" core to 3" shell
    for (const anchor of anchors) {
      const rodMesh = new THREE.Mesh(rodGeo, materials.rod304);
      rodMesh.position.set(cx, anchor.centerY, 0);
      tagPart(rodMesh, 'vajra_support_rods', interactables);
      root.add(rodMesh);

      // External rosette-weld pad indicator (part of weld guide layer)
      const rosette = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.025, 24),
        materials.weldBead
      );
      rosette.position.set(
        cx,
        anchor.id === 'top'
          ? spec.middleShell.outerRadius
          : -spec.middleShell.outerRadius,
        0
      );
      tagPart(rosette, 'vajra_weld_seams', interactables);
      weldGuideGroup.add(rosette);
    }

    // Equator TIG weld seams (vertical equator plane YZ -> rotateY Math.PI / 2)
    for (const wGeo of [outerWeldGeo, midWeldGeo, innerWeldGeo]) {
      const w = new THREE.Mesh(wGeo, materials.weldBead);
      w.position.set(cx, 0, 0);
      w.rotation.y = Math.PI * 0.5;
      tagPart(w, 'vajra_weld_seams', interactables);
      weldGuideGroup.add(w);
    }
  }

  // Concentric Tube-inside-a-Tube 304 Stainless Bridge
  // Inner tube connects strictly between the two 3" shells (3"-2" layer)
  const innerBridgeLen = xRight - xLeft - spec.middleShell.innerRadius * 1.82;
  const innerBridgeGeo = createThickTube(
    spec.innerBridgeOuterRadius,
    spec.innerBridgeInnerRadius,
    innerBridgeLen,
    96
  );
  const innerBridgeMesh = new THREE.Mesh(innerBridgeGeo, materials.brushed304);
  innerBridgeMesh.rotation.z = Math.PI * 0.5;
  tagPart(innerBridgeMesh, 'vajra_bridge_concentric', interactables);
  root.add(innerBridgeMesh);

  // Outer concentric sleeve connects strictly between the two 4" shells (4"-3" layer)
  const outerBridgeLen = xRight - xLeft - spec.outerShell.innerRadius * 1.86;
  const outerBridgeGeo = createThickTube(
    spec.outerBridgeOuterRadius,
    spec.outerBridgeInnerRadius,
    outerBridgeLen,
    96
  );
  const outerBridgeMesh = new THREE.Mesh(outerBridgeGeo, materials.brushed304);
  outerBridgeMesh.rotation.z = Math.PI * 0.5;
  tagPart(outerBridgeMesh, 'vajra_bridge_concentric', interactables);
  root.add(outerBridgeMesh);

  // Bridge coping weld rings (51.84° transition collars)
  const collarRingGeo = new THREE.TorusGeometry(
    spec.outerBridgeOuterRadius + 0.006,
    0.017,
    14,
    72
  );
  for (const sx of [-1, 1]) {
    const collar = new THREE.Mesh(collarRingGeo, materials.weldBead);
    collar.position.set(sx * (outerBridgeLen * 0.5), 0, 0);
    collar.rotation.y = Math.PI * 0.5;
    tagPart(collar, 'vajra_weld_seams', interactables);
    weldGuideGroup.add(collar);
  }

  // Four Perpendicular, Radially Offset Tangential Ports near the outer ends of each sphere
  const ports = computeTangentialPorts(spec);
  for (const port of ports) {
    const sphereCenterX = port.chamberX < 0 ? xLeft : xRight;
    const dx = port.chamberX - sphereCenterX;
    const outerIntersectY = Math.sqrt(
      Math.max(
        0.16,
        spec.outerShell.outerRadius ** 2 - dx ** 2 - port.radialOffsetZ ** 2
      )
    );
    const trimmedEndY =
      port.layer === 'outer_4_3'
        ? Math.sign(port.startY) * Math.max(0.35, outerIntersectY * 0.55)
        : Math.sign(port.startY) * 0.28;

    const len = Math.abs(trimmedEndY - port.startY);
    const midY = (port.startY + trimmedEndY) * 0.5;
    const pGeo = createThickTube(
      port.portOuterRadius,
      port.portInnerRadius,
      len,
      72
    );
    const pMesh = new THREE.Mesh(pGeo, materials.brushed304);
    pMesh.position.set(port.chamberX, midY, port.radialOffsetZ);
    tagPart(
      pMesh,
      port.layer === 'outer_4_3' ? 'vajra_ports_outer' : 'vajra_ports_inner',
      interactables
    );
    root.add(pMesh);

    // Tangential TIG coping weld collar aligned to the 3D sphere surface normal
    const hitY = Math.sign(port.startY) * outerIntersectY;
    const surfNormal = new THREE.Vector3(
      dx,
      hitY,
      port.radialOffsetZ
    ).normalize();
    const portCollar = new THREE.Mesh(
      new THREE.TorusGeometry(port.portOuterRadius + 0.004, 0.015, 12, 48),
      materials.weldBead
    );
    portCollar.position.set(port.chamberX, hitY, port.radialOffsetZ);
    portCollar.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      surfNormal
    );
    tagPart(portCollar, 'vajra_weld_seams', interactables);
    weldGuideGroup.add(portCollar);
  }

  root.add(weldGuideGroup);

  // Center assembly cleanly above studio floor
  const yCenter = 2.65;
  root.position.y = yCenter;

  // Multi-turn helical splines: wrap multiple orbital revolutions around each sphere AND
  // tighten into high-vorticity helical ribbons inside the concentric bridge tubes
  const outerShellMidR =
    (spec.outerShell.innerRadius + spec.middleShell.outerRadius) * 0.5;
  const innerShellMidR =
    (spec.middleShell.innerRadius + spec.innerShell.outerRadius) * 0.5;
  const outerBridgeMidR =
    (spec.outerBridgeInnerRadius + spec.innerBridgeOuterRadius) * 0.5;
  const innerBridgeMidR = spec.innerBridgeInnerRadius * 0.62;

  const outerInPort = ports.find((p) => p.id === 'outer_inlet')!;
  const outerOutPort = ports.find((p) => p.id === 'outer_outlet')!;
  const innerInPort = ports.find((p) => p.id === 'inner_inlet')!;
  const innerOutPort = ports.find((p) => p.id === 'inner_outlet')!;

  const buildHelicalPoints = (
    xStart: number,
    xEnd: number,
    steps: number,
    turns: number,
    startAngle: number,
    rFunc: (u: number) => number,
    yCenterOffset: number
  ) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = xStart + (xEnd - xStart) * u;
      const r = rFunc(u);
      const a = startAngle + u * turns * Math.PI * 2;
      pts.push({
        x,
        y: yCenterOffset + Math.sin(a) * r,
        z: Math.cos(a) * r,
      });
    }
    return pts;
  };

  // Blue stream (4"-3" layer): 2.75 wraps in left sphere -> 4.2 high-vorticity turns in outer bridge -> 2.75 wraps in right sphere
  const bluePoints = [
    { x: outerInPort.chamberX, y: yCenter + 2.75, z: outerInPort.radialOffsetZ },
    { x: outerInPort.chamberX, y: yCenter + 1.05, z: outerInPort.radialOffsetZ },
    ...buildHelicalPoints(
      outerInPort.chamberX,
      xLeft + 1.25,
      26,
      2.65,
      0.2,
      (u) => {
        const dx = (outerInPort.chamberX + (xLeft + 1.25 - outerInPort.chamberX) * u) - xLeft;
        const cap = Math.sqrt(Math.max(0.28, outerShellMidR ** 2 - dx * dx * 0.55));
        return cap * (1 - 0.52 * Math.pow(u, 2.2));
      },
      yCenter
    ),
    ...buildHelicalPoints(
      xLeft + 1.15,
      xRight - 1.15,
      28,
      4.25,
      2.85 * Math.PI * 2,
      () => outerBridgeMidR,
      yCenter
    ),
    ...buildHelicalPoints(
      xRight - 1.25,
      outerOutPort.chamberX,
      26,
      2.65,
      7.1 * Math.PI * 2,
      (u) => {
        const dx = (xRight - 1.25 + (outerOutPort.chamberX - (xRight - 1.25)) * u) - xRight;
        const cap = Math.sqrt(Math.max(0.28, outerShellMidR ** 2 - dx * dx * 0.55));
        return outerBridgeMidR + (cap - outerBridgeMidR) * Math.pow(u, 0.48);
      },
      yCenter
    ),
    { x: outerOutPort.chamberX, y: yCenter - 1.05, z: outerOutPort.radialOffsetZ },
    { x: outerOutPort.chamberX, y: yCenter - 2.75, z: outerOutPort.radialOffsetZ },
  ];

  const bluePath: SplineStreamPath = {
    stream: 'blue',
    swirlRadius: 0.13,
    swirlTurns: 10.5,
    speed: 0.17,
    weight: 1.0,
    points: bluePoints,
  };

  // Orange counter-rotating stream (3"-2" layer): 2.75 wraps in right sphere -> 4.5 tight turns in inner bridge -> 2.75 wraps in left sphere
  const orangePoints = [
    { x: innerInPort.chamberX, y: yCenter - 2.6, z: innerInPort.radialOffsetZ },
    { x: innerInPort.chamberX, y: yCenter - 0.75, z: innerInPort.radialOffsetZ },
    ...buildHelicalPoints(
      innerInPort.chamberX,
      xRight - 1.05,
      24,
      -2.65,
      -0.15,
      (u) => {
        const dx = (innerInPort.chamberX + (xRight - 1.05 - innerInPort.chamberX) * u) - xRight;
        const cap = Math.sqrt(Math.max(0.18, innerShellMidR ** 2 - dx * dx * 0.55));
        return cap * (1 - 0.65 * Math.pow(u, 2.0));
      },
      yCenter
    ),
    ...buildHelicalPoints(
      xRight - 0.95,
      xLeft + 0.95,
      28,
      -4.6,
      -2.8 * Math.PI * 2,
      () => innerBridgeMidR,
      yCenter
    ),
    ...buildHelicalPoints(
      xLeft + 1.05,
      innerOutPort.chamberX,
      24,
      -2.65,
      -7.4 * Math.PI * 2,
      (u) => {
        const dx = (xLeft + 1.05 + (innerOutPort.chamberX - (xLeft + 1.05)) * u) - xLeft;
        const cap = Math.sqrt(Math.max(0.18, innerShellMidR ** 2 - dx * dx * 0.55));
        return innerBridgeMidR + (cap - innerBridgeMidR) * Math.pow(u, 0.48);
      },
      yCenter
    ),
    { x: innerOutPort.chamberX, y: yCenter + 0.75, z: innerOutPort.radialOffsetZ },
    { x: innerOutPort.chamberX, y: yCenter + 2.6, z: innerOutPort.radialOffsetZ },
  ];

  const orangePath: SplineStreamPath = {
    stream: 'orange',
    swirlRadius: 0.095,
    swirlTurns: -11.5,
    speed: 0.19,
    weight: 1.0,
    points: orangePoints,
  };

  const flock = new VolumetricParticleFlock([bluePath, orangePath], 1280);

  return {
    root,
    interactables,
    flock,
    weldGuideGroup,
    boundsRadius: 5.5,
    cameraPosition: new THREE.Vector3(6.8, 5.2, 11.2),
    cameraTarget: new THREE.Vector3(0, 2.65, 0),
  };
}
