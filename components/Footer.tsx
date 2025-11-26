export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-sm text-gray-400">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Markdown Docs. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-2">
            Powered by
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Next.js
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Vercel
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

