'use client';

import { useCallback, useRef } from 'react';

/**
 * ガラスカード。ポインターに追従するハイライトと、
 * ホバー開始時に水面のようなリングが広がるマイクロインタラクション。
 */
export default function RippleCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const setPointerVars = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  const spawnRing = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      setPointerVars(e);
      const ring = document.createElement('span');
      ring.className = 'ripple-ring';
      const rect = el.getBoundingClientRect();
      ring.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      ring.style.setProperty('--my', `${e.clientY - rect.top}px`);
      el.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove());
    },
    [setPointerVars]
  );

  return (
    <div
      ref={ref}
      className={`ripple-card glass-card ${className}`}
      onPointerEnter={spawnRing}
      onPointerMove={setPointerVars}
      onPointerDown={spawnRing}
    >
      {children}
    </div>
  );
}
