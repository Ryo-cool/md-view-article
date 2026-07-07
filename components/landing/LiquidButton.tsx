'use client';

import Link from 'next/link';
import { useCallback } from 'react';

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  external?: boolean;
  className?: string;
};

/** ポインター位置から液体が満ちるように広がるホバー効果を持つ CTA ボタン */
export default function LiquidButton({
  href,
  children,
  variant = 'primary',
  external = false,
  className = '',
}: Props) {
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  const base =
    'liquid-btn group inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-full text-base font-semibold tracking-wide backdrop-blur-sm';
  const styles =
    variant === 'primary'
      ? 'border border-teal-300/40 bg-teal-400/10 text-foreground hover:text-white hover:border-teal-300/70'
      : 'border border-[var(--glass-border)] bg-[var(--glass-bg)] text-foreground hover:text-white hover:border-[var(--ring-glow)]';

  const cls = `${base} ${styles} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        onPointerMove={onPointerMove}
        onPointerEnter={onPointerMove}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} onPointerMove={onPointerMove} onPointerEnter={onPointerMove}>
      {children}
    </Link>
  );
}
