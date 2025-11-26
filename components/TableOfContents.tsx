'use client';

import Link from 'next/link';
import GithubSlugger from 'github-slugger';
import { useMemo } from 'react';

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const slugger = new GithubSlugger();
    const lines = content.split('\n');
    const extractedHeadings: { text: string; slug: string }[] = [];
    
    let inCodeBlock = false;

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      // h2のみを対象とする (## )
      if (!inCodeBlock && line.startsWith('## ')) {
        const text = line.replace(/^##\s+/, '').trim();
        const slug = slugger.slug(text);
        extractedHeadings.push({ text, slug });
      }
    }
    
    return extractedHeadings;
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-6 glass-card rounded-xl">
      <h2 className="text-lg font-bold mb-4 text-white border-b border-white/10 pb-2 flex items-center gap-2">
        <span className="text-blue-400">📑</span> 目次
      </h2>
      <ul className="space-y-3">
        {headings.map((heading) => (
          <li key={heading.slug}>
            <Link
              href={`#${heading.slug}`}
              className="text-gray-400 hover:text-blue-300 transition-all duration-200 block text-sm leading-relaxed hover:translate-x-1"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(heading.slug);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                  // URLのハッシュも更新
                  window.history.pushState(null, '', `#${heading.slug}`);
                }
              }}
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
