export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: '#e0e5ec' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="neu-flat px-6 py-6 text-center text-sm" style={{ color: '#5a6c7d' }}>
          <p>© {new Date().getFullYear()} Markdown Docs. All rights reserved.</p>
          <p className="mt-2">
            Powered by{' '}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:opacity-70 transition-opacity"
              style={{ color: '#4a90e2' }}
            >
              Next.js
            </a>
            {' '}and{' '}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:opacity-70 transition-opacity"
              style={{ color: '#4a90e2' }}
            >
              Vercel
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

