const DJ_HOST = 'dj-track-audio-analysis-api.p.rapidapi.com';
const SPOTIFY_HOST = 'spotify-extended-audio-features-api.p.rapidapi.com';

export async function onRequestGet(context) {
  const { request, env } = context;
  const key = env.MUSICAE_API_KEY;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'health') {
    return Response.json({ ok: !!key, service: 'Musicae' }, { status: key ? 200 : 503 });
  }
  if (!key) return Response.json({ error: 'MUSICAE_API_KEY is not configured in Cloudflare Pages.' }, { status: 503 });

  let host, path;
  const q = new URLSearchParams();
  for (const [k, v] of url.searchParams) if (k !== 'action') q.set(k, v);

  if (action === 'search') {
    host = SPOTIFY_HOST;
    path = '/v1/search';
    q.set('type', q.get('type') || 'track');
    q.set('limit', q.get('limit') || '8');
  } else if (action === 'track') {
    host = SPOTIFY_HOST;
    const id = q.get('id');
    if (!id) return Response.json({ error: 'Missing track id.' }, { status: 400 });
    q.delete('id');
    path = `/v1/tracks/${encodeURIComponent(id)}`;
  } else if (action === 'analyze') {
    host = DJ_HOST;
    const id = q.get('id');
    if (!id) return Response.json({ error: 'Missing track id.' }, { status: 400 });
    q.delete('id');
    path = `/v2/audio-analysis/${encodeURIComponent(id)}`;
  } else if (action === 'radio') {
    host = DJ_HOST;
    path = '/v2/radio';
  } else if (action === 'tracks') {
    host = SPOTIFY_HOST;
    path = '/v1/tracks';
  } else {
    return Response.json({ error: 'Unknown music API action.' }, { status: 400 });
  }

  const target = `https://${host}${path}${q.toString() ? `?${q}` : ''}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  let upstream;
  try {
    upstream = await fetch(target, {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': host,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
  } catch (err) {
    clearTimeout(timeout);
    return Response.json({ error: `Upstream music service timeout/unreachable: ${err?.message || err}` }, { status: 504 });
  }
  clearTimeout(timeout);
  const body = await upstream.text();
  if (!body) return Response.json({ error: `Music service returned an empty response (${upstream.status}).` }, { status: upstream.status || 502 });
  return new Response(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      'cache-control': action === 'search' ? 'public, max-age=60' : 'public, max-age=120'
    }
  });
}
