// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField } from 'astro/config';

// La URL y la ruta base llegan por entorno para que el mismo código sirva en
// local, en GitHub Pages de proyecto (/repo) o en un dominio propio (/).
const site = process.env.SITE_URL ?? 'http://localhost:4321';
const base = normalizeBase(process.env.BASE_PATH);

/**
 * Acepta `repo`, `/repo` o `/repo/` y devuelve siempre `/repo/` (o `/`).
 * @param {string | undefined} value
 */
function normalizeBase(value) {
  const trimmed = (value ?? '').replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? '/' : `/${trimmed}/`;
}

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  env: {
    schema: {
      PUBLIC_CONTACT_ENDPOINT: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_CONTACT_EMAIL: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },
});
