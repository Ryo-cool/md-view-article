'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [isWide, setIsWide] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!ref.current) return;

    const initializeMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            // NOTE: keep darkMode false. Mermaid's "base" theme unconditionally
            // darkens cScaleN (mindmap/ER section colors) by 75% when darkMode
            // is true, which crushes any color we set here down to near-black.
            // With darkMode false it only darkens by 25%, so we compensate by
            // picking lighter source colors for cScaleN below.
            darkMode: false,
            background: 'transparent',
            
            // Main colors
            primaryColor: '#1e293b',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#3b82f6',
            lineColor: '#94a3b8',
            
            // Secondary (e.g. notes)
            secondaryColor: '#334155',
            secondaryTextColor: '#f8fafc',
            secondaryBorderColor: '#a855f7',
            
            // Tertiary
            tertiaryColor: '#0f172a',
            tertiaryTextColor: '#f8fafc',
            tertiaryBorderColor: '#22d3ee',

            // Flowchart specific
            mainBkg: '#1e293b',
            nodeBorder: '#3b82f6',
            clusterBkg: '#1e293b',
            clusterBorder: '#3b82f6',
            defaultLinkColor: '#94a3b8',
            titleColor: '#f8fafc',
            edgeLabelBackground: '#0f172a',
            
            // Sequence Diagram specific
            actorBkg: '#1e293b',
            actorBorder: '#3b82f6',
            actorTextColor: '#f8fafc',
            actorLineColor: '#94a3b8',
            signalColor: '#94a3b8',
            signalTextColor: '#f8fafc',
            labelBoxBkgColor: '#1e293b',
            labelBoxBorderColor: '#3b82f6',
            labelTextColor: '#f8fafc',
            loopTextColor: '#f8fafc',
            noteBkgColor: '#1e293b',
            noteTextColor: '#f8fafc',
            noteBorderColor: '#a855f7',
            activationBkgColor: '#334155',
            sequenceNumberColor: '#f8fafc',

            // State Diagram
            stateBkg: '#1e293b',
            stateLabelColor: '#f8fafc',
            stateBorder: '#3b82f6',
            altBackground: '#0f172a',

            // Class Diagram
            classText: '#f8fafc',
            
            // Git Graph
            git0: '#3b82f6',
            git1: '#a855f7',
            git2: '#22d3ee',
            git3: '#f472b6',
            git4: '#22c55e',
            git5: '#f59e0b',
            git6: '#ef4444',
            gitBranchLabel0: '#f8fafc',
            gitBranchLabel1: '#f8fafc',
            gitBranchLabel2: '#f8fafc',
            gitBranchLabel3: '#f8fafc',
            gitBranchLabel4: '#f8fafc',
            gitBranchLabel5: '#f8fafc',
            gitBranchLabel6: '#f8fafc',
            tagLabelColor: '#f8fafc',
            tagLabelBackground: '#1e293b',
            tagLabelBorder: '#3b82f6',
            commitLabelColor: '#f8fafc',
            commitLabelBackground: '#1e293b',

            // Pie Chart
            pie1: '#3b82f6',
            pie2: '#a855f7',
            pie3: '#22d3ee',
            pie4: '#f472b6',
            pie5: '#22c55e',
            pie6: '#f59e0b',
            pieTitleTextSize: '20px',
            pieTitleTextColor: '#f8fafc',
            pieSectionTextColor: '#f8fafc',
            pieLegendTextColor: '#f8fafc',
            
            // Error/Critical
            errorBkgColor: '#7f1d1d',
            errorTextColor: '#fecaca',

            // Mindmap / quadrant / multi-section diagrams (cScale0-11).
            // These get an automatic 25% darken applied on top, so the
            // source colors here are intentionally lighter than they end up.
            cScale0: '#60a5fa',
            cScale1: '#c084fc',
            cScale2: '#22d3ee',
            cScale3: '#f472b6',
            cScale4: '#4ade80',
            cScale5: '#fbbf24',
            cScale6: '#f87171',
            cScale7: '#818cf8',
            cScale8: '#2dd4bf',
            cScale9: '#fb923c',
            cScale10: '#e879f9',
            cScale11: '#a3e635',
            cScaleLabel0: '#f8fafc',
            cScaleLabel1: '#f8fafc',
            cScaleLabel2: '#f8fafc',
            cScaleLabel3: '#f8fafc',
            cScaleLabel4: '#f8fafc',
            cScaleLabel5: '#f8fafc',
            cScaleLabel6: '#f8fafc',
            cScaleLabel7: '#f8fafc',
            cScaleLabel8: '#f8fafc',
            cScaleLabel9: '#f8fafc',
            cScaleLabel10: '#f8fafc',
            cScaleLabel11: '#f8fafc',

            // ER diagram attribute row striping
            rowOdd: '#1e293b',
            rowEven: '#0f172a',

            // Gantt: alternate section band (defaults to opaque white otherwise)
            altSectionBkgColor: '#1e293b',
          },
          securityLevel: 'loose',
        });
        
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;
        const { svg } = await mermaid.render(id, chart);
        if (ref.current) {
          ref.current.innerHTML = svg;
          setSvgHtml(svg);

          // Prevent wide diagrams (e.g. multi-column flowcharts, sequence diagrams)
          // from shrinking to unreadable microscopic text on mobile screens.
          const svgEl = ref.current.querySelector('svg');
          if (svgEl) {
            const viewBox = svgEl.getAttribute('viewBox');
            const vbParts = viewBox ? viewBox.trim().split(/[\s,]+/).map(Number) : [];
            const naturalWidth = vbParts.length === 4 && Number.isFinite(vbParts[2]) ? vbParts[2] : 0;

            if (naturalWidth > 480) {
              const minLegibleWidth = Math.min(Math.round(naturalWidth * 0.72), 680);
              svgEl.style.minWidth = `${minLegibleWidth}px`;
              svgEl.style.height = 'auto';
              setIsWide(true);
            } else {
              setIsWide(false);
            }
          }
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = `<pre class="text-red-400 text-xs overflow-x-auto">Mermaid diagram rendering failed:\n${String(error)}</pre>`;
        }
      }
    };

    initializeMermaid();
  }, [chart]);

  useEffect(() => {
    if (!expanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  const openModal = () => {
    setZoom(1);
    setExpanded(true);
  };

  return (
    <>
      <div className="mermaid-container my-6 rounded-[10px] overflow-hidden">
        <div className="mermaid-header flex items-center justify-between gap-2 px-3.5 py-1.5 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[11px] tracking-wide opacity-80">mermaid</span>
            {isWide && (
              <span className="sm:hidden text-[10px] opacity-65 whitespace-nowrap">
                ← 横スクロール可 →
              </span>
            )}
          </div>
          {svgHtml && (
            <button
              type="button"
              onClick={openModal}
              aria-label="図を拡大表示"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] opacity-80 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer shrink-0"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
              <span>拡大</span>
            </button>
          )}
        </div>
        <div ref={ref} className="mermaid" />
      </div>

      {expanded && svgHtml && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mermaid 図の拡大表示"
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative w-full max-w-6xl max-h-[92vh] bg-[#0f172a] border border-slate-700/80 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 border-b border-white/10 text-xs text-slate-300">
              <span className="font-mono">mermaid</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.25).toFixed(2)))}
                  aria-label="縮小"
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-slate-100 transition-colors cursor-pointer"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="px-2 h-7 rounded-md bg-white/5 hover:bg-white/15 text-slate-200 font-mono text-[11px] transition-colors cursor-pointer"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
                  aria-label="拡大"
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-slate-100 transition-colors cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="ml-1.5 px-2.5 h-7 rounded-md bg-white/10 hover:bg-white/20 text-slate-100 transition-colors cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </div>
            <div className="overflow-auto p-4 sm:p-8 flex-1">
              <div
                className="mermaid mermaid-modal-body"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  width: `${100 / zoom}%`,
                }}
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

