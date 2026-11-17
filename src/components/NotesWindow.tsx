import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { KNOWLEDGE_ITEMS } from '../data/knowledgeBase';
import type { EpistemicClass } from '../types/msaart';
import { useFloatingWindowLayout } from './FloatingWindow';

type NotesTab = EpistemicClass | 'fabrication';

const TABS: Array<{ id: NotesTab; label: string }> = [
  { id: 'explicit', label: 'Explicit Notes' },
  { id: 'interpreted', label: 'Interpreted' },
  { id: 'fabrication', label: 'Maker & Garry Build' },
  { id: 'extrapolated', label: 'Extrapolated' },
];

export function NotesWindow() {
  const { layoutMode } = useFloatingWindowLayout();
  const isWide = layoutMode === 'wide';
  const isMediumOrWide = layoutMode === 'medium' || layoutMode === 'wide';

  const [activeTab, setActiveTab] = useState<NotesTab>('explicit');
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});

  const items = KNOWLEDGE_ITEMS.filter((item) => item.category === activeTab);
  const allOpen = items.every((item) => !collapsedIds[item.id]);

  const toggleItem = (id: string) => {
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllInTab = () => {
    setCollapsedIds((prev) => {
      const next = { ...prev };
      for (const item of items) {
        next[item.id] = allOpen;
      }
      return next;
    });
  };

  return (
    <div className="space-y-3 text-xs">
      <div
        role="tablist"
        aria-label="Research and interpretation categories"
        className={`grid gap-1 p-1 rounded-md bg-slate-900/90 border border-slate-800 ${
          isMediumOrWide ? 'grid-cols-4' : 'grid-cols-2'
        }`}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`py-1.5 px-2 rounded text-[11px] transition-colors whitespace-nowrap truncate ${
                active
                  ? 'bg-sky-500/20 text-sky-200 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
        <span className="font-mono-tabular">
          {items.length} technical {items.length === 1 ? 'note' : 'notes'}
        </span>
        <button
          type="button"
          onClick={toggleAllInTab}
          className="text-slate-400 hover:text-sky-300 transition-colors"
        >
          {allOpen ? 'Collapse All Notes' : 'Expand All Notes'}
        </button>
      </div>

      <div
        className={`grid gap-3 items-start ${
          isWide ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {items.map((item) => {
          const isOpen = !collapsedIds[item.id];
          return (
            <article
              key={item.id}
              data-testid={`note-card-${item.id}`}
              className="rounded-md border border-slate-800/80 bg-slate-900/35 p-3 space-y-2"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                className="w-full flex items-start justify-between gap-2 text-left group"
              >
                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-[13px] font-semibold text-slate-100 group-hover:text-sky-200 leading-snug transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-mono-tabular text-slate-400 truncate">
                    {item.deviceRefs.join(' · ')}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronDown
                    size={14}
                    className="text-sky-400 shrink-0 mt-0.5"
                  />
                ) : (
                  <ChevronRight
                    size={14}
                    className="text-slate-400 shrink-0 mt-0.5"
                  />
                )}
              </button>

              {isOpen && (
                <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                  <p className="text-slate-300 leading-relaxed">
                    {item.summary}
                  </p>
                  <ul className="space-y-1 pt-0.5 text-slate-400 leading-relaxed list-disc pl-4">
                    {item.details.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
