'use client';

import Link from 'next/link';
import GithubSlugger from 'github-slugger';
import { useMemo, useEffect, useState } from 'react';

interface TableOfContentsProps {
  content: string;
}

interface HeadingItem {
  text: string;
  slug: string;
  level: 2 | 3;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  const headings = useMemo(() => {
    const slugger = new GithubSlugger();
    const lines = content.split('\n');
    const extractedHeadings: HeadingItem[] = [];

    let inCodeBlock = false;

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (!inCodeBlock) {
        if (line.startsWith('## ')) {
          const text = line.replace(/^##\s+/, '').trim();
          extractedHeadings.push({ text, slug: slugger.slug(text), level: 2 });
        } else if (line.startsWith('### ')) {
          const text = line.replace(/^###\s+/, '').trim();
          extractedHeadings.push({ text, slug: slugger.slug(text), level: 3 });
        }
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
        rootMargin: '-90px 0px -70% 0px',
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
    <nav className="article-toc sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-5 rounded-2xl">
      <h2 className="text-sm font-bold mb-4 text-foreground tracking-wide">
        目次
      </h2>
      <ul className="relative space-y-2.5 pl-4 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--article-border)]">
        {headings.map((heading) => {
          const isActive = activeId === heading.slug;
          const isSub = heading.level === 3;
          return (
            <li key={heading.slug} className={`relative ${isSub ? 'pl-2.5' : ''}`}>
              <span
                aria-hidden="true"
                className={`absolute -left-4 top-[0.55em] rounded-full transition-all duration-200 ${
                  isSub ? 'w-[7px] h-[7px] translate-x-[2.5px]' : 'w-[10px] h-[10px] translate-x-[1px]'
                } ${
                  isActive
                    ? 'bg-[var(--accent)] ring-4 ring-[var(--ring-glow)]'
                    : 'bg-[var(--muted)]/40'
                }`}
              />
              <Link
                href={`#${heading.slug}`}
                className={`block leading-snug transition-colors duration-200 ${
                  isSub ? 'text-xs' : 'text-[13px]'
                } ${
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-muted hover:text-foreground'
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
          );
        })}
      </ul>
    </nav>
  );
}
