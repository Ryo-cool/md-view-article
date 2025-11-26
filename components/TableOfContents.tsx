'use client';

import Link from 'next/link';
import GithubSlugger from 'github-slugger';
import { useMemo, useEffect, useState } from 'react';

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66% 0px',
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

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
              className={`block text-sm leading-relaxed transition-all duration-200 hover:translate-x-1 ${
                activeId === heading.slug
                  ? 'text-blue-300 font-medium border-l-2 border-blue-400 pl-3'
                  : 'text-gray-400 hover:text-blue-300'
              }`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(heading.slug);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                  window.history.pushState(null, '', `#${heading.slug}`);
                  setActiveId(heading.slug);
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
