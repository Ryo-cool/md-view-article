'use client';

import { useEffect, useRef } from 'react';

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const initializeMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            darkMode: true,
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
          },
          securityLevel: 'loose',
        });
        
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;
        const { svg } = await mermaid.render(id, chart);
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = `<pre class="text-red-600">Mermaid diagram rendering failed:\n${String(error)}</pre>`;
        }
      }
    };

    initializeMermaid();
  }, [chart]);

  return <div ref={ref} className="mermaid my-6 flex justify-center" />;
}

