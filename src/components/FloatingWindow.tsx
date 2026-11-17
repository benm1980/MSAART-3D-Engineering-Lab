import { Minus, Square, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  clampWindowRect,
  classifyPanelLayout,
  type PanelLayoutMode,
} from '../math/geometryMath';
import type { WindowRect } from '../types/msaart';

const VIEWPORT_MARGIN = 12;
const TOP_NAV_CLEARANCE = 54;
const HEADER_HEIGHT = 44;
const MIN_PANEL_WIDTH = 260;
const MIN_PANEL_HEIGHT = 200;

export interface FloatingWindowLayoutState {
  width: number;
  height: number;
  layoutMode: PanelLayoutMode;
  isResizing: boolean;
}

const FloatingWindowLayoutContext = createContext<FloatingWindowLayoutState>({
  width: 312,
  height: 700,
  layoutMode: 'narrow',
  isResizing: false,
});

export function useFloatingWindowLayout(): FloatingWindowLayoutState {
  return useContext(FloatingWindowLayoutContext);
}

interface FloatingWindowProps {
  id: string;
  title: string;
  subtitle?: string;
  initialRect: WindowRect;
  preferredHeight?: number;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  onFocus: () => void;
  onToggleMinimize: () => void;
  onClose?: () => void;
  children: ReactNode;
}

