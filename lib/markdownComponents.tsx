import type { Components } from 'react-markdown';
import type { ReactElement } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '@/components/Mermaid';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// Markdown レンダリング時のカスタムコンポーネント
export const markdownComponents: Components = {
  h1: ({ children, ...props }: any) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-3xl font-bold mt-6 mb-3 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-2xl font-semibold mt-5 mb-2 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-xl font-semibold mt-4 mb-2 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: any) => (
    <h5 className="text-lg font-semibold mt-3 mb-2 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: any) => (
    <h6 className="text-base font-semibold mt-3 mb-2 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h6>
  ),
  p: ({ children, ...props }: any) => (
    <p className="mb-4 leading-7" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc mb-4 space-y-2 ml-6 pl-1" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal mb-4 space-y-2 ml-6 pl-1" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="mb-1 leading-7" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="neu-pressed pl-6 pr-4 italic my-4 py-4" style={{
      color: '#5a6c7d',
      borderLeft: '4px solid rgba(74, 144, 226, 0.6)'
    }} {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4 neu-pressed p-4">
      <table className="min-w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead style={{ background: 'rgba(163, 177, 198, 0.2)' }} {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-4 py-2 text-left font-bold" style={{
      color: '#2c3e50',
      borderBottom: '2px solid rgba(163, 177, 198, 0.3)'
    }} {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-4 py-2" style={{
      color: '#5a6c7d',
      borderBottom: '1px solid rgba(163, 177, 198, 0.2)'
    }} {...props}>
      {children}
    </td>
  ),
  pre: ({ children, ...props }: any) => {
    const child = Array.isArray(children) ? (children[0] as ReactElement) : (children as ReactElement);
    const childProps = (child?.props ?? {}) as {
      className?: string;
      children?: string | string[] | ReactElement;
    };
    const className = childProps.className ?? '';
    const match = /language-(\w+)/.exec(className);
    const language = match && match[1];
    const rawChildren = childProps.children;
    const codeContent =
      typeof rawChildren === 'string'
        ? rawChildren
        : Array.isArray(rawChildren)
          ? rawChildren.join('')
          : rawChildren
            ? String(rawChildren)
            : '';

    if (language === 'mermaid') {
      return <Mermaid chart={codeContent.trim()} />;
    }

    return (
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneLight}
        customStyle={{
          margin: '1rem 0',
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          background: 'transparent',
          borderRadius: '8px',
        }}
        PreTag="pre"
        codeTagProps={{
          style: {
            fontFamily:
              'var(--font-geist-mono), "Fira Code", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
          },
        }}
        {...props}
      >
        {codeContent.replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  },
  code({ inline, className, children, ...props }: any) {
    const isInline = typeof inline === 'boolean' ? inline : true;
    if (!isInline) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="neu-pressed px-2 py-1 rounded text-sm font-mono"
        style={{
          color: '#c7254e',
          display: 'inline-block',
        }}
        {...props}
      >
        {children}
      </code>
    );
  },
  a({ href, children, ...props }: any) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold hover:opacity-70 transition-opacity"
        style={{ color: '#4a90e2' }}
        {...props}
      >
        {children}
      </a>
    );
  },
  strong: ({ children, ...props }: any) => (
    <strong
      className="font-bold"
      style={{
        fontWeight: 700,
        display: 'inline',
      }}
      {...props}
    >
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </em>
  ),
  hr: ({ ...props }: any) => (
    <hr className="my-8" style={{
      border: 'none',
      height: '2px',
      background: 'linear-gradient(90deg, transparent, rgba(163, 177, 198, 0.5), transparent)'
    }} {...props} />
  ),
  img: ({ src, alt, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto my-4 rounded-lg"
      {...props}
    />
  ),
};
