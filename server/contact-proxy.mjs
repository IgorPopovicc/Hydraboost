import express from 'express';

// Node preview/optional SSR forwards to the same PHP implementation used on DreamWeb.
// The origin is server-only; never read it from a request or ship it to Angular.
export function mountContactProxy(app) {
  app.all(['/api/contact', '/api/contact.php'], express.raw({ type: () => true, limit: '16kb' }), async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      response.status(405).json({ ok: false });
      return;
    }
    try {
      const upstream = await fetch(process.env['CONTACT_BACKEND_URL'] || 'http://127.0.0.1:8081/api/contact', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(22_000),
        headers: {
          'Content-Type': request.get('content-type') || '',
          Origin: request.get('origin') || '',
          'Sec-Fetch-Site': request.get('sec-fetch-site') || '',
          'Idempotency-Key': request.get('idempotency-key') || '',
        },
        body: request.body,
      });
      const data = await upstream.json();
      if (upstream.headers.has('retry-after')) response.setHeader('Retry-After', upstream.headers.get('retry-after'));
      if (upstream.ok && data?.ok === true && data?.status === 'accepted') {
        response.json({ ok: true, status: 'accepted' });
      } else response.status(upstream.ok ? 502 : upstream.status).json({ ok: false });
    } catch {
      response.status(503).json({ ok: false });
    }
  });
  app.use('/api', (_request, response) => response.status(404).json({ ok: false }));
  app.use((error, _request, response, next) => {
    if (error?.type === 'entity.too.large') {
      response.status(413).set('Cache-Control', 'no-store').json({ ok: false });
    } else next(error);
  });
}
