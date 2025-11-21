'use client';

/* eslint-disable @next/next/no-img-element */
import ReactMarkdown from 'react-markdown';
import type React from 'react';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import * as rehypeGithubAlertsModule from 'rehype-github-alerts';
import { markdownComponents } from '@/lib/markdownComponents';

const rehypeGithubAlerts = rehypeGithubAlertsModule.rehypeGithubAlerts;

interface MarkdownRendererProps {
  content: string;
  imageMap?: Record<string, string>;
}

type ImgProps = React.ImgHTMLAttributes<HTMLImageElement> & { src?: string | Blob; alt?: string };

export default function MarkdownRenderer({ content, imageMap }: MarkdownRendererProps) {
  // data URL などに置き換えるための resolver
  const resolveImg = (src: string | Blob | undefined) => {
    if (!src) return src;
    if (typeof src === 'string') {
      if (imageMap?.[src]) return imageMap[src];
      if (src.startsWith('/') && imageMap?.[src.substring(1)]) return imageMap[src.substring(1)];
      return src;
    }
    // Blob が来た場合は一時URLを返す
    if (src instanceof Blob) {
      return URL.createObjectURL(src);
    }
    return String(src);
  };

  const components: Components = {
    ...markdownComponents,
    img: ({ src, alt, ...props }: ImgProps) => (
      <img
        src={resolveImg(src) ?? ''}
        alt={alt}
        className="max-w-full h-auto my-4 rounded-lg"
        {...props}
      />
    ),
  };

  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeGithubAlerts, rehypeRaw]}
    >
      {content}
    </ReactMarkdown>
  );
}
