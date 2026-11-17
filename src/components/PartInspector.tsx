import { Hammer, Layers, PackageCheck, X } from 'lucide-react';
import { PART_NOTES } from '../data/knowledgeBase';
import type { HoveredPartInfo } from '../types/msaart';

interface PartInspectorProps {
  hoveredPart: HoveredPartInfo | null;
  pinnedPartId: string | null;
  onClosePin: () => void;
}

const CLASS_LABEL: Record<string, { text: string; tone: string }> = {
  explicit: {
    text: 'Explicitly Stated in Notes',
    tone: 'text-sky-300',
  },
  interpreted: {
    text: 'Interpreted Connection',
    tone: 'text-amber-300',
  },
  extrapolated: {
    text: 'Synthesized Extrapolation',
    tone: 'text-indigo-300',
  },
};

export function PartInspector({
  hoveredPart,
  pinnedPartId,
  onClosePin,
}: PartInspectorProps) {
  const hoveredNote = hoveredPart ? PART_NOTES[hoveredPart.partId] : null;
  const pinnedNote = pinnedPartId ? PART_NOTES[pinnedPartId] : null;

  return (
    <>
      {/* Hover Preview Tooltip */}
      {hoveredNote && hoveredPart && hoveredPart.partId !== pinnedPartId && (
        <div
          role="tooltip"
          style={{
            left: `${Math.min(
              window.innerWidth - 290,
              Math.max(12, hoveredPart.screenX + 16)
            )}px`,
            top: `${Math.min(
              window.innerHeight - 110,
              Math.max(54, hoveredPart.screenY + 14)
            )}px`,
          }}
          className="fixed z-40 pointer-events-none w-68 rounded-md border border-slate-700/80 bg-[#0f141f]/95 px-3 py-2 shadow-xl"
        >
          <div className="text-xs font-semibold text-slate-100 leading-tight">
            {hoveredNote.name}
          </div>
          <div className="mt-1 text-[11px] font-mono-tabular text-slate-400">
            {hoveredNote.dimensions}
          </div>
          <div className="mt-1 text-[11px] text-sky-300">
            Click to pin Bendall notes &amp; maker sourcing
          </div>
        </div>
      )}

      {/* Click-to-Pin Contextual Pop-up Card */}
      {pinnedNote && (
        <aside
          data-testid="pinned-part-inspector"
          aria-label={`Component details: ${pinnedNote.name}`}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[min(680px,92vw)] max-h-[42vh] flex flex-col rounded-lg border border-slate-700/75 bg-[#101520]/96 text-slate-100 shadow-2xl overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-slate-800 bg-[#151c2b] shrink-0">
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span
                  className={`font-medium ${CLASS_LABEL[pinnedNote.classification].tone}`}
                >
                  {CLASS_LABEL[pinnedNote.classification].text}
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="font-mono-tabular text-slate-400">
                  {pinnedNote.dimensions}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug">
                {pinnedNote.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                {pinnedNote.materialSpec}
              </p>
            </div>
            <button
              type="button"
              onClick={onClosePin}
              aria-label="Close component inspector"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain workbench-scroll p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <span className="font-semibold text-slate-200">
                  Bendall Concept &amp; Function
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {pinnedNote.functionalPurpose}
                </p>
                <p className="text-slate-400 leading-relaxed">
                  {pinnedNote.bendallNotes}
                </p>
              </div>
              <div className="space-y-2">
                {pinnedNote.garryRyanNotes && (
                  <div className="space-y-0.5">
                    <span className="font-semibold text-sky-200">
                      Garry Ryan Direct Build Notes
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {pinnedNote.garryRyanNotes}
                    </p>
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-200">
                    Maker Workshop Build Ideas
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {pinnedNote.makerBuildIdeas}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                  <PackageCheck size={13} />
                  <span>Cost-Effective Sourcing</span>
                </div>
                <ul className="space-y-1 text-slate-300 leading-relaxed list-disc pl-4">
                  {pinnedNote.sourcingIdeas.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-sky-300">
                  <Hammer size={13} />
                  <span>Workshop Fabrication Tips</span>
                </div>
                <ul className="space-y-1 text-slate-300 leading-relaxed list-disc pl-4">
                  {pinnedNote.fabricationTips.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <Layers size={13} />
                  <span>Alternative Materials</span>
                </div>
                <ul className="space-y-1 text-slate-300 leading-relaxed list-disc pl-4">
                  {pinnedNote.alternativeMaterials.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
