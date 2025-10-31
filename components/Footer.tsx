export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Markdown Docs. All rights reserved.</p>
          <p className="mt-2">
            Powered by{' '}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Next.js
            </a>
            {' '}and{' '}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Vercel
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

