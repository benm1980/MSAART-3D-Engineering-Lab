import {
  ChevronDown,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type {
  DeviceId,
  FlowConfig,
  FlowPreset,
  OptionalLayersState,
  ParticleType,
  SliceAxis,
  StreamFilter,
} from '../types/msaart';
import { useFloatingWindowLayout } from './FloatingWindow';

interface ControlsWindowProps {
  deviceId: DeviceId;
  onSelectDevice: (id: DeviceId) => void;
  sliceAxis: SliceAxis;
  onChangeSliceAxis: (axis: SliceAxis) => void;
  sliceDepth: number;
  onChangeSliceDepth: (depth: number) => void;
  flowConfig: FlowConfig;
  onChangeFlowConfig: (next: FlowConfig) => void;
  presets: FlowPreset[];
  activePresetId: string | null;
  onLoadPreset: (preset: FlowPreset) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  layers: OptionalLayersState;
  onChangeLayers: (next: OptionalLayersState) => void;
  onResetCamera: () => void;
}

type SectionKey = 'assembly' | 'slicing' | 'flow' | 'tuner' | 'layers';

const CORE_DEVICES: Array<{ id: DeviceId; label: string; short: string }> = [
  { id: 'vajra432', label: '432 Stubby Vajra', short: '432 Vajra' },
  { id: 'bubbler', label: 'UV Cavitation Bubbler', short: 'UV Bubbler' },
  { id: 'system', label: 'Coupled System Flow', short: 'System Flow' },
];

const OPTIONAL_DEVICES: Array<{ id: DeviceId; label: string; short: string }> =
  [
    { id: 'dualCone', label: 'Dual-Cone Resonator', short: 'Dual-Cone' },
    { id: 'toroid', label: 'Toroidal Collector', short: 'Toroid' },
  ];

export function ControlsWindow({
  deviceId,
  onSelectDevice,
  sliceAxis,
  onChangeSliceAxis,
  sliceDepth,
  onChangeSliceDepth,
  flowConfig,
  onChangeFlowConfig,
  presets,
  activePresetId,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
  layers,
  onChangeLayers,
  onResetCamera,
}: ControlsWindowProps) {
  const { layoutMode } = useFloatingWindowLayout();
  const isWide = layoutMode === 'wide';
  const isMediumOrWide = layoutMode === 'medium' || layoutMode === 'wide';

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      assembly: true,
      slicing: true,
      flow: true,
      tuner: true,
      layers: true,
    }
  );
  const [presetsOpen, setPresetsOpen] = useState<boolean>(true);
  const [presetName, setPresetName] = useState('');

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allExpanded = Object.values(openSections).every(Boolean);
  const toggleAllSections = () => {
    const next = !allExpanded;
    setOpenSections({
      assembly: next,
      slicing: next,
      flow: next,
      tuner: next,
      layers: next,
    });
  };

  const updateFlow = <K extends keyof FlowConfig>(
    key: K,
    value: FlowConfig[K]
  ) => {
    onChangeFlowConfig({ ...flowConfig, [key]: value });
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = presetName.trim();
    if (!trimmed) return;
    onSavePreset(trimmed);
    setPresetName('');
  };

  const availableDevices = layers.showOptionalResonators
    ? [...CORE_DEVICES, ...OPTIONAL_DEVICES]
    : CORE_DEVICES;

  const activeDevice =
    availableDevices.find((d) => d.id === deviceId) ?? availableDevices[0];
  const activeLayerCount = [
    layers.showOptionalResonators,
    layers.showWeldAndCopingGuides,
    layers.showCopperGroundingBus,
    layers.showSectionGuide,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3 text-xs">
      {/* Compact Header Action Strip */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
        <button
          type="button"
          onClick={toggleAllSections}
          className="text-[11px] font-medium text-slate-400 hover:text-sky-300 transition-colors whitespace-nowrap"
        >
          {allExpanded ? 'Collapse Sub-panels' : 'Expand All Panels'}
        </button>
        <button
          type="button"
          onClick={onResetCamera}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw size={12} />
          Reset View
        </button>
      </div>

      {/* Dynamic Responsive Section Container */}
      <div
        className={`grid gap-3 items-start ${
          isWide ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* 1. Hardware Assembly Selector */}
        <SectionAccordion
          id="assembly"
          title="Hardware Assembly"
          summary={activeDevice.short}
          isOpen={openSections.assembly}
          onToggle={() => toggleSection('assembly')}
          className={isWide ? 'col-span-2' : ''}
        >
          <div
            className={`grid gap-1.5 ${
              isWide
                ? 'grid-cols-3'
                : isMediumOrWide
                  ? 'grid-cols-2'
                  : 'grid-cols-1'
            }`}
          >
            {availableDevices.map((d) => {
              const active = deviceId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onSelectDevice(d.id)}
                  className={`w-full text-left px-3 py-2 rounded-md border transition-colors whitespace-nowrap truncate ${
                    active
                      ? 'bg-sky-500/15 border-sky-400/60 text-sky-200 font-medium'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </SectionAccordion>

        {/* 2. Interactive Cross-Section Slicing */}
        <SectionAccordion
          id="slicing"
          title="Cross-Section Slicing"
          summary={
            sliceDepth === 0
              ? '0% Solid'
              : `${sliceDepth}% · ${sliceAxis.slice(0, 5)}`
          }
          isOpen={openSections.slicing}
          onToggle={() => toggleSection('slicing')}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <label htmlFor="slice-depth-slider" className="text-slate-300">
                Cutaway Depth
              </label>
              <span className="font-mono-tabular text-sky-300">
                {sliceDepth === 0 ? '0% Solid' : `${sliceDepth}%`}
              </span>
            </div>
            <input
              id="slice-depth-slider"
              aria-label="Cross-Section Slicing"
              type="range"
              min={0}
              max={100}
              step={1}
              value={sliceDepth}
              onChange={(e) => onChangeSliceDepth(Number(e.target.value))}
              className="studio-range w-full"
            />
            <div className="grid grid-cols-3 gap-1 p-1 rounded-md bg-slate-900/90 border border-slate-800">
              {(['longitudinal', 'transverse', 'diagonal'] as SliceAxis[]).map(
                (axis) => (
                  <button
                    key={axis}
                    type="button"
                    onClick={() => onChangeSliceAxis(axis)}
                    className={`py-1.5 px-1 rounded text-[10.5px] capitalize transition-colors whitespace-nowrap text-center ${
                      sliceAxis === axis
                        ? 'bg-slate-700 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {axis}
                  </button>
                )
              )}
            </div>
          </div>
        </SectionAccordion>

        {/* 3. Volumetric Stream & Pulse Controls */}
        <SectionAccordion
          id="flow"
          title="Flow & Pulse Cadence"
          summary={`${flowConfig.pulseHz.toFixed(1)} Hz · ${flowConfig.streamFilter}`}
          isOpen={openSections.flow}
          onToggle={() => toggleSection('flow')}
        >
          <div className="space-y-2.5">
            <div
              className={`flex gap-2 ${
                isMediumOrWide ? 'items-center justify-between' : 'flex-col'
              }`}
            >
              <div className="flex-1 grid grid-cols-3 gap-1 p-1 rounded-md bg-slate-900/90 border border-slate-800">
                {(['both', 'blue', 'orange'] as StreamFilter[]).map((sf) => (
                  <button
                    key={sf}
                    type="button"
                    onClick={() => updateFlow('streamFilter', sf)}
                    className={`py-1.5 px-1.5 rounded text-[11px] capitalize transition-colors whitespace-nowrap ${
                      flowConfig.streamFilter === sf
                        ? sf === 'blue'
                          ? 'bg-sky-500/25 text-sky-200 font-medium'
                          : sf === 'orange'
                            ? 'bg-orange-500/25 text-orange-200 font-medium'
                            : 'bg-slate-700 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sf}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => updateFlow('isPlaying', !flowConfig.isPlaying)}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors whitespace-nowrap shrink-0"
              >
                {flowConfig.isPlaying ? <Pause size={12} /> : <Play size={12} />}
                {flowConfig.isPlaying ? 'Pause' : 'Resume'}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <label htmlFor="pulse-hz-slider" className="text-slate-300">
                  Engine Pulse Cadence
                </label>
                <span className="font-mono-tabular text-slate-200">
                  {flowConfig.pulseHz.toFixed(1)} Hz
                </span>
              </div>
              <input
                id="pulse-hz-slider"
                type="range"
                min={0.4}
                max={8.0}
                step={0.1}
                value={flowConfig.pulseHz}
                onChange={(e) => updateFlow('pulseHz', Number(e.target.value))}
                className="studio-range w-full"
              />
            </div>
          </div>
        </SectionAccordion>

        {/* 4. Advanced Particle-Flock Tuner & Presets */}
        <SectionAccordion
          id="tuner"
          title="Particle-Flock Tuner"
          summary={`${flowConfig.particleType} · ${flowConfig.particleSize.toFixed(1)}×`}
          isOpen={openSections.tuner}
          onToggle={() => toggleSection('tuner')}
          className={isWide ? 'col-span-2' : ''}
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-300">Particle Style</span>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-md bg-slate-900/90 border border-slate-800">
                {(['wisps', 'dots', 'streaks'] as ParticleType[]).map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => updateFlow('particleType', pt)}
                    className={`py-1.5 px-2 rounded text-[11px] capitalize transition-colors whitespace-nowrap ${
                      flowConfig.particleType === pt
                        ? 'bg-sky-500/20 text-sky-200 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders intelligently adapt from 1-col to 2-col or 3-col */}
            <div
              className={`grid gap-x-4 gap-y-2.5 ${
                isWide
                  ? 'grid-cols-3'
                  : isMediumOrWide
                    ? 'grid-cols-2'
                    : 'grid-cols-1'
              }`}
            >
              <SliderControl
                id="particle-size-slider"
                label="Particle Size"
                value={flowConfig.particleSize}
                min={0.3}
                max={2.5}
                step={0.05}
                format={(v) => `${v.toFixed(2)}×`}
                onChange={(v) => updateFlow('particleSize', v)}
              />
              <SliderControl
                id="particle-opacity-slider"
                label="Opacity"
                value={flowConfig.opacity}
                min={0.15}
                max={1.0}
                step={0.01}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => updateFlow('opacity', v)}
              />
              <SliderControl
                id="fade-dist-slider"
                label="Inlet / Outlet Fade"
                value={flowConfig.fadeDistance}
                min={0.02}
                max={0.4}
                step={0.01}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => updateFlow('fadeDistance', v)}
              />
              <SliderControl
                id="elongation-slider"
                label="Streak Elongation"
                value={flowConfig.elongation}
                min={0.0}
                max={2.2}
                step={0.05}
                format={(v) => v.toFixed(2)}
                onChange={(v) => updateFlow('elongation', v)}
              />
              <SliderControl
                id="swirl-slider"
                label="Swirl Intensity"
                value={flowConfig.swirlIntensity}
                min={0.0}
                max={2.0}
                step={0.05}
                format={(v) => v.toFixed(2)}
                onChange={(v) => updateFlow('swirlIntensity', v)}
              />
            </div>

            {/* Nested Sub-Collapse for Custom Flow Presets */}
            <div className="pt-2 border-t border-slate-800/70 space-y-2">
              <button
                type="button"
                onClick={() => setPresetsOpen((v) => !v)}
                aria-expanded={presetsOpen}
                className="w-full flex items-center justify-between text-left text-[11px] font-medium text-slate-300 hover:text-white"
              >
                <span>Flow Presets ({presets.length})</span>
                {presetsOpen ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </button>

              {presetsOpen && (
                <div
                  className={`grid gap-2 ${
                    isMediumOrWide ? 'grid-cols-2 items-center' : 'grid-cols-1'
                  }`}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map((preset) => {
                      const isActive = activePresetId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          className="inline-flex items-center"
                        >
                          <button
                            type="button"
                            onClick={() => onLoadPreset(preset)}
                            className={`px-2 py-1 rounded text-[11px] border transition-colors whitespace-nowrap ${
                              isActive
                                ? 'bg-sky-500/20 border-sky-400/60 text-sky-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {preset.name}
                          </button>
                          {!preset.builtIn && (
                            <button
                              type="button"
                              onClick={() => onDeletePreset(preset.id)}
                              aria-label={`Delete preset ${preset.name}`}
                              className="ml-0.5 p-1 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSavePreset} className="flex gap-1.5">
                    <input
                      type="text"
                      aria-label="New flow preset name"
                      placeholder="Preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      maxLength={32}
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-[11px] focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-[11px] font-medium whitespace-nowrap shrink-0"
                    >
                      <Save size={11} />
                      Save
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </SectionAccordion>

        {/* 5. Optional & Auxiliary Assembly Layers */}
        <SectionAccordion
          id="layers"
          title="Assembly Layers"
          summary={`${activeLayerCount}/4 active`}
          isOpen={openSections.layers}
          onToggle={() => toggleSection('layers')}
          className={isWide ? 'col-span-2' : ''}
        >
          <div
            className={`grid gap-2 ${
              isMediumOrWide ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            <LayerCheckbox
              id="layer-optional-resonators"
              label="Extrapolated Devices (Dual-Cone & Toroid)"
              checked={layers.showOptionalResonators}
              onChange={(checked) =>
                onChangeLayers({ ...layers, showOptionalResonators: checked })
              }
            />
            <LayerCheckbox
              id="layer-weld-guides"
              label="TIG Weld Seams & 51.84° Coping Collars"
              checked={layers.showWeldAndCopingGuides}
              onChange={(checked) =>
                onChangeLayers({ ...layers, showWeldAndCopingGuides: checked })
              }
            />
            <LayerCheckbox
              id="layer-copper-bus"
              label="Auxiliary Copper Grounding Bus"
              checked={layers.showCopperGroundingBus}
              onChange={(checked) =>
                onChangeLayers({ ...layers, showCopperGroundingBus: checked })
              }
            />
            <LayerCheckbox
              id="layer-section-guide"
              label="Section Plane Guide Reticle"
              checked={layers.showSectionGuide}
              onChange={(checked) =>
                onChangeLayers({ ...layers, showSectionGuide: checked })
              }
            />
          </div>
        </SectionAccordion>
      </div>
    </div>
  );
}

function SectionAccordion({
  id,
  title,
  summary,
  isOpen,
  onToggle,
  className = '',
  children,
}: {
  id: string;
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-testid={`controls-section-${id}`}
      className={`rounded-md border border-slate-800/85 bg-slate-900/35 p-2.5 space-y-2.5 ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-2 text-left font-semibold text-slate-200 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-1.5 min-w-0 truncate">
          {isOpen ? (
            <ChevronDown size={14} className="text-sky-400 shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-slate-400 shrink-0" />
          )}
          <span className="truncate">{title}</span>
        </span>
        <span className="text-[11px] font-mono-tabular font-normal text-slate-400 shrink-0">
          {summary}
        </span>
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

function SliderControl({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-[11px]">
        <label htmlFor={id} className="text-slate-300 truncate">
          {label}
        </label>
        <span className="font-mono-tabular text-slate-200 shrink-0">
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="studio-range w-full"
      />
    </div>
  );
}

function LayerCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-sky-400 focus:ring-sky-500"
      />
      <span>{label}</span>
    </label>
  );
}