export function FloatingWindow({
  id,
  title,
  subtitle,
  initialRect,
  preferredHeight,
  isOpen,
  isMinimized,
  zIndex,
  onFocus,
  onToggleMinimize,
  onClose,
  children,
}: FloatingWindowProps) {
  const desiredExpandedHeight =
    preferredHeight ?? Math.max(initialRect.height, 640);

  const [viewport, setViewport] = useState<{ w: number; h: number }>(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));

  const [rect, setRect] = useState<WindowRect>(() =>
    clampWindowRect(
      { ...initialRect, height: desiredExpandedHeight },
      typeof window !== 'undefined' ? window.innerWidth : 1440,
      typeof window !== 'undefined' ? window.innerHeight : 900,
      VIEWPORT_MARGIN,
      TOP_NAV_CLEARANCE
    )
  );

  const [isResizing, setIsResizing] = useState(false);
  const userResizedRef = useRef<boolean>(false);

  const dragRef = useRef<{
    active: boolean;
    offsetX: number;
    offsetY: number;
  }>({ active: false, offsetX: 0, offsetY: 0 });

  const resizeRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  }>({ active: false, startX: 0, startY: 0, startW: 0, startH: 0 });

  // Track live viewport size and keep window anchored safely below the top navbar
  useEffect(() => {
    const syncViewport = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setViewport({ w: vw, h: vh });
      setRect((prev) => {
        const targetH = userResizedRef.current
          ? prev.height
          : desiredExpandedHeight;
        const targetW = userResizedRef.current
          ? prev.width
          : initialRect.width;
        const clamped = clampWindowRect(
          {
            ...prev,
            width: targetW,
            height: isMinimized ? HEADER_HEIGHT : targetH,
          },
          vw,
          vh,
          VIEWPORT_MARGIN,
          TOP_NAV_CLEARANCE
        );
        return {
          x: clamped.x,
          y: clamped.y,
          width: clamped.width,
          height: userResizedRef.current
            ? Math.max(MIN_PANEL_HEIGHT, prev.height)
            : targetH,
        };
      });
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, [desiredExpandedHeight, initialRect.width, isMinimized]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button')) return;
      onFocus();
      dragRef.current = {
        active: true,
        offsetX: e.clientX - rect.x,
        offsetY: e.clientY - rect.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [onFocus, rect.x, rect.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.active) return;
      const effectiveH = isMinimized
        ? HEADER_HEIGHT
        : Math.min(
            rect.height,
            Math.max(
              MIN_PANEL_HEIGHT,
              viewport.h - TOP_NAV_CLEARANCE - VIEWPORT_MARGIN
            )
          );
      const next = clampWindowRect(
        {
          x: e.clientX - dragRef.current.offsetX,
          y: e.clientY - dragRef.current.offsetY,
          width: rect.width,
          height: effectiveH,
        },
        window.innerWidth,
        window.innerHeight,
        VIEWPORT_MARGIN,
        TOP_NAV_CLEARANCE
      );
      setRect((prev) => ({ ...prev, x: next.x, y: next.y }));
    },
    [isMinimized, rect.height, rect.width, viewport.h]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onFocus();
      const maxFitH = Math.max(
        MIN_PANEL_HEIGHT,
        viewport.h - rect.y - VIEWPORT_MARGIN
      );
      const currentH = Math.min(rect.height, maxFitH);
      resizeRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startW: rect.width,
        startH: currentH,
      };
      setIsResizing(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [onFocus, rect.height, rect.width, rect.y, viewport.h]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeRef.current.active) return;
      userResizedRef.current = true;
      const maxW = Math.max(
        MIN_PANEL_WIDTH,
        viewport.w - rect.x - VIEWPORT_MARGIN
      );
      const maxH = Math.max(
        MIN_PANEL_HEIGHT,
        viewport.h - rect.y - VIEWPORT_MARGIN
      );
      const nextW = Math.round(
        Math.max(
          MIN_PANEL_WIDTH,
          Math.min(maxW, resizeRef.current.startW + (e.clientX - resizeRef.current.startX))
        )
      );
      const nextH = Math.round(
        Math.max(
          MIN_PANEL_HEIGHT,
          Math.min(maxH, resizeRef.current.startH + (e.clientY - resizeRef.current.startY))
        )
      );
      setRect((prev) => ({ ...prev, width: nextW, height: nextH }));
    },
    [rect.x, rect.y, viewport.h, viewport.w]
  );

  const handleResizePointerUp = useCallback(() => {
    resizeRef.current.active = false;
    setIsResizing(false);
  }, []);

  const handleResetSize = useCallback(() => {
    userResizedRef.current = false;
    setRect((prev) =>
      clampWindowRect(
        {
          x: prev.x,
          y: prev.y,
          width: initialRect.width,
          height: desiredExpandedHeight,
        },
        viewport.w,
        viewport.h,
        VIEWPORT_MARGIN,
        TOP_NAV_CLEARANCE
      )
    );
  }, [desiredExpandedHeight, initialRect.width, viewport.h, viewport.w]);

  if (!isOpen) return null;

  const renderedWidth = Math.round(
    Math.min(
      Math.max(MIN_PANEL_WIDTH, rect.width),
      Math.max(220, viewport.w - VIEWPORT_MARGIN * 2)
    )
  );
  const clampedX = Math.max(
    VIEWPORT_MARGIN,
    Math.min(
      rect.x,
      Math.max(VIEWPORT_MARGIN, viewport.w - renderedWidth - VIEWPORT_MARGIN)
    )
  );
  const clampedY = Math.max(
    TOP_NAV_CLEARANCE,
    Math.min(
      rect.y,
      Math.max(
        TOP_NAV_CLEARANCE,
        viewport.h - (isMinimized ? HEADER_HEIGHT : MIN_PANEL_HEIGHT) - VIEWPORT_MARGIN
      )
    )
  );
  const maxFitHeight = Math.max(
    MIN_PANEL_HEIGHT,
    viewport.h - clampedY - VIEWPORT_MARGIN
  );
  const expandedHeight = Math.max(
    MIN_PANEL_HEIGHT,
    Math.min(
      userResizedRef.current ? rect.height : desiredExpandedHeight,
      maxFitHeight
    )
  );
  const layoutMode = classifyPanelLayout(renderedWidth);

  return (
    <section
      data-testid={`floating-window-${id}`}
      data-minimized={isMinimized ? 'true' : 'false'}
      data-layout={layoutMode}
      data-width={renderedWidth}
      aria-label={title}
      onPointerDown={onFocus}
      style={{
        left: `${clampedX}px`,
        top: `${clampedY}px`,
        width: `${renderedWidth}px`,
        height: isMinimized ? `${HEADER_HEIGHT}px` : `${expandedHeight}px`,
        maxHeight: isMinimized ? `${HEADER_HEIGHT}px` : `${maxFitHeight}px`,
        zIndex,
      }}
      className={`fixed flex flex-col rounded-lg border bg-[#111621]/95 text-slate-100 shadow-2xl overflow-hidden transition-[border-color,box-shadow] ${
        isResizing
          ? 'border-sky-400/75 shadow-sky-950/50'
          : 'border-slate-700/65'
      }`}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between gap-3 h-[44px] px-3.5 border-b border-slate-800/90 bg-[#151b28] cursor-move shrink-0 select-none"
      >
        <div className="min-w-0 flex items-baseline gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-slate-100 truncate">
            {title}
          </h2>
          {subtitle && (
            <span className="text-[11px] font-mono-tabular text-slate-400 truncate">
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleMinimize}
            aria-label={isMinimized ? `Expand ${title}` : `Minimize ${title}`}
            aria-expanded={!isMinimized}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            {isMinimized ? <Square size={13} /> : <Minus size={13} />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <FloatingWindowLayoutContext.Provider
          value={{
            width: renderedWidth,
            height: expandedHeight,
            layoutMode,
            isResizing,
          }}
        >
          <div
            data-testid={`floating-window-body-${id}`}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain workbench-scroll p-3.5 pb-6 space-y-3.5"
          >
            {children}
          </div>

          {/* Live dimensions readout while dragging bottom-right corner */}
          {isResizing && (
            <div className="pointer-events-none absolute bottom-2 left-3 px-2 py-0.5 rounded bg-slate-950/90 border border-sky-400/50 text-[10px] font-mono-tabular text-sky-200 shadow-lg">
              {renderedWidth} × {expandedHeight} · {layoutMode}
            </div>
          )}

          {/* Machined Bottom-Right Corner Resize Handle */}
          <div
            role="separator"
            tabIndex={0}
            title="Drag corner to resize (double-click to reset)"
            aria-label={`Resize ${title}`}
            aria-orientation="horizontal"
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onDoubleClick={handleResetSize}
            className={`group absolute bottom-0 right-0 z-10 w-6 h-6 cursor-nwse-resize select-none flex items-end justify-end p-1 transition-all ${
              isResizing
                ? 'text-sky-300'
                : 'text-slate-400 hover:text-sky-300'
            }`}
          >
            {/* Subtle chamfered corner highlight wedge */}
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-tl-md transition-opacity pointer-events-none ${
                isResizing
                  ? 'opacity-100 bg-gradient-to-tl from-sky-400/30 via-sky-400/10 to-transparent'
                  : 'opacity-55 group-hover:opacity-100 bg-gradient-to-tl from-sky-500/20 via-slate-500/5 to-transparent'
              }`}
            />
            {/* Crisp etched diagonal knurl + L-bracket grip icon */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
            >
              <path
                d="M12.5 5.5V11C12.5 11.8284 11.8284 12.5 11 12.5H5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M10.5 3.5L3.5 10.5M11 7L7 11"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>
          </div>
        </FloatingWindowLayoutContext.Provider>
      )}
    </section>
  );
}
