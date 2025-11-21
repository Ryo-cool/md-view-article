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
    if (src instanceof Blob) {
      return URL.createObjectURL(src);
    }
    if (typeof src !== 'string') return src;

    const candidates = [
      src,
      src.replace(/^\/+/, ''), // 先頭スラッシュ除去
      src.startsWith('/') ? src : `/${src}`,
      decodeURIComponent(src).replace(/^\/+/, ''),
      decodeURIComponent(src).startsWith('/') ? decodeURIComponent(src) : `/${decodeURIComponent(src)}`,
    ];

    for (const c of candidates) {
      if (imageMap?.[c]) return imageMap[c];
    }

    return src;
  };

  const components: Components = {
    ...markdownComponents,
    img: ({ src, alt, ...props }: ImgProps) => {
      // alt から imageMap を推測してヒットさせる
      const findByAlt = (altText?: string): string | undefined => {
        if (!altText || !imageMap) return undefined;
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const altNorm = normalize(altText);
        for (const [key, val] of Object.entries(imageMap)) {
          const file = key.split('/').pop() ?? key;
          const stem = file.split('.').slice(0, -1).join('.') || file;
          if (normalize(stem).includes(altNorm) || altNorm.includes(normalize(stem))) {
            return val;
          }
        }
        return undefined;
      };

      let resolved = resolveImg(src) ?? findByAlt(alt) ?? '';
      // 解決できなくても元のパスを残しておく（プロキシルートやpublic配信に任せる）
      if (!resolved && typeof src === 'string') {
        resolved = src;
      }

      // 画像解決のデバッグログ（本番でも確認可能）
      console.log('[MarkdownRenderer img]', {
        originalSrc: src,
        resolvedSrc: resolved,
        alt,
        hasImageMap: Boolean(imageMap && Object.keys(imageMap).length > 0),
        imageMapKeys: imageMap ? Object.keys(imageMap) : [],
        resolvedLength: typeof resolved === 'string' ? resolved.length : 0,
        sampleDataUrl: resolved?.startsWith('data:') ? resolved.slice(0, 60) : resolved,
      });

      return (
        <img
          src={resolved}
          alt={alt}
          className="max-w-full h-auto my-4 rounded-lg"
          {...props}
        />
      );
    },
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
