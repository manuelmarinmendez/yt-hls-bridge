// api/live/[id].js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/'); // .../api/live/<VIDEO_ID>
    const videoId = parts[parts.length - 1] || '';
    if (!videoId) {
      return new Response('Falta el videoId', { status: 400 });
    }

    const apiBase = process.env.PIPED_API_BASE || 'https://pipedapi.kavin.rocks';
    const r = await fetch(`${apiBase}/streams/${videoId}`, {
      // Evita caches agresivos entre llamadas
      headers: { 'cache-control': 'no-cache' },
    });

    if (!r.ok) {
      return new Response('No se pudo consultar Piped', { status: 502 });
    }

    const data = await r.json();
    // Para directos, Piped entrega un campo "hls" con la playlist HLS (.m3u8)
    if (!data?.hls) {
      return new Response('Este video no es un directo (sin HLS)', { status: 400 });
    }

    // Redirige a la playlist HLS actual
    return Response.redirect(data.hls, 302);
  } catch (e) {
    return new Response('Error interno', { status: 500 });
  }
}
