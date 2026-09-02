interface Env {
  DB: D1Database;
  GIFT_HASH_SECRET: string;
  ALLOWED_ORIGIN: string;
}

const encoder = new TextEncoder();

function json(data: unknown, status = 200, origin = '*') {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'cache-control': 'no-store',
    },
  });
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function giftKey(id: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(id));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function allowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get('origin') ?? '';
  if (origin === env.ALLOWED_ORIGIN || origin.startsWith('http://localhost:')) return origin;
  return env.ALLOWED_ORIGIN;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = allowedOrigin(request, env);
    if (request.method === 'OPTIONS') return json({}, 204, origin);

    if (request.method === 'GET' && url.pathname === '/api/gifts') {
      const ids = (url.searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, 50);
      const items = await Promise.all(ids.map(async (id) => {
        const key = await giftKey(id, env.GIFT_HASH_SECRET);
        const row = await env.DB.prepare('SELECT 1 AS reserved FROM reservations WHERE gift_key = ?1').bind(key).first();
        return { id, availability: row ? 'reserved' : 'available' };
      }));
      return json(items, 200, origin);
    }

    const reserveMatch = url.pathname.match(/^\/api\/gifts\/([a-z0-9-]+)\/reserve$/);
    if (request.method === 'POST' && reserveMatch) {
      const id = reserveMatch[1];
      const token = randomToken();
      const key = await giftKey(id, env.GIFT_HASH_SECRET);
      try {
        await env.DB.prepare('INSERT INTO reservations (gift_key, cancel_token_hash, created_at) VALUES (?1, ?2, ?3)')
          .bind(key, await sha256(token), Date.now()).run();
        return json({ cancelToken: token }, 201, origin);
      } catch {
        return json({ error: 'already_reserved' }, 409, origin);
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/reservations/cancel') {
      const payload = await request.json().catch(() => ({})) as { token?: string };
      if (!payload.token || payload.token.length < 32) return json({ error: 'invalid_token' }, 400, origin);
      const result = await env.DB.prepare('DELETE FROM reservations WHERE cancel_token_hash = ?1').bind(await sha256(payload.token)).run();
      return json({ cancelled: result.meta.changes > 0 }, 200, origin);
    }

    return json({ error: 'not_found' }, 404, origin);
  },
};
