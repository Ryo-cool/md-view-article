'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LiquidButton from '@/components/landing/LiquidButton';
import RippleCard from '@/components/landing/RippleCard';
import WaveDivider from '@/components/landing/WaveDivider';
import WorksGallery from '@/components/landing/WorksGallery';
import Testimonials from '@/components/landing/Testimonials';

// WebGL を使うため SSR 不可
const WaterCanvas = dynamic(() => import('@/components/landing/WaterCanvas'), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    title: '高速な静的サイト',
    description:
      'Next.js の SSG によりビルド時に全ページを生成。水面を滑るような、一瞬の読み込み体験を提供します。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Markdown & Mermaid',
    description:
      'GitHub Flavored Markdown、Mermaid 図、アラートブロックを完全サポート。書いたままの構造が、美しく流れるように描画されます。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <path d="M6.5 10v4a3 3 0 0 0 3 3H14" />
      </svg>
    ),
  },
  {
    title: '自動デプロイ',
    description:
      'GitHub リポジトリへの push を検知し、Vercel Deploy Hook で自動反映。ドキュメントは常に最新の状態に保たれます。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
    ),
  },
  {
    title: 'ダーク / ライトテーマ',
    description:
      '深い夜の海と、朝の澄んだ水面。ふたつのテーマを右上のスイッチでシームレスに切り替えられます。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 3v18" />
        <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" fillOpacity="0.15" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

function ContactForm() {
  const [sent, setSent] = useState(false);

  return sent ? (
    <div className="glass-card rounded-3xl p-10 text-center" data-reveal>
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-400/80 to-sky-500/80 flex items-center justify-center shadow-lg shadow-teal-500/25">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">ありがとうございます</h3>
      <p className="text-muted leading-relaxed">
        メッセージは静かな水面に届きました。
        <br />
        折り返しご連絡いたします。
      </p>
    </div>
  ) : (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <input
          type="text"
          name="name"
          required
          placeholder="お名前"
          aria-label="お名前"
          className="field-liquid w-full px-5 py-4 text-sm"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="メールアドレス"
          aria-label="メールアドレス"
          className="field-liquid w-full px-5 py-4 text-sm"
        />
      </div>
      <textarea
        name="message"
        required
        rows={5}
        placeholder="メッセージ — ドキュメントの世界について、なんでもどうぞ"
        aria-label="メッセージ"
        className="field-liquid w-full px-5 py-4 text-sm resize-none"
      />
      <button
        type="submit"
        className="liquid-btn w-full inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-full text-base font-semibold tracking-wide border border-teal-300/40 bg-teal-400/10 text-foreground hover:text-white hover:border-teal-300/70 backdrop-blur-sm"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
        }}
      >
        <span>送信する</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="m22 2-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </form>
  );
}

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        // --- ヒーローのイントロ ---
        gsap.fromTo(
          '[data-hero]',
          { y: 44, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', stagger: 0.13, delay: 0.15 }
        );

        // --- スクロールに応じたセクションリビール ---
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 48, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 86%' },
            }
          );
        });

        // --- パララックス(data-parallax="速度係数") ---
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const speed = parseFloat(el.dataset.parallax ?? '0.15');
          gsap.to(el, {
            yPercent: speed * 100,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('section') ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        });

        // --- ヒーローはスクロールで水中へ沈むように退場 ---
        gsap.to('[data-hero-content]', {
          yPercent: -18,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-hero-section]',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }, mainRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <main ref={mainRef} className="flex-1 relative overflow-x-clip">
      {/* ============================================================
          1. Hero — インタラクティブな水面
         ============================================================ */}
      <section
        data-hero-section
        className="relative min-h-[100svh] -mt-[92px] flex items-center justify-center overflow-hidden"
      >
        <WaterCanvas className="absolute inset-0" />

        {/* 漂う光の玉 */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div
            data-parallax="-0.25"
            className="float-slow absolute top-[18%] left-[12%] w-40 h-40 rounded-full bg-teal-300/15 blur-3xl"
          />
          <div
            data-parallax="-0.45"
            className="float-slower absolute top-[30%] right-[10%] w-64 h-64 rounded-full bg-sky-400/15 blur-3xl"
          />
          <div
            data-parallax="-0.15"
            className="float-slow absolute bottom-[22%] left-[22%] w-24 h-24 rounded-full bg-cyan-200/20 blur-2xl"
          />
          {/* 小さなガラスの泡 */}
          <div className="float-slower absolute top-[38%] left-[8%] w-3 h-3 rounded-full border border-white/25 bg-white/5 backdrop-blur-sm" />
          <div className="float-slow absolute top-[24%] right-[24%] w-2 h-2 rounded-full border border-white/20 bg-white/5" />
          <div className="float-slower absolute bottom-[30%] right-[16%] w-4 h-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm" />
        </div>

        <div
          data-hero-content
          className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-[92px]"
          style={{ color: 'var(--hero-text)' }}
        >
          <div data-hero className="inline-flex items-center gap-2.5 mb-8 px-5 py-2 rounded-full border border-teal-300/25 bg-[var(--glass-bg)] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-300" />
            </span>
            <span className="text-xs sm:text-sm font-medium tracking-[0.28em] uppercase opacity-90">
              Premium Documentation Viewer
            </span>
          </div>

          <h1
            data-hero
            className="text-5xl sm:text-7xl md:text-8xl font-bold leading-[1.05] tracking-tight mb-8"
          >
            <span className="hero-gradient-text drop-shadow-[0_0_30px_rgba(45,212,191,0.25)]">
              Markdown
            </span>
            <br />
            <span>View Article</span>
          </h1>

          <p
            data-hero
            className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed sm:leading-loose mb-12 opacity-90 max-w-3xl mx-auto"
          >
            GitHub リポジトリから Markdown ファイルを取得し、
            <br className="hidden sm:block" />
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-300 [-webkit-background-clip:text]">
              美しい静的サイト
            </span>
            として配信します
          </p>

          <div data-hero className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <LiquidButton href="/docs" variant="primary">
              <span>ドキュメント一覧を見る</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </LiquidButton>
            <LiquidButton href="https://github.com" variant="ghost" external>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>GitHub で見る</span>
            </LiquidButton>
          </div>
        </div>

        {/* スクロールヒント */}
        <div
          data-hero
          className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2.5 opacity-70"
          style={{ color: 'var(--hero-text)' }}
        >
          <span className="text-[10px] tracking-[0.35em] uppercase">Scroll</span>
          <div className="w-6 h-10 rounded-full border border-current/40 flex justify-center pt-2">
            <div className="scroll-dot w-1 h-1.5 rounded-full bg-current" />
          </div>
        </div>

        {/* ヒーローの水面から次セクションへ溶ける波 */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <WaveDivider fill="var(--surface-1)" />
        </div>
      </section>

      {/* ============================================================
          2. About / Features — ガラスのカード
         ============================================================ */}
      <section className="relative bg-surface-1 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center mb-16 sm:mb-20" data-reveal>
            <p className="text-xs font-semibold tracking-[0.35em] uppercase text-accent mb-4">
              Features
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
              静かで、速く、美しい
            </h2>
            <p className="text-muted max-w-2xl mx-auto leading-relaxed sm:text-lg">
              ドキュメントを読む時間が、心地よい体験になるように。
              水のように滑らかな閲覧体験を支える 4 つの柱です。
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} data-reveal>
                <RippleCard className="p-8 sm:p-10 h-full rounded-3xl">
                  <div
                    className={`w-14 h-14 mb-7 rounded-2xl flex items-center justify-center text-accent bg-gradient-to-br from-teal-400/15 to-sky-500/15 border border-teal-300/20 ${
                      i % 2 === 0 ? 'float-slow' : 'float-slower'
                    }`}
                    style={{ animationDuration: `${8 + i}s` }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted leading-relaxed">{feature.description}</p>
                </RippleCard>
              </div>
            ))}
          </div>
        </div>
        <WaveDivider fill="var(--surface-2)" />
      </section>

      {/* ============================================================
          3. Works / Showcase — 水面の歪みを持つギャラリー
         ============================================================ */}
      <section className="relative bg-surface-2 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14 sm:mb-16" data-reveal>
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] uppercase text-accent mb-4">
                Showcase
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                表現力のすべて
              </h2>
            </div>
            <p className="text-muted max-w-md leading-relaxed sm:text-right">
              カーソルを重ねると、水面のように揺らめきます。
              Markdown が持つ表現力を、そのままの美しさで。
            </p>
          </div>

          <WorksGallery />
        </div>
        <WaveDivider fill="var(--surface-1)" />
      </section>

      {/* ============================================================
          4. Testimonials — 波のトランジションを持つカルーセル
         ============================================================ */}
      <section className="relative bg-surface-1 transition-colors duration-500 overflow-hidden">
        {/* 背景の淡い光 */}
        <div
          aria-hidden="true"
          data-parallax="-0.2"
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-teal-400/5 blur-3xl pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center mb-14 sm:mb-16" data-reveal>
            <p className="text-xs font-semibold tracking-[0.35em] uppercase text-accent mb-4">
              Voices
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
              使う人の、声
            </h2>
          </div>
          <div data-reveal>
            <Testimonials />
          </div>
        </div>
        <WaveDivider fill="var(--surface-3)" />
      </section>

      {/* ============================================================
          5. Contact — 水辺のフォーム
         ============================================================ */}
      <section className="relative bg-surface-3 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
            <div data-reveal>
              <p className="text-xs font-semibold tracking-[0.35em] uppercase text-accent mb-4">
                Contact
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                水面に、
                <br />
                ひとしずくを。
              </h2>
              <p className="text-muted leading-relaxed mb-10 max-w-md">
                導入のご相談、機能のご要望、小さな感想まで。
                どんなメッセージも、波紋のように届きます。
              </p>

              <div className="space-y-4">
                <a
                  href="mailto:hello@example.com"
                  className="glass-button inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm group w-full sm:w-auto"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 text-accent">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="m2 7 10 6L22 7" />
                  </svg>
                  <span>hello@example.com</span>
                </a>
                <br className="hidden sm:block" />
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm group w-full sm:w-auto"
                >
                  <svg className="w-4.5 h-4.5 text-accent" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>GitHub リポジトリ</span>
                </a>
              </div>
            </div>

            <div data-reveal>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
