import type {
  FlowConfig,
  FlowPreset,
  SliceAxis,
  WindowRect,
} from '../types/msaart';

export interface ShellSpec {
  label: string;
  outerRadius: number;
  innerRadius: number;
  wallThickness: number;
}

export interface VajraGeometrySpec {
  outerShell: ShellSpec;
  middleShell: ShellSpec;
  innerShell: ShellSpec;
  chamberSpacingHalf: number;
  innerBridgeOuterRadius: number;
  innerBridgeInnerRadius: number;
  outerBridgeOuterRadius: number;
  outerBridgeInnerRadius: number;
  supportRodRadius: number;
  copingAngleDeg: number;
}

export interface TangentialPortSpec {
  id: string;
  layer: 'outer_4_3' | 'inner_3_2';
  role: 'inlet' | 'outlet';
  stream: 'blue' | 'orange';
  chamberX: number;
  radialOffsetZ: number;
  axisDirectionY: 1 | -1;
  portOuterRadius: number;
  portInnerRadius: number;
  startY: number;
  endY: number;
}

export const DEFAULT_FLOW_CONFIG: FlowConfig = {
  streamFilter: 'both',
  isPlaying: true,
  pulseHz: 2.4,
  particleType: 'wisps',
  particleSize: 1.0,
  opacity: 0.86,
  fadeDistance: 0.14,
  elongation: 0.55,
  swirlIntensity: 0.68,
};

export const BUILT_IN_FLOW_PRESETS: FlowPreset[] = [
  {
    id: 'laminar-reference',
    name: 'Laminar Reference',
    builtIn: true,
    config: { ...DEFAULT_FLOW_CONFIG },
  },
  {
    id: 'cavitation-surge',
    name: 'Cavitation Surge',
    builtIn: true,
    config: {
      streamFilter: 'both',
      isPlaying: true,
      pulseHz: 4.5,
      particleType: 'dots',
      particleSize: 1.15,
      opacity: 0.92,
      fadeDistance: 0.1,
      elongation: 0.25,
      swirlIntensity: 0.95,
    },
  },
  {
    id: 'plasmoid-filament',
    name: 'Plasmoid Filament',
    builtIn: true,
    config: {
      streamFilter: 'both',
      isPlaying: true,
      pulseHz: 3.1,
      particleType: 'streaks',
      particleSize: 0.95,
      opacity: 0.9,
      fadeDistance: 0.18,
      elongation: 1.45,
      swirlIntensity: 1.15,
    },
  },
];

/**
 * Computes physically non-intersecting 4:3:2 hollow shell radii (1 unit = 1 inch)
 * matching commercial 304 SS gazing sphere / industrial tank-cap wall gauges.
 */
export function computeVajraShellSpecs(): VajraGeometrySpec {
  const outerShell: ShellSpec = {
    label: '4-Inch Outer Shell',
    outerRadius: 2.0,
    innerRadius: 1.905,
    wallThickness: 0.095,
  };
  const middleShell: ShellSpec = {
    label: '3-Inch Middle Shell',
    outerRadius: 1.5,
    innerRadius: 1.415,
    wallThickness: 0.085,
  };
  const innerShell: ShellSpec = {
    label: '2-Inch Hollow Inner Core',
    outerRadius: 1.0,
    innerRadius: 0.925,
    wallThickness: 0.075,
  };

  return {
    outerShell,
    middleShell,
    innerShell,
    chamberSpacingHalf: 2.9,
    innerBridgeOuterRadius: 0.36,
    innerBridgeInnerRadius: 0.295,
    outerBridgeOuterRadius: 0.66,
    outerBridgeInnerRadius: 0.595,
    supportRodRadius: 0.0625, // 1/8" ER308L TIG rod
    copingAngleDeg: 51.84,
  };
}

/**
 * Returns the two opposing 304 SS support rod endpoints anchoring the hollow 2" core
 * concentrically inside the 3" middle shell.
 */
export function computeTwoRodAnchors(spec: VajraGeometrySpec): Array<{
  id: 'top' | 'bottom';
  startY: number;
  endY: number;
  length: number;
  centerY: number;
}> {
  const rInnerOuter = spec.innerShell.outerRadius - 0.01;
  const rMidInner = spec.middleShell.innerRadius + 0.01;
  const length = rMidInner - rInnerOuter;
  const center = (rInnerOuter + rMidInner) * 0.5;
  return [
    {
      id: 'top',
      startY: rInnerOuter,
      endY: rMidInner,
      length,
      centerY: center,
    },
    {
      id: 'bottom',
      startY: -rInnerOuter,
      endY: -rMidInner,
      length,
      centerY: -center,
    },
  ];
}

