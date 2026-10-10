import { expect, test, type Page, type Request } from '@playwright/test';

const ENDPOINT = '**/__e2e__/contact';

const valid = {
  name: 'Ana Pérez',
  email: 'ana@empresa.com',
  message: 'Quiero automatizar la facturación de mi negocio.',
};

/** Campos por rol y nombre accesible, igual que los encuentra un lector de pantalla. */
const fields = (page: Page) => ({
  name: page.getByRole('textbox', { name: 'Nombre' }),
  email: page.getByRole('textbox', { name: 'Email' }),
  message: page.getByRole('textbox', { name: '¿Qué problema quieres resolver?' }),
});

async function fill(page: Page, values: Partial<typeof valid>): Promise<void> {
  const { name, email, message } = fields(page);
  if (values.name !== undefined) await name.fill(values.name);
  if (values.email !== undefined) await email.fill(values.email);
  if (values.message !== undefined) await message.fill(values.message);
}

/** Intercepta el endpoint y devuelve las peticiones que recibió. */
async function mockEndpoint(page: Page, status: number): Promise<Request[]> {
  const requests: Request[] = [];
  await page.route(ENDPOINT, async (route) => {
    requests.push(route.request());
    await route.fulfill({ status, contentType: 'application/json', body: '{}' });
  });
  return requests;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/#contacto');
});

test('un envío vacío marca los campos, enfoca el primero y no envía nada', async ({ page }) => {
  const requests = await mockEndpoint(page, 200);

  await page.getByRole('button', { name: 'Enviar mensaje' }).click();

  const name = fields(page).name;
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription('Escribe tu nombre.');
  await expect(fields(page).email).toHaveAttribute('aria-invalid', 'true');
  await expect(fields(page).message).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('status')).toHaveText('Revisa los campos marcados.');
  expect(requests).toHaveLength(0);
});

test('el error de un campo desaparece al corregirlo', async ({ page }) => {
  await fill(page, { ...valid, email: 'ana@' });
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();

  const email = fields(page).email;
  await expect(email).toHaveAttribute('aria-invalid', 'true');

  await email.fill(valid.email);

  await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#contact-email-error')).toBeHidden();
});

test('un envío válido manda el JSON, confirma y limpia el formulario', async ({ page }) => {
  const requests = await mockEndpoint(page, 200);

  await fill(page, valid);
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();

  await expect(page.getByRole('status')).toHaveText('Gracias, recibimos tu mensaje.');
  expect(requests).toHaveLength(1);
  expect(requests[0]?.method()).toBe('POST');
  expect(requests[0]?.postDataJSON()).toEqual(valid);
  await expect(fields(page).name).toHaveValue('');
});

test('si el servidor falla, avisa y conserva lo escrito', async ({ page }) => {
  await mockEndpoint(page, 500);

  await fill(page, valid);
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();

  await expect(page.getByRole('status')).toHaveText(
    'No pudimos enviar el mensaje. Inténtalo de nuevo en unos minutos.',
  );
  await expect(fields(page).name).toHaveValue(valid.name);
  await expect(page.getByRole('button', { name: 'Enviar mensaje' })).toBeEnabled();
});

test('sin endpoint configurado lo dice en lugar de fingir un envío', async ({ page }) => {
  const requests = await mockEndpoint(page, 200);
  await page.locator('[data-contact-form]').evaluate((form: HTMLFormElement) => {
    form.dataset['endpoint'] = '';
  });

  await fill(page, valid);
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();

  await expect(page.getByRole('status')).toHaveText(
    'El envío del formulario todavía no está conectado.',
  );
  expect(requests).toHaveLength(0);
});

test('un bot que rellena el campo trampa no llega al endpoint', async ({ page }) => {
  const requests = await mockEndpoint(page, 200);

  await fill(page, valid);
  await page.locator('input[name="website"]').evaluate((input: HTMLInputElement) => {
    input.value = 'https://spam.example';
  });
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();

  await expect(page.getByRole('status')).toHaveText('Gracias, recibimos tu mensaje.');
  expect(requests).toHaveLength(0);
});
