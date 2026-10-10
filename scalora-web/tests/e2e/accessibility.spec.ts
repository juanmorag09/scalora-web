import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/** Devuelve las infracciones resumidas para que un fallo se lea de un vistazo. */
async function violations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.map(
    (violation) => `${violation.id} (${violation.nodes.length}): ${violation.help}`,
  );
}

test('la página principal no tiene infracciones de accesibilidad', async ({ page }) => {
  await page.goto('/');
  expect(await violations(page)).toEqual([]);
});

test('el formulario con errores visibles sigue siendo accesible', async ({ page }) => {
  await page.goto('/#contacto');
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  await expect(page.getByRole('status')).toHaveText('Revisa los campos marcados.');

  expect(await violations(page)).toEqual([]);
});

test('el menú móvil abierto sigue siendo accesible', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Solo aplica al menú móvil');

  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();

  expect(await violations(page)).toEqual([]);
});

test('la página 404 no tiene infracciones de accesibilidad', async ({ page }) => {
  await page.goto('/404.html');
  expect(await violations(page)).toEqual([]);
});

test('todo objetivo táctil mide al menos 44 px', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Se mide con viewport móvil');

  await page.goto('/');
  const small = await page.locator('a:visible, button:visible').evaluateAll((elements) =>
    elements
      .map((element) => ({
        label: element.textContent.trim(),
        box: element.getBoundingClientRect(),
      }))
      .filter(({ box }) => box.width > 0 && box.height < 44)
      .map(({ label, box }) => `${label} (${Math.round(box.height)} px)`),
  );

  expect(small).toEqual([]);
});