/**
 * Computes the four perpendicular, radially offset tangential ports on the 432 Stubby Vajra.
 * Ports sit toward the outer ends of their respective spheres (maximizing helical flow path
 * across each chamber and through the concentric bridge), perpendicular to the longitudinal
 * X-axis and radially offset in Z inside each spherical cross-section annulus.
 */
export function computeTangentialPorts(
  spec: VajraGeometrySpec
): TangentialPortSpec[] {
  const xHalf = spec.chamberSpacingHalf;
  // Axial shift toward the outer polar ends of each sphere
  const outerAxialShift = 1.05;
  const innerAxialShift = 0.72;

  // Cross-sectional radii at each axial offset so ports stay tangent inside their annulus
  const r4Cross = Math.sqrt(
    spec.outerShell.innerRadius ** 2 - outerAxialShift ** 2
  );
  const r3OuterCross = Math.sqrt(
    spec.middleShell.outerRadius ** 2 - outerAxialShift ** 2
  );
  const outerAnnulusMidR = (r4Cross + r3OuterCross) * 0.5;

  const r3InnerCross = Math.sqrt(
    spec.middleShell.innerRadius ** 2 - innerAxialShift ** 2
  );
  const r2Cross = Math.sqrt(
    spec.innerShell.outerRadius ** 2 - innerAxialShift ** 2
  );
  const innerAnnulusMidR = (r3InnerCross + r2Cross) * 0.5;

  return [
    {
      id: 'outer_inlet',
      layer: 'outer_4_3',
      role: 'inlet',
      stream: 'blue',
      chamberX: -(xHalf + outerAxialShift),
      radialOffsetZ: outerAnnulusMidR,
      axisDirectionY: -1,
      portOuterRadius: 0.21,
      portInnerRadius: 0.155,
      startY: 2.35,
      endY: 0.35,
    },
    {
      id: 'outer_outlet',
      layer: 'outer_4_3',
      role: 'outlet',
      stream: 'blue',
      chamberX: xHalf + outerAxialShift,
      radialOffsetZ: -outerAnnulusMidR,
      axisDirectionY: 1,
      portOuterRadius: 0.21,
      portInnerRadius: 0.155,
      startY: -0.35,
      endY: -2.35,
    },
    {
      id: 'inner_inlet',
      layer: 'inner_3_2',
      role: 'inlet',
      stream: 'orange',
      chamberX: xHalf + innerAxialShift,
      radialOffsetZ: innerAnnulusMidR,
      axisDirectionY: 1,
      portOuterRadius: 0.175,
      portInnerRadius: 0.125,
      startY: -2.2,
      endY: -0.25,
    },
    {
      id: 'inner_outlet',
      layer: 'inner_3_2',
      role: 'outlet',
      stream: 'orange',
      chamberX: -(xHalf + innerAxialShift),
      radialOffsetZ: -innerAnnulusMidR,
      axisDirectionY: -1,
      portOuterRadius: 0.175,
      portInnerRadius: 0.125,
      startY: 0.25,
      endY: 2.2,
    },
  ];
}

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Evaluates a smooth Catmull-Rom 3D spline at parameter t in [0, 1].
 */
export function evaluateCatmullRom(points: Point3[], t: number): Point3 {
  if (points.length === 0) return { x: 0, y: 0, z: 0 };
  if (points.length === 1) return { ...points[0] };

  const clampedT = Math.max(0, Math.min(1, t));
  const segments = points.length - 1;
  const scaled = clampedT * segments;
  const idx = Math.min(segments - 1, Math.floor(scaled));
  const u = scaled - idx;

  const p0 = points[Math.max(0, idx - 1)];
  const p1 = points[idx];
  const p2 = points[Math.min(points.length - 1, idx + 1)];
  const p3 = points[Math.min(points.length - 1, idx + 2)];

  const u2 = u * u;
  const u3 = u2 * u;

  const interp = (a: number, b: number, c: number, d: number) =>
    0.5 *
    (2 * b +
      (-a + c) * u +
      (2 * a - 5 * b + 4 * c - d) * u2 +
      (-a + 3 * b - 3 * c + d) * u3);

  return {
    x: interp(p0.x, p1.x, p2.x, p3.x),
    y: interp(p0.y, p1.y, p2.y, p3.y),
    z: interp(p0.z, p1.z, p2.z, p3.z),
  };
}

/**
 * Computes slicing plane normal and constant for Three.js Plane(normal, constant).
 * depthPct = 0 leaves the object 100% solid (plane pushed clear outside bounds);
 * depthPct = 100 cuts deeply past the core axis.
 */
