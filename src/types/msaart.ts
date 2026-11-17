export type DeviceId =
  | 'vajra432'
  | 'bubbler'
  | 'system'
  | 'dualCone'
  | 'toroid';

export type SliceAxis = 'longitudinal' | 'transverse' | 'diagonal';

export type StreamFilter = 'both' | 'blue' | 'orange';

export type ParticleType = 'wisps' | 'dots' | 'streaks';

export type EpistemicClass = 'explicit' | 'interpreted' | 'extrapolated';

export interface FlowConfig {
  streamFilter: StreamFilter;
  isPlaying: boolean;
  pulseHz: number;
  particleType: ParticleType;
  particleSize: number;
  opacity: number;
  fadeDistance: number;
  elongation: number;
  swirlIntensity: number;
}

export interface FlowPreset {
  id: string;
  name: string;
  builtIn: boolean;
  config: FlowConfig;
}

export interface OptionalLayersState {
  showOptionalResonators: boolean;
  showWeldAndCopingGuides: boolean;
  showSectionGuide: boolean;
  showCopperGroundingBus: boolean;
}

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PartNoteEntry {
  id: string;
  name: string;
  deviceId: DeviceId | 'shared';
  classification: EpistemicClass;
  materialSpec: string;
  dimensions: string;
  functionalPurpose: string;
  bendallNotes: string;
  garryRyanNotes?: string;
  makerBuildIdeas: string;
  sourcingIdeas: string[];
  fabricationTips: string[];
  alternativeMaterials: string[];
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: EpistemicClass | 'fabrication';
  summary: string;
  details: string[];
  deviceRefs: string[];
}

export interface HoveredPartInfo {
  partId: string;
  screenX: number;
  screenY: number;
}
