import { expect, test, type Page } from '@playwright/test';

/**
 * Elementos con revelado que se renderizan pero todavía no se ven (opacidad distinta de 1).
 * Los que el diseño oculta en ese tamaño (`display: none`) no cuentan.
 */
async function hiddenReveals(page: Page): Promise<number> {
  return page
    .locator('[data-reveal]')
    .evaluateAll(
      (elements) =>
        elements.filter(
          (element) => element.checkVisibility() && getComputedStyle(element).opacity !== '1',
        ).length,
    );
}

const splash = (page: Page) => page.locator('[data-splash]');
const headerLogo = (page: Page) => page.locator('.site-header__brand .logo');

async function activeStages(page: Page): Promise<number> {
  return page.locator('[data-journey-stage][data-active]').count();
}

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('todo el contenido queda visible y la secuencia completa', async ({ page }) => {
    await page.goto('/');

    expect(await hiddenReveals(page)).toBe(0);
    expect(await activeStages(page)).toBe(3);
  });
});

test('si el script de movimiento falla, el contenido aparece igualmente', async ({ page }) => {
  // El <head> marca `.js`, pero el script de movimiento rompe al arrancar (antes de
  // marcar `.motion-ready`). Astro incrusta los scripts pequeños en el HTML, así que
  // bloquear archivos .js no bastaría: se provoca el fallo desde dentro.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'matchMedia', {
      get() {
        throw new Error('Fallo simulado del script de movimiento');
      },
    });
  });
  page.on('pageerror', () => undefined);
  await page.goto('/');

  await expect.poll(() => hiddenReveals(page), { timeout: 6000 }).toBe(0);
});

test.describe('movimiento reducido', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('el contenido aparece al instante y la secuencia está completa', async ({ page }) => {
    await page.goto('/');

    await expect.poll(() => hiddenReveals(page)).toBe(0);
    expect(await activeStages(page)).toBe(3);
  });

  test('no se muestra la apertura de marca', async ({ page }) => {
    await page.goto('/');

    await expect(splash(page)).toBeHidden();
    await expect(headerLogo(page)).toBeVisible();
  });
});

test.describe('apertura de marca', () => {
  test('aparece al cargar y el logo termina en la cabecera', async ({ page }) => {
    await page.goto('/');

    await expect(splash(page)).toBeVisible();
    await expect(page.locator('[data-splash] .logo__word')).toHaveText('SCALORA');
    await expect(splash(page)).toHaveCount(0, { timeout: 5000 });
    await expect(headerLogo(page)).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/splash-active/);
  });

  test('en las páginas interiores solo anima el logo de la cabecera', async ({ page }) => {
    await page.goto('/servicios/');

    await expect(splash(page)).toHaveCount(0);
    await expect(headerLogo(page)).toBeVisible();
    const barAnimations = await page
      .locator('.site-header__brand .logo__bar')
      .evaluateAll((bars) => bars.map((bar) => getComputedStyle(bar).animationName));
    expect(barAnimations.every((name) => name !== 'none')).toBe(true);
  });

  test('volver a la portada en la misma visita no la repite', async ({ page }) => {
    await page.goto('/');
    await expect(splash(page)).toHaveCount(0, { timeout: 5000 });

    await page.goto('/servicios/');
    await page.goto('/');

    await expect(page.locator('html')).not.toHaveClass(/splash-active/);
    await expect(splash(page)).toBeHidden();
    await expect(headerLogo(page)).toBeVisible();
  });

  test('una tecla la salta al instante', async ({ page }) => {
    await page.goto('/');
    await expect(splash(page)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(splash(page)).toHaveCount(0, { timeout: 1000 });
    await expect(headerLogo(page)).toBeVisible();
  });

  test('si el script falla, se retira sola y el logo vuelve a la cabecera', async ({ page }) => {
    // El script de la apertura rompe al arrancar; queda solo el respaldo en CSS.
    await page.addInitScript(() => {
      Element.prototype.getAnimations = () => {
        throw new Error('Fallo simulado de la apertura');
      };
    });
    page.on('pageerror', () => undefined);
    await page.goto('/');

    await expect(splash(page)).toBeHidden({ timeout: 6000 });
    await expect(headerLogo(page)).toBeVisible({ timeout: 6000 });
  });
});

test.describe('sin JavaScript, la apertura', () => {
  test.use({ javaScriptEnabled: false });

  test('no aparece', async ({ page }) => {
    await page.goto('/');

    await expect(splash(page)).toBeHidden();
    await expect(headerLogo(page)).toBeVisible();
  });
});

test.describe('con movimiento', () => {
  test('el contenido se revela al desplazarse', async ({ page }) => {
    await page.goto('/');
    const lastHeading = page.getByRole('heading', { name: /¿Tienes una idea/ });

    await expect(lastHeading).not.toHaveClass(/is-revealed/);
    await lastHeading.scrollIntoViewIfNeeded();
    await expect(lastHeading).toHaveClass(/is-revealed/);
  });

  test('la barra cambia de estado al desplazarse', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('[data-header]');

    await expect(header).toHaveAttribute('data-scrolled', 'false');
    await page.mouse.wheel(0, 600);
    await expect(header).toHaveAttribute('data-scrolled', 'true');
  });

  test('Build → Automate → Scale avanza con el scroll, sin bloquearlo', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    expect(await activeStages(page)).toBeLessThan(3);

    const counts: number[] = [];
    for (let step = 0; step < 12; step += 1) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(80);
      counts.push(await activeStages(page));
    }

    // Nunca retrocede mientras se baja y termina con las tres etapas activas.
    expect(counts).toEqual([...counts].sort((a, b) => a - b));
    expect(counts.at(-1)).toBe(3);
    // El scroll siguió avanzando: la página no se quedó fija en la sección.
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(2000);
  });

  test('los problemas se recorren uno a uno y al final se ilumina la respuesta', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const section = page.locator('[data-spotlight]');
    const counter = page.locator('[data-spotlight-count]');
    const start = await page
      .locator('#problema')
      .evaluate((element) => (element as HTMLElement).offsetTop);

    const seen: number[] = [];
    for (let offset = start - 800; offset < start + 1400; offset += 120) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), offset);
      await page.waitForTimeout(60);
      seen.push(Number(await counter.textContent()));
      // Como mucho un problema en foco a la vez.
      expect(await page.locator('[data-spotlight-item][data-current]').count()).toBeLessThan(2);
    }

    // Empieza sin ninguno, avanza sin retroceder y termina en el último.
    expect(seen[0]).toBe(0);
    expect(seen).toEqual([...seen].sort((a, b) => a - b));
    expect(new Set(seen).size).toBeGreaterThan(5);
    expect(seen.at(-1)).toBe(10);
    await expect(section).toHaveAttribute('data-complete', '');
  });
});
