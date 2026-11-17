import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILT_IN_FLOW_PRESETS,
  clampWindowRect,
  classifyPanelLayout,
  computeSlicePlaneParams,
  computeTangentialPorts,
  computeTwoRodAnchors,
  computeVajraShellSpecs,
  evaluateCatmullRom,
  mergeCustomPresets,
  sanitizeFlowConfig,
} from './geometryMath';

test('432 Stubby Vajra maintains strict 4:3:2 outer diameter ratio and non-colliding hollow shells', () => {
  const spec = computeVajraShellSpecs();
  assert.equal(spec.outerShell.outerRadius * 2, 4);
  assert.equal(spec.middleShell.outerRadius * 2, 3);
  assert.equal(spec.innerShell.outerRadius * 2, 2);

  // Verify hollow wall thickness and clear radial annular gaps
  assert.ok(spec.innerShell.innerRadius > 0.8);
  assert.ok(spec.middleShell.innerRadius > spec.innerShell.outerRadius + 0.35);
  assert.ok(spec.outerShell.innerRadius > spec.middleShell.outerRadius + 0.35);

  // Verify concentric bridge keeps inner and outer flow channels separated
  assert.ok(spec.outerBridgeInnerRadius > spec.innerBridgeOuterRadius + 0.15);
  assert.equal(spec.copingAngleDeg, 51.84);
});

test('Two-rod inner core supports anchor strictly between 2-inch outer wall and 3-inch inner wall', () => {
  const spec = computeVajraShellSpecs();
  const rods = computeTwoRodAnchors(spec);
  assert.equal(rods.length, 2);
  assert.equal(rods[0].id, 'top');
  assert.equal(rods[1].id, 'bottom');
  assert.ok(rods[0].length > 0.3);
  assert.ok(Math.abs(rods[0].centerY + rods[1].centerY) < 1e-6);
});

test('Four perpendicular tangential ports sit toward sphere ends and stay isolated inside cross-section annuli', () => {
  const spec = computeVajraShellSpecs();
  const ports = computeTangentialPorts(spec);
  assert.equal(ports.length, 4);

  const outerPorts = ports.filter((p) => p.layer === 'outer_4_3');
  const innerPorts = ports.filter((p) => p.layer === 'inner_3_2');
  assert.equal(outerPorts.length, 2);
  assert.equal(innerPorts.length, 2);

  for (const p of outerPorts) {
    const dx = Math.abs(p.chamberX) - spec.chamberSpacingHalf;
    assert.ok(dx > 0.8, 'outer ports shifted toward sphere ends');
    const r4Cross = Math.sqrt(spec.outerShell.innerRadius ** 2 - dx ** 2);
    const r3Cross = Math.sqrt(spec.middleShell.outerRadius ** 2 - dx ** 2);
    assert.ok(Math.abs(p.radialOffsetZ) > r3Cross);
    assert.ok(Math.abs(p.radialOffsetZ) < r4Cross);
  }
  for (const p of innerPorts) {
    const dx = Math.abs(p.chamberX) - spec.chamberSpacingHalf;
    assert.ok(dx > 0.5, 'inner ports shifted toward sphere ends');
    const r3Cross = Math.sqrt(spec.middleShell.innerRadius ** 2 - dx ** 2);
    const r2Cross = Math.sqrt(spec.innerShell.outerRadius ** 2 - dx ** 2);
    assert.ok(Math.abs(p.radialOffsetZ) > r2Cross);
    assert.ok(Math.abs(p.radialOffsetZ) < r3Cross);
  }
});

test('Catmull-Rom spline interpolates smoothly between endpoints', () => {
  const pts = [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 2, z: 0 },
    { x: 2, y: 0, z: 1 },
  ];
  const start = evaluateCatmullRom(pts, 0);
  const mid = evaluateCatmullRom(pts, 0.5);
  const end = evaluateCatmullRom(pts, 1);
  assert.ok(Math.abs(start.x - 0) < 1e-6);
  assert.ok(Math.abs(mid.x - 1) < 1e-6 && Math.abs(mid.y - 2) < 1e-6);
  assert.ok(Math.abs(end.x - 2) < 1e-6 && Math.abs(end.z - 1) < 1e-6);
});

test('Slicing plane transitions smoothly from solid (inactive) to deep core', () => {
  const solid = computeSlicePlaneParams('longitudinal', 0);
  assert.equal(solid.active, false);
  assert.ok(solid.constant > 4.6);

  const half = computeSlicePlaneParams('transverse', 63.29);
  assert.equal(half.active, true);
  assert.ok(Math.abs(half.constant) < 0.05);

  const diag = computeSlicePlaneParams('diagonal', 100);
  const normLen = Math.hypot(...diag.normal);
  assert.ok(Math.abs(normLen - 1) < 1e-6);
  assert.ok(diag.constant < 0);
});

test('Window clamping keeps floating windows inside viewport boundaries and clears top navbar', () => {
  const clamped = clampWindowRect(
    { x: 2000, y: -50, width: 340, height: 420 },
    1440,
    900,
    12,
    54
  );
  assert.equal(clamped.x, 1440 - 340 - 12);
  assert.equal(clamped.y, 54);
  assert.equal(clamped.height, 420);

  const shortViewport = clampWindowRect(
    { x: 16, y: 54, width: 312, height: 760 },
    900,
    520,
    12,
    54
  );
  assert.equal(shortViewport.y, 54);
  assert.equal(shortViewport.height, 520 - 54 - 12);
});

test('Panel layout classifier switches cleanly between narrow, medium, and wide tiers', () => {
  assert.equal(classifyPanelLayout(312), 'narrow');
  assert.equal(classifyPanelLayout(430), 'medium');
  assert.equal(classifyPanelLayout(580), 'medium');
  assert.equal(classifyPanelLayout(640), 'wide');
  assert.equal(classifyPanelLayout(820), 'wide');
});

test('Flow preset sanitization and custom merge guard invalid user values', () => {
  const sanitized = sanitizeFlowConfig({
    particleType: 'streaks',
    particleSize: 99,
    opacity: -1,
    pulseHz: 0,
  });
  assert.equal(sanitized.particleType, 'streaks');
  assert.equal(sanitized.particleSize, 2.5);
  assert.equal(sanitized.opacity, 0.15);
  assert.equal(sanitized.pulseHz, 0.4);

  const merged = mergeCustomPresets(
    JSON.stringify([
      {
        id: 'my-custom',
        name: 'Workshop Test',
        builtIn: false,
        config: { particleType: 'dots', elongation: 1.8 },
      },
    ])
  );
  assert.equal(merged.length, BUILT_IN_FLOW_PRESETS.length + 1);
  assert.equal(merged[merged.length - 1].config.particleType, 'dots');
});
