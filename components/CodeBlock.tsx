'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const displayLang = language || 'text';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div className="zenn-code-block my-6 rounded-[10px] overflow-hidden border border-slate-700/60 bg-[#1a2638] shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#131d2c] border-b border-white/[0.06] text-xs">
        <span className="font-mono text-slate-300/90 tracking-wide">
          {displayLang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="コードをコピー"
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <svg
                className="w-3.5 h-3.5 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
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
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="zenn-code-body overflow-x-auto">
        <SyntaxHighlighter
          language={displayLang}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem 1.15rem',
            fontSize: '0.86rem',
            lineHeight: '1.65',
            background: 'transparent',
            borderRadius: 0,
          }}
          PreTag="div"
          codeTagProps={{
            style: {
              fontFamily:
                'var(--font-geist-mono), "Fira Code", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
              background: 'transparent',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
