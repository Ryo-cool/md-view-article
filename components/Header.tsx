import Link from 'next/link';
import ThemeToggle from '@/components/landing/ThemeToggle';

export default function Header() {
  return (
    <header className="relative sm:sticky sm:top-0 z-50 border-b border-[var(--glass-border)] bg-[var(--background)]/85 backdrop-blur-md sm:border-b-0 sm:bg-transparent sm:backdrop-blur-none sm:pt-4 sm:pb-2">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        <div className="py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between gap-2 sm:bg-[var(--glass-bg)] sm:border sm:border-[var(--glass-border)] sm:backdrop-blur-xl sm:rounded-2xl sm:shadow-lg sm:shadow-black/10">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0 group">
            {/* しずくのロゴ */}
            <span className="relative w-7 h-7 sm:w-9 sm:h-9 shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-teal-400/20 to-sky-500/20 border border-teal-300/25 flex items-center justify-center group-hover:shadow-[0_0_18px_var(--ring-glow)] transition-shadow duration-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 sm:w-5 sm:h-5 text-accent"
                aria-hidden="true"
              >
                <path d="M12 3c3.5 4.2 6 7.5 6 10.5a6 6 0 0 1-12 0C6 10.5 8.5 7.2 12 3z" />
                <path d="M9.5 14.5a2.5 2.5 0 0 0 2 2" opacity="0.6" />
              </svg>
            </span>
            <span className="text-[13.5px] sm:text-xl font-bold tracking-tight text-foreground whitespace-nowrap truncate group-hover:text-accent transition-colors duration-300">
              Markdown View Article
            </span>
          </Link>
          <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              href="/docs"
              className="glass-button px-2.5 sm:px-5 py-1.5 sm:py-2.5 font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group"
            >
              <span className="hidden sm:inline">ドキュメント一覧</span>
              <span className="sm:hidden">Docs</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button p-2 sm:p-2.5 inline-flex items-center justify-center group"
              aria-label="GitHub"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 fill-current group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