export function computeSlicePlaneParams(
  axis: SliceAxis,
  depthPct: number,
  boundsRadius = 4.6
): { normal: [number, number, number]; constant: number; active: boolean } {
  const clamped = Math.max(0, Math.min(100, depthPct));
  const active = clamped > 0.5;

  let normal: [number, number, number];
  if (axis === 'longitudinal') {
    normal = [0, 0, -1];
  } else if (axis === 'transverse') {
    normal = [-1, 0, 0];
  } else {
    const inv = 1 / Math.SQRT2;
    normal = [-inv * 0.5, -inv * 0.5, -inv];
    const len = Math.hypot(normal[0], normal[1], normal[2]);
    normal = [normal[0] / len, normal[1] / len, normal[2] / len];
  }

  // At 0% -> constant = +boundsRadius (nothing clipped).
  // At 50% -> constant = 0 (exact centerline cut).
  // At 100% -> constant = -boundsRadius * 0.58 (deep core cutaway).
  const t = clamped / 100;
  const constant =
    t <= 0.005
      ? boundsRadius * 1.5
      : boundsRadius * (1 - t * 1.58);

  return { normal, constant, active };
}

export type PanelLayoutMode = 'narrow' | 'medium' | 'wide';

/**
 * Classifies a floating window's interior width into layout tiers so menu contents
 * reorganize dynamically into multi-column grids as the user resizes the panel.
 */
export function classifyPanelLayout(width: number): PanelLayoutMode {
  if (width >= 640) return 'wide';
  if (width >= 430) return 'medium';
  return 'narrow';
}

/**
 * Clamps a floating window's (x, y, width, height) strictly inside the current viewport.
 */
export function clampWindowRect(
  rect: WindowRect,
  viewportWidth: number,
  viewportHeight: number,
  margin = 12,
  topMargin = margin
): WindowRect {
  const safeW = Math.min(rect.width, Math.max(220, viewportWidth - margin * 2));
  const safeTop = Math.max(margin, topMargin);
  const maxAvailableH = Math.max(44, viewportHeight - safeTop - margin);
  const safeH = Math.min(Math.max(44, rect.height), maxAvailableH);
  const maxX = Math.max(margin, viewportWidth - safeW - margin);
  const maxY = Math.max(safeTop, viewportHeight - safeH - margin);
  return {
    x: Math.round(Math.max(margin, Math.min(maxX, rect.x))),
    y: Math.round(Math.max(safeTop, Math.min(maxY, rect.y))),
    width: Math.round(safeW),
    height: Math.round(safeH),
  };
}

export function sanitizeFlowConfig(partial: Partial<FlowConfig>): FlowConfig {
  const clampNum = (v: unknown, min: number, max: number, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v)
      ? Math.max(min, Math.min(max, v))
      : fallback;

  return {
    streamFilter:
      partial.streamFilter === 'blue' ||
      partial.streamFilter === 'orange' ||
      partial.streamFilter === 'both'
        ? partial.streamFilter
        : DEFAULT_FLOW_CONFIG.streamFilter,
    isPlaying:
      typeof partial.isPlaying === 'boolean'
        ? partial.isPlaying
        : DEFAULT_FLOW_CONFIG.isPlaying,
    pulseHz: clampNum(partial.pulseHz, 0.4, 8.0, DEFAULT_FLOW_CONFIG.pulseHz),
    particleType:
      partial.particleType === 'wisps' ||
      partial.particleType === 'dots' ||
      partial.particleType === 'streaks'
        ? partial.particleType
        : DEFAULT_FLOW_CONFIG.particleType,
    particleSize: clampNum(
      partial.particleSize,
      0.3,
      2.5,
      DEFAULT_FLOW_CONFIG.particleSize
    ),
    opacity: clampNum(partial.opacity, 0.15, 1.0, DEFAULT_FLOW_CONFIG.opacity),
    fadeDistance: clampNum(
      partial.fadeDistance,
      0.02,
      0.4,
      DEFAULT_FLOW_CONFIG.fadeDistance
    ),
    elongation: clampNum(
      partial.elongation,
      0.0,
      2.2,
      DEFAULT_FLOW_CONFIG.elongation
    ),
    swirlIntensity: clampNum(
      partial.swirlIntensity,
      0.0,
      2.0,
      DEFAULT_FLOW_CONFIG.swirlIntensity
    ),
  };
}

export function mergeCustomPresets(rawJson: string | null): FlowPreset[] {
  if (!rawJson) return [...BUILT_IN_FLOW_PRESETS];
  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) return [...BUILT_IN_FLOW_PRESETS];
    const custom: FlowPreset[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        item.config &&
        !BUILT_IN_FLOW_PRESETS.some((b) => b.id === item.id)
      ) {
        custom.push({
          id: item.id,
          name: item.name.trim().slice(0, 36) || 'Custom Preset',
          builtIn: false,
          config: sanitizeFlowConfig(item.config),
        });
      }
    }
    return [...BUILT_IN_FLOW_PRESETS, ...custom];
  } catch {
    return [...BUILT_IN_FLOW_PRESETS];
  }
}
