import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('todos los enlaces internos apuntan a una sección existente', async ({ page }) => {
  const broken = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
      .map((anchor) => anchor.getAttribute('href') ?? '')
      .filter((href) => href.length < 2 || !document.getElementById(href.slice(1))),
  );

  expect(broken).toEqual([]);
});

test('el enlace de salto es lo primero que recibe el foco', async ({ page }) => {
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Saltar al contenido' });

  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
});

test.describe('escritorio', () => {
  test.skip(({ isMobile }) => isMobile, 'Solo aplica al menú de escritorio');

  test('el menú está visible y no hay botón de menú', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Principal' });

    await expect(nav.getByRole('link', { name: 'Servicios' })).toBeVisible();
    await expect(page.locator('[data-nav-toggle]')).toBeHidden();
  });

  test('un enlace del menú lleva a su sección', async ({ page }) => {
    await page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Proceso' })
      .click();

    await expect(page).toHaveURL(/#proceso$/);
    await expect(
      page.getByRole('heading', { name: 'Seis etapas, de la idea al crecimiento.' }),
    ).toBeInViewport();
  });
});

test.describe('móvil', () => {
  test.skip(({ isMobile }) => !isMobile, 'Solo aplica al menú móvil');

  test('el menú empieza cerrado y se abre con el botón', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Principal' });
    const toggle = page.getByRole('button', { name: 'Abrir menú' });

    await expect(nav).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();

    await expect(nav.getByRole('link', { name: 'Servicios' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  test('Escape cierra el menú y devuelve el foco al botón', async ({ page }) => {
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
  });

  test('elegir un enlace cierra el menú y navega', async ({ page }) => {
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Servicios' })
      .click();

    await expect(page).toHaveURL(/#servicios$/);
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden();
  });
});
