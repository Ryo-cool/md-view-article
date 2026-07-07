export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--glass-border)] bg-surface-3 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-sm text-muted">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} Markdown View Article. All rights reserved.
          </p>
          <p className="mt-2 flex items-center justify-center gap-2">
            Powered by
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:text-accent-soft transition-colors"
            >
              Next.js
            </a>
            <span className="opacity-40">|</span>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:text-accent-soft transition-colors"
            >
              Vercel
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
