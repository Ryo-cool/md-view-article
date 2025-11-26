'use client';

import Link from "next/link";
import dynamic from "next/dynamic";
import FadeIn from "@/components/FadeIn";
import VideoScrub from "@/components/VideoScrub";

// ThreeBackgroundはSSR不可なのでdynamic import
const ThreeBackground = dynamic(() => import("@/components/ThreeBackground"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex-1 relative min-h-screen overflow-x-hidden">
      {/* 背景 */}
      <ThreeBackground />
      
      {/* スクロールコンテンツ */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center">
            {/* Hero Section */}
            <FadeIn>
              <div className="mb-24">
                <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
                  <span className="text-blue-300 text-sm font-medium tracking-wider uppercase">Premium Documentation Viewer</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 drop-shadow-[0_0_25px_rgba(50,150,255,0.5)]">
                    Markdown
                  </span>
                  <br />
                  <span className="text-white drop-shadow-lg">View Article</span>
                </h1>
                <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-300 font-light">
                  GitHub リポジトリから Markdown ファイルを取得し、
                  <br />
                  <span className="text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(100,255,255,0.4)]">美しい静的サイト</span>として配信します
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link
                    href="/docs"
                    className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-bold overflow-hidden rounded-full bg-blue-600/20 border border-blue-400/30 backdrop-blur-sm transition-all duration-300 hover:bg-blue-600/40 hover:scale-105 hover:shadow-[0_0_30px_rgba(50,150,255,0.4)] hover:border-blue-400/60"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white group-hover:text-white transition-colors">
                      📖 ドキュメント一覧を見る
                    </span>
                  </Link>
                  
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-bold overflow-hidden rounded-full bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:border-white/30"
                  >
                    <svg
                      className="w-6 h-6 mr-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-white">GitHub で見る</span>
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Features Section */}
            <div className="mt-32 grid md:grid-cols-3 gap-8 text-left">
              <FadeIn delay={0.2}>
                <div className="glass-card p-8 h-full hover:shadow-[0_0_30px_rgba(50,150,255,0.2)] hover:border-blue-500/30 group">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">🚀</div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-300 transition-colors">
                    高速な静的サイト
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    Next.js の <span className="text-blue-300 font-medium">SSG</span> を使用し、ビルド時に全ページを生成。読み込み速度が高速です。
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="glass-card p-8 h-full hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-purple-500/30 group">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">📝</div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">
                    Markdown & Mermaid
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    GitHub Flavored Markdown、<span className="text-purple-300 font-medium">Mermaid 図</span>、アラートブロックを完全サポート。
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.6}>
                <div className="glass-card p-8 h-full hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:border-green-500/30 group">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">🔄</div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-green-300 transition-colors">
                    自動デプロイ
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    GitHub リポジトリの変更を検知し、Vercel Deploy Hook で<span className="text-green-300 font-medium">自動反映</span>します。
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Video Scrubbing Section */}
        <VideoScrub />
        
        {/* 余白調整用 */}
        <div className="h-32"></div>
      </div>
    </main>
  );
}
