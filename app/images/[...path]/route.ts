import { fetchImage } from '@/lib/content';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const params = await Promise.resolve(ctx.params);
  const joined = params.path.join('/');
  const relPath = joined.startsWith('images/') ? joined : `images/${joined}`;

  try {
    const dataUrl = await fetchImage(relPath);
    if (!dataUrl) {
      return new Response('Not Found', { status: 404 });
    }

    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) {
      return new Response('Invalid data URL', { status: 500 });
    }

    const mime = match[1] || 'application/octet-stream';
    const buf = Buffer.from(match[2], 'base64');

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[images route] fetch error', { relPath, error });
    return new Response('Internal Server Error', { status: 500 });
  }
}
