import { useCallback, useEffect, useState } from 'react';
import { ControlsWindow } from './components/ControlsWindow';
import { FloatingWindow } from './components/FloatingWindow';
import { NotesWindow } from './components/NotesWindow';
import { PartInspector } from './components/PartInspector';
import { ThreeViewport } from './components/ThreeViewport';
import {
  BUILT_IN_FLOW_PRESETS,
  DEFAULT_FLOW_CONFIG,
  mergeCustomPresets,
} from './math/geometryMath';
import type {
  DeviceId,
  FlowConfig,
  FlowPreset,
  HoveredPartInfo,
  OptionalLayersState,
  SliceAxis,
} from './types/msaart';

const PRESETS_STORAGE_KEY = 'msaart_custom_flow_presets_v1';

export default function App() {
  const [deviceId, setDeviceId] = useState<DeviceId>('vajra432');
  const [sliceAxis, setSliceAxis] = useState<SliceAxis>('longitudinal');
  const [sliceDepth, setSliceDepth] = useState<number>(0);

  const [flowConfig, setFlowConfig] = useState<FlowConfig>(DEFAULT_FLOW_CONFIG);
  const [presets, setPresets] = useState<FlowPreset[]>(() => {
    if (typeof window === 'undefined') return [...BUILT_IN_FLOW_PRESETS];
    return mergeCustomPresets(window.localStorage.getItem(PRESETS_STORAGE_KEY));
  });
  const [activePresetId, setActivePresetId] = useState<string | null>(
    'laminar-reference'
  );

  const [layers, setLayers] = useState<OptionalLayersState>({
    showOptionalResonators: true,
    showWeldAndCopingGuides: true,
    showSectionGuide: true,
    showCopperGroundingBus: false,
  });

  const [hoveredPart, setHoveredPart] = useState<HoveredPartInfo | null>(null);
  const [pinnedPartId, setPinnedPartId] = useState<string | null>(null);
  const [resetCameraNonce, setResetCameraNonce] = useState<number>(0);
  const [contextLost, setContextLost] = useState<boolean>(false);

  const isMobileViewport =
    typeof window !== 'undefined' && window.innerWidth < 640;
  const isCompactNotesViewport =
    typeof window !== 'undefined' && window.innerWidth < 1120;

  const [controlsOpen, setControlsOpen] = useState<boolean>(true);
  const [controlsMinimized, setControlsMinimized] =
    useState<boolean>(isMobileViewport);
  const [notesOpen, setNotesOpen] = useState<boolean>(true);
  const [notesMinimized, setNotesMinimized] =
    useState<boolean>(isCompactNotesViewport);
  const [focusOrder, setFocusOrder] = useState<{
    controls: number;
    notes: number;
  }>({
    controls: 20,
    notes: 21,
  });

  // Persist custom presets cleanly
  useEffect(() => {
    try {
      const customOnly = presets.filter((p) => !p.builtIn);
      window.localStorage.setItem(
        PRESETS_STORAGE_KEY,
        JSON.stringify(customOnly)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [presets]);

  // If user unchecks optional resonators while viewing one, fall back safely to 432 Vajra
  const handleLayersChange = useCallback(
    (next: OptionalLayersState) => {
      setLayers(next);
      if (
        !next.showOptionalResonators &&
        (deviceId === 'dualCone' || deviceId === 'toroid')
      ) {
        setDeviceId('vajra432');
      }
    },
    [deviceId]
  );

  const handleSelectDevice = useCallback((id: DeviceId) => {
    setDeviceId(id);
    setPinnedPartId(null);
  }, []);

  const handleFlowChange = useCallback((next: FlowConfig) => {
    setFlowConfig(next);
    setActivePresetId(null);
  }, []);

  const handleLoadPreset = useCallback((preset: FlowPreset) => {
    setFlowConfig({ ...preset.config });
    setActivePresetId(preset.id);
  }, []);

  const handleSavePreset = useCallback(
    (name: string) => {
      const id = `custom-${Date.now()}`;
      const newPreset: FlowPreset = {
        id,
        name,
        builtIn: false,
        config: { ...flowConfig },
      };
      setPresets((prev) => [...prev, newPreset]);
      setActivePresetId(id);
    },
    [flowConfig]
  );

  const handleDeletePreset = useCallback(
    (id: string) => {
      setPresets((prev) => prev.filter((p) => p.id !== id));
      if (activePresetId === id) {
        setActivePresetId(null);
      }
    },
    [activePresetId]
  );

  const focusWindow = useCallback((target: 'controls' | 'notes') => {
    setFocusOrder((prev) => {
      const top = Math.max(prev.controls, prev.notes) + 1;
      return { ...prev, [target]: top };
    });
  }, []);

  const initialDesktopWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1440;
  const initialDesktopHeight =
    typeof window !== 'undefined' ? window.innerHeight : 900;

  return (
    <div
      data-device={deviceId}
      data-slice-depth={sliceDepth}
      className="relative w-screen h-screen overflow-hidden bg-[#0B0E14] text-slate-100"
    >
      {/* Top 3-Zone Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 h-11 px-4 flex items-center justify-between gap-8 border-b border-slate-800/80 bg-[#0d1119]/95">
        <span className="text-sm font-semibold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
          MSAART Engineering Workbench
        </span>

        <nav
          aria-label="Primary Hardware Views"
          className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-400"
        >
          <button
            type="button"
            onClick={() => handleSelectDevice('vajra432')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b ${
              deviceId === 'vajra432'
                ? 'text-sky-300 border-sky-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            432 Stubby Vajra
          </button>
          <button
            type="button"
            onClick={() => handleSelectDevice('bubbler')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b ${
              deviceId === 'bubbler'
                ? 'text-sky-300 border-sky-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            UV Bubbler
          </button>
          <button
            type="button"
            onClick={() => handleSelectDevice('system')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b ${
              deviceId === 'system'
                ? 'text-sky-300 border-sky-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            System Flow
          </button>
          {layers.showOptionalResonators && (
            <>
              <button
                type="button"
                onClick={() => handleSelectDevice('dualCone')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b ${
                  deviceId === 'dualCone'
                    ? 'text-sky-300 border-sky-400'
                    : 'border-transparent hover:text-slate-100'
                }`}
              >
                Dual-Cone
              </button>
              <button
                type="button"
                onClick={() => handleSelectDevice('toroid')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b ${
                  deviceId === 'toroid'
                    ? 'text-sky-300 border-sky-400'
                    : 'border-transparent hover:text-slate-100'
                }`}
              >
                Toroid
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-expanded={controlsOpen && !controlsMinimized}
            onClick={() => {
              if (!controlsOpen) {
                setControlsOpen(true);
                setControlsMinimized(false);
              } else {
                setControlsMinimized((m) => !m);
              }
              focusWindow('controls');
            }}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              controlsOpen && !controlsMinimized
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-transparent'
            }`}
          >
            Controls
          </button>
          <button
            type="button"
            aria-expanded={notesOpen && !notesMinimized}
            onClick={() => {
              if (!notesOpen) {
                setNotesOpen(true);
                setNotesMinimized(false);
              } else {
                setNotesMinimized((m) => !m);
              }
              focusWindow('notes');
            }}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
              notesOpen && !notesMinimized
                ? 'bg-sky-500/30 border-sky-400/60 text-white'
                : 'bg-sky-500/20 hover:bg-sky-500/30 border-sky-500/40 text-sky-200'
            }`}
          >
            Notes &amp; Build
          </button>
        </div>
      </header>

      {/* Main Unobstructed 3D Viewport */}
      <main className="w-full h-full pt-11">
        {contextLost ? (
          <div className="w-full h-full flex items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-2 rounded-lg border border-slate-800 bg-slate-900/90 p-6">
              <h1 className="text-base font-semibold text-white">
                WebGL Context Paused
              </h1>
              <p className="text-xs text-slate-400">
                The 3D graphics context was interrupted by the browser. Reload
                the page or switch tabs to restore the studio viewport.
              </p>
            </div>
          </div>
        ) : (
          <ThreeViewport
            deviceId={deviceId}
            sliceAxis={sliceAxis}
            sliceDepth={sliceDepth}
            flowConfig={flowConfig}
            layers={layers}
            pinnedPartId={pinnedPartId}
            resetCameraNonce={resetCameraNonce}
            onHoverPart={setHoveredPart}
            onPinPart={setPinnedPartId}
            onContextLostChange={setContextLost}
          />
        )}
      </main>

      {/* Floating Draggable Controls & Flow Tuner Window */}
      <FloatingWindow
        id="controls"
        title="Controls & Flow Tuner"
        subtitle="304 SS · PMMA"
        initialRect={{
          x: 16,
          y: 56,
          width: 312,
          height: Math.min(760, Math.max(320, initialDesktopHeight - 72)),
        }}
        preferredHeight={760}
        isOpen={controlsOpen}
        isMinimized={controlsMinimized}
        zIndex={focusOrder.controls}
        onFocus={() => focusWindow('controls')}
        onToggleMinimize={() => setControlsMinimized((v) => !v)}
        onClose={() => setControlsOpen(false)}
      >
        <ControlsWindow
          deviceId={deviceId}
          onSelectDevice={handleSelectDevice}
          sliceAxis={sliceAxis}
          onChangeSliceAxis={setSliceAxis}
          sliceDepth={sliceDepth}
          onChangeSliceDepth={setSliceDepth}
          flowConfig={flowConfig}
          onChangeFlowConfig={handleFlowChange}
          presets={presets}
          activePresetId={activePresetId}
          onLoadPreset={handleLoadPreset}
          onSavePreset={handleSavePreset}
          onDeletePreset={handleDeletePreset}
          layers={layers}
          onChangeLayers={handleLayersChange}
          onResetCamera={() => setResetCameraNonce((n) => n + 1)}
        />
      </FloatingWindow>

      {/* Floating Draggable Notes & Interpretations Window */}
      <FloatingWindow
        id="notes"
        title="Notes & Interpretations"
        subtitle="Bendall · Ryan · Maker"
        initialRect={{
          x: Math.max(16, initialDesktopWidth - 348),
          y: 56,
          width: 332,
          height: Math.min(720, Math.max(320, initialDesktopHeight - 72)),
        }}
        preferredHeight={720}
        isOpen={notesOpen}
        isMinimized={notesMinimized}
        zIndex={focusOrder.notes}
        onFocus={() => focusWindow('notes')}
        onToggleMinimize={() => setNotesMinimized((v) => !v)}
        onClose={() => setNotesOpen(false)}
      >
        <NotesWindow />
      </FloatingWindow>

      {/* Hover Preview & Click-to-Pin Contextual Pop-ups */}
      <PartInspector
        hoveredPart={hoveredPart}
        pinnedPartId={pinnedPartId}
        onClosePin={() => setPinnedPartId(null)}
      />
    </div>
  );
}
