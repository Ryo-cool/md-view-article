'use client';

import Link from 'next/link';
import GithubSlugger from 'github-slugger';
import { useMemo, useEffect, useState, type MouseEvent } from 'react';

interface TableOfContentsProps {
  content: string;
  variant?: 'sidebar' | 'mobile';
}

interface HeadingItem {
  text: string;
  slug: string;
  level: 2 | 3;
}

export default function TableOfContents({
  content,
  variant = 'sidebar',
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

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
    if (variant === 'mobile') return;
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
  }, [headings, variant]);

  if (headings.length === 0) return null;

  const handleSelect = (e: MouseEvent, slug: string) => {
    e.preventDefault();
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${slug}`);
      setActiveId(slug);
      if (variant === 'mobile') {
        setIsOpen(false);
      }
    }
  };

  const renderList = () => (
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
              onClick={(e) => handleSelect(e, heading.slug)}
            >
              {heading.text}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (variant === 'mobile') {
    const h2Count = headings.filter((h) => h.level === 2).length;
    return (
      <div className="article-toc-mobile rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold text-foreground cursor-pointer"
        >
          <span className="inline-flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>目次</span>
            <span className="text-[11px] font-normal text-muted">
              ({h2Count}セクション)
            </span>
          </span>
          <svg
            className={`w-4 h-4 text-muted transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {isOpen && (
          <div className="px-3.5 pt-1 pb-3.5 border-t border-[var(--article-border)] max-h-[55vh] overflow-y-auto">
            {renderList()}
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="article-toc sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-5 rounded-2xl">
      <h2 className="text-sm font-bold mb-4 text-foreground tracking-wide">
        目次
      </h2>
      {renderList()}
    </nav>
  );
}
