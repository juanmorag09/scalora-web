import type { APIRoute } from 'astro';
import { withBase } from '@/lib/url';

/** robots.txt generado en el build para que la URL del sitemap siga a `SITE_URL`. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(withBase('sitemap-index.xml'), site);
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap.href}`, ''].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
