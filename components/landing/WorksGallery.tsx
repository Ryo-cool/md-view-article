'use client';

import { useId, useRef } from 'react';
import gsap from 'gsap';

type Work = {
  title: string;
  category: string;
  description: string;
  aspect: string;
  art: string; // 抽象的なリキッドアート(CSS グラデーション)
};

const WORKS: Work[] = [
  {
    title: 'Syntax Highlight',
    category: 'Code',
    description: 'コードブロックを美しく彩る シンタックスハイライト',
    aspect: 'aspect-[4/5]',
    art: 'radial-gradient(120% 90% at 20% 10%, #0ea5e9 0%, transparent 55%), radial-gradient(100% 100% at 85% 90%, #2dd4bf 0%, transparent 50%), linear-gradient(160deg, #061225 0%, #0b2942 100%)',
  },
  {
    title: 'Mermaid Diagrams',
    category: 'Visualization',
    description: 'フローチャートやシーケンス図を そのままレンダリング',
    aspect: 'aspect-[4/3]',
    art: 'radial-gradient(90% 80% at 75% 20%, #5eead4 0%, transparent 55%), radial-gradient(110% 90% at 15% 85%, #1d4ed8 0%, transparent 55%), linear-gradient(200deg, #041020 0%, #0a1f38 100%)',
  },
  {
    title: 'GitHub Alerts',
    category: 'Markdown',
    description: 'Note / Tip / Warning などの アラートブロックに対応',
    aspect: 'aspect-square',
    art: 'radial-gradient(100% 100% at 50% 0%, #22d3ee 0%, transparent 50%), radial-gradient(80% 80% at 90% 90%, #0f766e 0%, transparent 55%), linear-gradient(180deg, #071528 0%, #04101f 100%)',
  },
  {
    title: 'Auto TOC',
    category: 'Navigation',
    description: '見出しから目次を自動生成し スムーズにスクロール',
    aspect: 'aspect-[4/5]',
    art: 'radial-gradient(110% 80% at 10% 90%, #38bdf8 0%, transparent 55%), radial-gradient(90% 90% at 90% 15%, #14b8a6 0%, transparent 50%), linear-gradient(140deg, #050f1e 0%, #0c2440 100%)',
  },
  {
    title: 'GFM Tables',
    category: 'Markdown',
    description: 'テーブル・タスクリストなど GFM をフルサポート',
    aspect: 'aspect-[4/3]',
    art: 'radial-gradient(100% 90% at 80% 80%, #67e8f9 0%, transparent 50%), radial-gradient(90% 80% at 20% 20%, #0369a1 0%, transparent 55%), linear-gradient(220deg, #06152a 0%, #041220 100%)',
  },
  {
    title: 'Fluid Typography',
    category: 'Design',
    description: 'どのデバイスでも読みやすい 流体タイポグラフィ',
    aspect: 'aspect-square',
    art: 'radial-gradient(120% 100% at 50% 100%, #2dd4bf 0%, transparent 55%), radial-gradient(80% 70% at 80% 10%, #60a5fa 0%, transparent 50%), linear-gradient(170deg, #030c18 0%, #0a2036 100%)',
  },
];

/** ホバーで水面のような歪み(SVG displacement)が走るタイル */
function WorkTile({ work }: { work: Work }) {
  const rawId = useId();
  const filterId = `ripple-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const anim = useRef({ scale: 0, freq: 0.012 });
  const tween = useRef<gsap.core.Tween | null>(null);

  const applyDistortion = () => {
    displacementRef.current?.setAttribute('scale', String(anim.current.scale));
    turbulenceRef.current?.setAttribute('baseFrequency', `${anim.current.freq} ${anim.current.freq * 1.6}`);
  };

  const animateTo = (scale: number, freq: number, duration: number, ease: string) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    tween.current?.kill();
    tween.current = gsap.to(anim.current, {
      scale,
      freq,
      duration,
      ease,
      onUpdate: applyDistortion,
    });
  };

  return (
    <figure
      className="group relative overflow-hidden rounded-3xl border border-[var(--glass-border)] cursor-pointer"
      onPointerEnter={() => animateTo(26, 0.02, 0.9, 'power2.out')}
      onPointerLeave={() => animateTo(0, 0.012, 1.1, 'power3.out')}
    >
      {/* このタイル専用の水面歪みフィルター */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            ref={turbulenceRef}
            type="fractalNoise"
            baseFrequency="0.012 0.02"
            numOctaves="2"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            ref={displacementRef}
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div
        ref={artRef}
        className={`${work.aspect} w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]`}
        style={{ background: work.art, filter: `url(#${filterId})` }}
      />

      {/* 深い水底へ沈むようなオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02060e]/85 via-[#02060e]/15 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

      <figcaption className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-teal-300/80 mb-1.5">
          {work.category}
        </p>
        <h3 className="text-xl font-bold text-white mb-1 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
          {work.title}
        </h3>
        <p className="text-sm text-slate-300/80 leading-relaxed opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
          {work.description}
        </p>
      </figcaption>

      {/* 上端の光の縁 */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </figure>
  );
}

export default function WorksGallery() {
  return (
    <div className="masonry">
      {WORKS.map((work) => (
        <div key={work.title} data-reveal>
          <WorkTile work={work} />
        </div>
      ))}
    </div>
  );
}
