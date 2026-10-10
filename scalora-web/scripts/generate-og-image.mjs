/**
 * Genera `public/og-image.png` (1200 × 630), la imagen que se ve al compartir el enlace.
 * Uso: `npm run og`. Vuelve a ejecutarlo si cambian el lema o los colores de marca.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = new URL('../', import.meta.url);
const output = fileURLToPath(new URL('public/og-image.png', root));

const fontDataUrl = async (path) => {
  const file = await readFile(new URL(`node_modules/${path}`, root));
  return `data:font/woff2;base64,${file.toString('base64')}`;
};

const [sora, mono] = await Promise.all([
  fontDataUrl('@fontsource-variable/sora/files/sora-latin-wght-normal.woff2'),
  fontDataUrl('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'),
]);

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  @font-face { font-family: 'Sora'; src: url('${sora}') format('woff2'); font-weight: 100 800; }
  @font-face { font-family: 'JetBrains Mono'; src: url('${mono}') format('woff2'); font-weight: 100 800; }
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; background: #0b0d12; color: #f2f4f7; font-family: 'Sora', sans-serif;
         display: flex; align-items: stretch; justify-content: space-between; padding: 72px; gap: 56px; }
  .copy { display: flex; flex-direction: column; justify-content: space-between; flex: 1; }
  .brand { display: flex; align-items: center; gap: 18px; font-weight: 700; font-size: 30px; letter-spacing: 0.14em; }
  .mark { display: flex; align-items: flex-end; gap: 5px; height: 32px; }
  .mark i { display: block; width: 8px; background: #f2f4f7; }
  .mark i:nth-child(1) { height: 40%; } .mark i:nth-child(2) { height: 70%; }
  .mark i:nth-child(3) { height: 100%; background: #c6f432; }
  h1 { font-weight: 600; font-size: 76px; line-height: 1.04; letter-spacing: -0.03em; }
  h1 span { color: #c6f432; }
  .tagline { font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #a3abba; letter-spacing: 0.04em; }
  .stairs { display: flex; align-items: flex-end; gap: 14px; width: 330px; }
  .stairs div { flex: 1; border-radius: 16px; background: #12151c; border: 1px solid #232936; }
  .stairs div:nth-child(1) { height: 38%; }
  .stairs div:nth-child(2) { height: 66%; background: #171b24; border-color: #2b3242; }
  .stairs div:nth-child(3) { height: 100%; background: #c6f432; border-color: #c6f432; }
</style>
</head>
<body>
  <div class="copy">
    <div class="brand"><span class="mark"><i></i><i></i><i></i></span>SCALORA</div>
    <h1>De la idea al <span>negocio escalable.</span></h1>
    <p class="tagline">Build. Automate. Scale.</p>
  </div>
  <div class="stairs"><div></div><div></div><div></div></div>
</body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: output, type: 'png' });
  console.warn(`Imagen generada en ${output}`);
} finally {
  await browser.close();
}
