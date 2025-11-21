import { fetchImage } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: { path: string[] } }) {
  const relPath = ctx.params.path.join('/');

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
