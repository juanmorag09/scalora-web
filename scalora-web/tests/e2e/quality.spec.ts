import { expect, test } from '@playwright/test';

/** Presupuesto de JavaScript propio, en bytes sin comprimir. El sitio es casi todo HTML y CSS. */
const JS_BUDGET_BYTES = 20_000;

test('no hay desbordamiento horizontal en ningún ancho habitual', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `ancho ${width}px`).toBeLessThanOrEqual(0);
  }
});

test('carga sin errores de consola ni peticiones fallidas', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`consola: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`excepción: ${error.message}`));
  page.on('requestfailed', (request) => problems.push(`petición fallida: ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`${response.status()}: ${response.url()}`);
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  expect(problems).toEqual([]);
});

test('no depende de terceros y respeta el presupuesto de JavaScript', async ({ page, baseURL }) => {
  const origin = new URL(baseURL ?? '').origin;
  const thirdParty: string[] = [];
  let scriptBytes = 0;

  page.on('response', async (response) => {
    const url = new URL(response.url());
    if (url.origin !== origin) thirdParty.push(url.href);
    if (response.request().resourceType() === 'script') {
      scriptBytes += (await response.body()).byteLength;
    }
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  const inlineBytes = await page
    .locator('script:not([type="application/ld+json"])')
    .evaluateAll((scripts) =>
      scripts.reduce((total, script) => total + script.textContent.length, 0),
    );

  expect(thirdParty).toEqual([]);
  expect(scriptBytes + inlineBytes).toBeLessThan(JS_BUDGET_BYTES);
});

test('las fuentes de marca se aplican', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const loaded = await page.evaluate(() => ({
    display: document.fonts.check('600 16px "Sora Variable"'),
    body: document.fonts.check('400 16px "Instrument Sans Variable"'),
  }));

  expect(loaded).toEqual({ display: true, body: true });
});
