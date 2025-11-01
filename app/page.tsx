import Link from "next/link";

// TODO: 認証機能が必要な場合、以下を有効化
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

export default function Home() {
  // TODO: 認証機能が必要な場合、以下を有効化
  // const session = await getServerSession(authOptions);
  return (
    <main className="flex-1" style={{ background: '#e0e5ec' }}>
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#2c3e50' }}>
              📚 Markdown View Article
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: '#5a6c7d' }}>
              GitHub リポジトリから Markdown ファイルを取得し、<br />
              美しい静的サイトとして配信します
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/docs"
                className="neu-button inline-flex items-center justify-center px-10 py-4 font-bold text-lg"
                style={{ color: '#2c3e50' }}
              >
                📖 ドキュメント一覧を見る
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="neu-button inline-flex items-center justify-center px-10 py-4 font-bold text-lg"
                style={{ color: '#2c3e50' }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub で見る
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
            <div className="neu-card p-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2c3e50' }}>
                高速な静的サイト
              </h3>
              <p style={{ color: '#5a6c7d' }}>
                Next.js の SSG を使用し、ビルド時に全ページを生成。読み込み速度が高速です。
              </p>
            </div>

            <div className="neu-card p-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2c3e50' }}>
                Markdown & Mermaid 対応
              </h3>
              <p style={{ color: '#5a6c7d' }}>
                GitHub Flavored Markdown、Mermaid 図、アラートブロックをサポート。
              </p>
            </div>

            <div className="neu-card p-8">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2c3e50' }}>
                自動デプロイ
              </h3>
              <p style={{ color: '#5a6c7d' }}>
                GitHub リポジトリの変更を検知し、Vercel Deploy Hook で自動反映。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
