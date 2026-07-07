'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initial: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'README をリポジトリに push するだけで、そのまま美しいドキュメントサイトになる。チームのオンボーディング資料が一晩で生まれ変わりました。',
    name: 'Yuki T.',
    role: 'Backend Engineer',
    initial: 'Y',
  },
  {
    quote:
      'Mermaid の図がそのままレンダリングされるのが最高。設計ドキュメントを書くモチベーションが上がり、ドキュメント文化が根付きました。',
    name: 'Haruka S.',
    role: 'Tech Lead',
    initial: 'H',
  },
  {
    quote:
      '静的生成なので表示が一瞬。デザインも洗練されていて、社外に共有しても恥ずかしくないドキュメントポータルが手に入りました。',
    name: 'Kenta M.',
    role: 'Engineering Manager',
    initial: 'K',
  },
];

const INTERVAL_MS = 6500;

/** 波が満ちて引く、水面のようなトランジションを持つカルーセル */
export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((next: number) => {
    const overlay = overlayRef.current;
    const slide = slideRef.current;
    const target = (next + TESTIMONIALS.length) % TESTIMONIALS.length;
    indexRef.current = target;

    if (
      !overlay ||
      !slide ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIndex(target);
      return;
    }

    timelineRef.current?.kill();
    // 波がカードを満たし、満ちた瞬間に内容を切り替え、波が引いていく
    timelineRef.current = gsap
      .timeline()
      .set(overlay, { yPercent: 105 })
      .to(overlay, { yPercent: 0, duration: 0.5, ease: 'power2.in' })
      .call(() => setIndex(target))
      .set(slide, { opacity: 0, y: 14 })
      .to(overlay, { yPercent: -105, duration: 0.55, ease: 'power2.out' }, '+=0.05')
      .to(slide, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '<0.15');
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goTo(indexRef.current + 1);
    }, INTERVAL_MS);
  }, [goTo]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timelineRef.current?.kill();
    };
  }, [resetTimer]);

  const handleManual = (next: number) => {
    goTo(next);
    resetTimer();
  };

  const t = TESTIMONIALS[index];

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="ripple-card glass-card relative overflow-hidden rounded-[2rem] px-8 py-12 sm:px-14 sm:py-14 text-center">
        {/* 引用符の装飾 */}
        <div
          aria-hidden="true"
          className="absolute -top-6 left-8 text-[9rem] leading-none font-serif text-accent/10 select-none"
        >
          “
        </div>

        <div ref={slideRef} className="relative">
          <p className="text-lg sm:text-xl leading-relaxed sm:leading-loose text-muted-strong mb-10 min-h-[7.5rem] sm:min-h-[6.5rem]">
            {t.quote}
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400/80 to-sky-500/80 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/20">
              {t.initial}
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="text-sm text-muted">{t.role}</p>
            </div>
          </div>
        </div>

        {/* 波のトランジションオーバーレイ */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="absolute inset-x-0 -inset-y-8 pointer-events-none"
          style={{ transform: 'translateY(105%)' }}
        >
          <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            className="w-full h-14 block"
          >
            <path
              d="M0,60 C180,20 320,90 520,55 C720,20 880,80 1080,50 C1240,28 1360,55 1440,40 L1440,90 L0,90 Z"
              fill="url(#testimonial-wave-gradient)"
            />
            <defs>
              <linearGradient id="testimonial-wave-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
          </svg>
          <div className="w-full h-[130%] bg-gradient-to-b from-[#0ea5e9] to-[#0b4a6f]" />
        </div>
      </div>

      {/* コントロール */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => handleManual(index - 1)}
          aria-label="前の声へ"
          className="glass-button w-11 h-11 rounded-full inline-flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleManual(i)}
              aria-label={`${i + 1}件目の声を表示`}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === index
                  ? 'w-8 bg-gradient-to-r from-teal-400 to-sky-400'
                  : 'w-2 bg-[var(--glass-border)] hover:bg-[var(--ring-glow)]'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleManual(index + 1)}
          aria-label="次の声へ"
          className="glass-button w-11 h-11 rounded-full inline-flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
