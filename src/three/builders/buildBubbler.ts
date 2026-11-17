import * as THREE from 'three';
import type { StudioMaterialLibrary } from '../materials';
import {
  VolumetricParticleFlock,
  type SplineStreamPath,
} from '../particleFlock';
import type { BuiltDeviceAssembly } from './buildVajra432';
import {
  createThickAnnularDisc,
  createThickTube,
  tagPart,
} from './geometryHelpers';

export function buildBubblerAssembly(
  materials: StudioMaterialLibrary
): BuiltDeviceAssembly {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const copperBusGroup = new THREE.Group();
  const weldGuideGroup = new THREE.Group();

  const tankOuterR = 2.4;
  const tankInnerR = 2.18;
  const tankHeight = 6.8;
  const capThickness = 0.24;
  const basePlateY = 0.35;
  const tankCenterY = basePlateY + capThickness * 0.5 + tankHeight * 0.5;
  const topPlateY = basePlateY + capThickness + tankHeight;

  // 1. Clear Cast Acrylic (PMMA) Cylinder — strictly NO pre-heating coils or jackets!
  const acrylicGeo = createThickTube(tankOuterR, tankInnerR, tankHeight, 112);
  const acrylicMesh = new THREE.Mesh(acrylicGeo, materials.acrylicPMMA);
  acrylicMesh.position.y = tankCenterY;
  acrylicMesh.renderOrder = 12;
  tagPart(acrylicMesh, 'bubbler_acrylic_vessel', interactables);
  root.add(acrylicMesh);

  // 2. Ambient Permanent Water Cavitation Medium + Animated Meniscus
  const waterHeight = 3.85;
  const waterGeo = new THREE.CylinderGeometry(
    tankInnerR - 0.03,
    tankInnerR - 0.03,
    waterHeight,
    96,
    18,
    false
  );
  const waterMesh = new THREE.Mesh(waterGeo, materials.waterColumn);
  waterMesh.position.y = basePlateY + capThickness * 0.5 + waterHeight * 0.5 + 0.02;
  waterMesh.renderOrder = 6;
  tagPart(waterMesh, 'bubbler_water_column', interactables);
  root.add(waterMesh);

  // 3. Laser-Cut 304 SS End Caps + Viton O-Rings + 4 Tie-Rods
  const bottomCapGeo = createThickAnnularDisc(2.95, 0.05, capThickness, 96);
  const bottomCap = new THREE.Mesh(bottomCapGeo, materials.brushed304);
  bottomCap.position.y = basePlateY;
  tagPart(bottomCap, 'bubbler_end_caps', interactables);
  root.add(bottomCap);

  const topCapGeo = createThickAnnularDisc(2.95, 0.28, capThickness, 96);
  const topCap = new THREE.Mesh(topCapGeo, materials.brushed304);
  topCap.position.y = topPlateY;
  tagPart(topCap, 'bubbler_end_caps', interactables);
  root.add(topCap);

  // Captive O-ring seals & 4 threaded 304 tie-rods
  const oRingGeo = new THREE.TorusGeometry(
    (tankOuterR + tankInnerR) * 0.5,
    0.055,
    16,
    96
  );
  for (const ry of [
    basePlateY + capThickness * 0.5 + 0.02,
    topPlateY - capThickness * 0.5 - 0.02,
  ]) {
    const oRing = new THREE.Mesh(oRingGeo, materials.siliconeCoupler);
    oRing.rotation.x = Math.PI * 0.5;
    oRing.position.y = ry;
    tagPart(oRing, 'bubbler_end_caps', interactables);
    root.add(oRing);
  }

  const tieRodLen = tankHeight + capThickness * 2 + 0.35;
  const tieRodGeo = new THREE.CylinderGeometry(0.065, 0.065, tieRodLen, 24);
  const nutGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.11, 6);
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + Math.PI / 4;
    const rx = Math.cos(ang) * 2.66;
    const rz = Math.sin(ang) * 2.66;
    const tie = new THREE.Mesh(tieRodGeo, materials.rod304);
    tie.position.set(rx, tankCenterY, rz);
    tagPart(tie, 'bubbler_end_caps', interactables);
    root.add(tie);

    for (const ny of [basePlateY - 0.16, topPlateY + 0.16]) {
      const nut = new THREE.Mesh(nutGeo, materials.brushed304);
      nut.position.set(rx, ny, rz);
      tagPart(nut, 'bubbler_end_caps', interactables);
      root.add(nut);
    }
  }

  // 4. Top-Mounted 304 Stainless / PTFE UV-C Air-Ionization Spool (NOT Quartz!)
  const uvBaseY = topPlateY + capThickness * 0.5;
  const uvHeight = 2.45;
  const uvSpoolGeo = createThickTube(0.86, 0.72, uvHeight, 96);
  const uvSpool = new THREE.Mesh(uvSpoolGeo, materials.mirror304);
  uvSpool.position.y = uvBaseY + uvHeight * 0.5;
  tagPart(uvSpool, 'bubbler_uv_chamber', interactables);
  root.add(uvSpool);

  // PTFE UV-inert tri-clamp seals & bulkhead cap
  const ptfeRingGeo = createThickAnnularDisc(0.94, 0.25, 0.12, 72);
  for (const py of [uvBaseY + 0.06, uvBaseY + uvHeight + 0.06]) {
    const seal = new THREE.Mesh(ptfeRingGeo, materials.ptfeSeal);
    seal.position.y = py;
    tagPart(seal, 'bubbler_uv_chamber', interactables);
    root.add(seal);
  }

  const uvTopCap = new THREE.Mesh(
    createThickAnnularDisc(0.92, 0.12, 0.14, 72),
    materials.brushed304
  );
  uvTopCap.position.y = uvBaseY + uvHeight + 0.18;
  tagPart(uvTopCap, 'bubbler_uv_chamber', interactables);
  root.add(uvTopCap);

  // Internal 254 nm UV-C Germicidal Lamp Sleeve inside the reflective 304 SS chamber
  const uvLamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, uvHeight * 0.78, 32),
    materials.uvEmitter
  );
  uvLamp.position.set(0.32, uvBaseY + uvHeight * 0.52, 0);
  tagPart(uvLamp, 'bubbler_uv_chamber', interactables);
  root.add(uvLamp);

  // Side air intake stub into top UV conditioning chamber
  const uvIntakeStub = new THREE.Mesh(
    createThickTube(0.24, 0.18, 1.05, 48),
    materials.brushed304
  );
  uvIntakeStub.rotation.z = Math.PI * 0.5;
  uvIntakeStub.position.set(-1.32, uvBaseY + uvHeight * 0.7, 0);
  tagPart(uvIntakeStub, 'bubbler_uv_chamber', interactables);
  root.add(uvIntakeStub);

  // Conditioned outlet port from top plate (above baffles)
  const outletPort = new THREE.Mesh(
    createThickTube(0.26, 0.195, 1.25, 48),
    materials.brushed304
  );
  outletPort.position.set(1.55, topPlateY + 0.62, 0);
  tagPart(outletPort, 'bubbler_end_caps', interactables);
  root.add(outletPort);

  // 5. Central 304 Stainless Dip-Tube
  const dipBottomY = basePlateY + capThickness * 0.5 + 0.55;
  const dipTopY = uvBaseY + 0.95;
  const dipLen = dipTopY - dipBottomY;
  const dipGeo = createThickTube(0.24, 0.175, dipLen, 64);
  const dipTube = new THREE.Mesh(dipGeo, materials.brushed304);
  dipTube.position.y = (dipBottomY + dipTopY) * 0.5;
  tagPart(dipTube, 'bubbler_dip_tube', interactables);
  root.add(dipTube);

  // 6. Submerged Perforated / Sintered Sparger Ring
  const spargerRingGeo = new THREE.TorusGeometry(0.95, 0.13, 24, 72);
  const spargerRing = new THREE.Mesh(spargerRingGeo, materials.brushed304);
  spargerRing.rotation.x = Math.PI * 0.5;
  spargerRing.position.y = dipBottomY + 0.05;
  tagPart(spargerRing, 'bubbler_sparger', interactables);
  root.add(spargerRing);

  // Sparger radial cross-feed tee
  const spargerCross = new THREE.Mesh(
    createThickTube(0.14, 0.09, 1.9, 36),
    materials.brushed304
  );
  spargerCross.rotation.z = Math.PI * 0.5;
  spargerCross.position.y = dipBottomY + 0.05;
  tagPart(spargerCross, 'bubbler_sparger', interactables);
  root.add(spargerCross);

  // 7. Stacked 304 Droplet-Retention / Coalescence Baffles above meniscus
  const baffleYs = [
    basePlateY + waterHeight + 0.72,
    basePlateY + waterHeight + 1.48,
    basePlateY + waterHeight + 2.24,
  ];
  const baffleDiscGeo = createThickAnnularDisc(1.92, 0.25, 0.075, 96);
  const spacerCollarGeo = createThickTube(0.32, 0.25, 0.68, 48);

  baffleYs.forEach((by, idx) => {
    const baffle = new THREE.Mesh(baffleDiscGeo, materials.brushed304);
    baffle.position.y = by;
    tagPart(baffle, 'bubbler_baffles', interactables);
    root.add(baffle);

    // Radial coalescence slots/risers
    for (let s = 0; s < 6; s++) {
      const ang = (s / 6) * Math.PI * 2 + idx * 0.55;
      const lip = new THREE.Mesh(
        createThickTube(0.16, 0.11, 0.14, 32),
        materials.brushed304
      );
      lip.position.set(Math.cos(ang) * 1.15, by + 0.03, Math.sin(ang) * 1.15);
      tagPart(lip, 'bubbler_baffles', interactables);
      root.add(lip);
    }

    if (idx < baffleYs.length - 1) {
      const collar = new THREE.Mesh(spacerCollarGeo, materials.rod304);
      collar.position.y = by + 0.38;
      tagPart(collar, 'bubbler_baffles', interactables);
      root.add(collar);
    }
  });

  // 8. Optional Layer: Auxiliary Copper Grounding / Charge Bus
  const busBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, tankHeight + capThickness * 2, 0.26),
    materials.copperBus
  );
  busBar.position.set(-2.85, tankCenterY, 0);
  tagPart(busBar, 'bubbler_copper_bus', interactables);
  copperBusGroup.add(busBar);
  root.add(copperBusGroup);

  // Optional weld guide ring at UV spool seam
  const uvWeld = new THREE.Mesh(
    new THREE.TorusGeometry(0.87, 0.022, 12, 64),
    materials.weldBead
  );
  uvWeld.rotation.x = Math.PI * 0.5;
  uvWeld.position.y = uvBaseY + 0.12;
  tagPart(uvWeld, 'vajra_weld_seams', interactables);
  weldGuideGroup.add(uvWeld);
  root.add(weldGuideGroup);

  // Volumetric particle-flock streams:
  // Blue: Ambient air -> Top UV ionization spool -> Central dip-tube -> Sparger -> Water/Baffles -> Outlet
  const blueStream: SplineStreamPath = {
    stream: 'blue',
    swirlRadius: 0.16,
    swirlTurns: 3.0,
    speed: 0.22,
    weight: 1.0,
    points: [
      { x: -1.85, y: uvBaseY + uvHeight * 0.7, z: 0 },
      { x: -0.45, y: uvBaseY + uvHeight * 0.65, z: 0.25 },
      { x: 0.0, y: uvBaseY + 1.0, z: 0.0 },
      { x: 0.0, y: topPlateY, z: 0.0 },
      { x: 0.0, y: tankCenterY, z: 0.0 },
      { x: 0.0, y: dipBottomY + 0.1, z: 0.0 },
      { x: 0.92, y: dipBottomY + 0.15, z: 0.35 },
      { x: 0.65, y: basePlateY + waterHeight * 0.7, z: 0.95 },
      { x: -0.5, y: baffleYs[0], z: 0.85 },
      { x: 0.55, y: baffleYs[1], z: -0.65 },
      { x: 1.25, y: baffleYs[2] + 0.2, z: 0.15 },
      { x: 1.55, y: topPlateY + 1.25, z: 0.0 },
    ],
  };

  // Orange: Counter-swirling energized micro-plasmoid / acoustic pressure rebound stream
  const orangeStream: SplineStreamPath = {
    stream: 'orange',
    swirlRadius: 0.32,
    swirlTurns: -2.5,
    speed: 0.2,
    weight: 0.75,
    points: [
      { x: -0.9, y: dipBottomY + 0.2, z: -0.3 },
      { x: -0.6, y: basePlateY + waterHeight * 0.55, z: -1.1 },
      { x: 0.7, y: basePlateY + waterHeight * 0.95, z: -0.6 },
      { x: 0.9, y: baffleYs[0] + 0.25, z: 0.75 },
      { x: 1.3, y: baffleYs[2], z: 0.25 },
      { x: 1.55, y: topPlateY + 1.25, z: 0.0 },
    ],
  };

  const flock = new VolumetricParticleFlock([blueStream, orangeStream], 1050, {
    center: { x: 0, y: basePlateY + waterHeight * 0.55, z: 0 },
    radius: 1.75,
    height: waterHeight * 0.78,
  });

  return {
    root,
    interactables,
    flock,
    copperBusGroup,
    weldGuideGroup,
    boundsRadius: 5.5,
    cameraPosition: new THREE.Vector3(7.6, 6.4, 10.6),
    cameraTarget: new THREE.Vector3(0, 4.7, 0),
  };
}
