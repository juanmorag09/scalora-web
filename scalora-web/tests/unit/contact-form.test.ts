import { describe, expect, it, vi } from 'vitest';
import {
  FIELD_LIMITS,
  HONEYPOT_FIELD,
  hasErrors,
  isSpam,
  readContactValues,
  submitContact,
  validateContact,
  validateField,
  type ContactValues,
} from '@/lib/contact-form';

const valid: ContactValues = {
  name: 'Ana Pérez',
  email: 'ana@empresa.com',
  message: 'Quiero automatizar la facturación de mi negocio.',
};

function formData(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe('validateContact', () => {
  it('acepta un mensaje completo y válido', () => {
    const errors = validateContact(valid);
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it('marca los tres campos cuando el formulario llega vacío', () => {
    const errors = validateContact({ name: '', email: '', message: '' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name']);
    expect(hasErrors(errors)).toBe(true);
  });

  it('trata los espacios en blanco como campo vacío', () => {
    expect(validateContact({ ...valid, name: '   ' }).name).toBe('Escribe tu nombre.');
  });
});

describe('validateField', () => {
  it.each([
    ['sin arroba', 'ana.empresa.com'],
    ['sin dominio', 'ana@'],
    ['sin extensión', 'ana@empresa'],
    ['con espacios', 'ana perez@empresa.com'],
    ['extensión de una letra', 'ana@empresa.c'],
  ])('rechaza un correo %s', (_caso, email) => {
    expect(validateField('email', email)).toBeDefined();
  });

  it.each(['ana@empresa.com', 'a.b+c@sub.dominio.co', '  ana@empresa.com  '])(
    'acepta el correo %s',
    (email) => {
      expect(validateField('email', email)).toBeUndefined();
    },
  );

  it('respeta los límites de longitud del nombre', () => {
    expect(validateField('name', 'A')).toBeDefined();
    expect(validateField('name', 'A'.repeat(FIELD_LIMITS.name.min))).toBeUndefined();
    expect(validateField('name', 'A'.repeat(FIELD_LIMITS.name.max))).toBeUndefined();
    expect(validateField('name', 'A'.repeat(FIELD_LIMITS.name.max + 1))).toBeDefined();
  });

  it('respeta los límites de longitud del mensaje', () => {
    expect(validateField('message', 'x'.repeat(FIELD_LIMITS.message.min - 1))).toBeDefined();
    expect(validateField('message', 'x'.repeat(FIELD_LIMITS.message.min))).toBeUndefined();
    expect(validateField('message', 'x'.repeat(FIELD_LIMITS.message.max))).toBeUndefined();
    expect(validateField('message', 'x'.repeat(FIELD_LIMITS.message.max + 1))).toBeDefined();
  });
});

describe('readContactValues', () => {
  it('recorta los espacios de cada campo', () => {
    const data = formData({ name: '  Ana ', email: ' ana@empresa.com ', message: ' Hola equipo ' });
    expect(readContactValues(data)).toEqual({
      name: 'Ana',
      email: 'ana@empresa.com',
      message: 'Hola equipo',
    });
  });

  it('devuelve cadenas vacías cuando faltan campos', () => {
    expect(readContactValues(new FormData())).toEqual({ name: '', email: '', message: '' });
  });
});

describe('isSpam', () => {
  it('detecta el campo trampa relleno', () => {
    expect(isSpam(formData({ [HONEYPOT_FIELD]: 'https://spam.example' }))).toBe(true);
  });

  it('deja pasar un envío normal', () => {
    expect(isSpam(formData({ [HONEYPOT_FIELD]: '' }))).toBe(false);
    expect(isSpam(new FormData())).toBe(false);
  });
});

describe('submitContact', () => {
  const endpoint = 'https://api.example/contact';

  it('envía los valores como JSON por POST', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 200 }));

    const result = await submitContact(endpoint, valid, fetchMock);

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(endpoint);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual(valid);
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
  });

  it('informa un fallo del servidor sin lanzar', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 500 }));
    await expect(submitContact(endpoint, valid, fetchMock)).resolves.toEqual({
      ok: false,
      reason: 'server',
    });
  });

  it('informa un fallo de red sin lanzar', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(submitContact(endpoint, valid, fetchMock)).resolves.toEqual({
      ok: false,
      reason: 'network',
    });
  });

  it('corta la petición cuando se agota el tiempo de espera', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    await expect(submitContact(endpoint, valid, fetchMock, 10)).resolves.toEqual({
      ok: false,
      reason: 'network',
    });
  });
});
