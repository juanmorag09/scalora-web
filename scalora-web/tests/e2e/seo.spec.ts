import { expect, test } from '@playwright/test';

/** Las pruebas compilan el sitio con SITE_URL=https://scalora.test (ver playwright.config.ts). */
const SITE = 'https://scalora.test';

test.describe('metadatos de la página principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('declara idioma, título y descripción', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page).toHaveTitle('Scalora — De la idea al negocio escalable');

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length).toBeGreaterThan(70);
  });

  test('la URL canónica y las de Open Graph son absolutas', async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${SITE}/`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `${SITE}/og-image.png`,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
  });

  test('incluye datos estructurados válidos de la organización', async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw ?? '{}') as Record<string, unknown>;

    expect(data['@type']).toBe('Organization');
    expect(data['name']).toBe('Scalora');
    expect(data['url']).toBe(`${SITE}/`);
  });

  test('tiene un único h1 y los encabezados no saltan niveles', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);

    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    const jumps = levels.filter(
      (level, index) => index > 0 && level - (levels[index - 1] ?? 0) > 1,
    );

    expect(jumps).toEqual([]);
  });
});

test.describe('archivos para buscadores y redes', () => {
  test('robots.txt permite el rastreo y apunta al sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    const body = await response.text();

    expect(response.ok()).toBe(true);
    expect(body).toContain('Allow: /');
    expect(body).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  });

  test('el sitemap lista la portada y no la página de error', async ({ request }) => {
    const body = await (await request.get('/sitemap-0.xml')).text();

    expect(body).toContain(`<loc>${SITE}/</loc>`);
    expect(body).not.toContain('404');
  });

  test('el favicon y la imagen para compartir existen', async ({ request }) => {
    const favicon = await request.get('/favicon.svg');
    const ogImage = await request.get('/og-image.png');

    expect(favicon.ok()).toBe(true);
    expect(ogImage.ok()).toBe(true);
    expect(ogImage.headers()['content-type']).toContain('image/png');
  });
});

test('la página 404 no se indexa y ofrece volver al inicio', async ({ page }) => {
  await page.goto('/404.html');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Esta página no existe.');
  await expect(page.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
});
