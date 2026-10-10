/**
 * Reglas del formulario de contacto. Módulo puro (sin DOM) para poder
 * probarlo de forma aislada y reutilizarlo en un backend si hiciera falta.
 */

export const HONEYPOT_FIELD = 'website';

export const FIELD_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  message: { min: 10, max: 2000 },
} as const;

export const SUBMIT_TIMEOUT_MS = 10_000;

export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export type ContactField = keyof ContactValues;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const CONTACT_FIELDS = [
  'name',
  'email',
  'message',
] as const satisfies readonly ContactField[];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readText(data: FormData, field: string): string {
  const value = data.get(field);
  return typeof value === 'string' ? value.trim() : '';
}

export function readContactValues(data: FormData): ContactValues {
  return {
    name: readText(data, 'name'),
    email: readText(data, 'email'),
    message: readText(data, 'message'),
  };
}

/** Un bot que rellena todos los campos también rellena el campo trampa. */
export function isSpam(data: FormData): boolean {
  return readText(data, HONEYPOT_FIELD) !== '';
}

export function validateField(field: ContactField, rawValue: string): string | undefined {
  const value = rawValue.trim();

  switch (field) {
    case 'name':
      if (value === '') return 'Escribe tu nombre.';
      if (value.length < FIELD_LIMITS.name.min)
        return `El nombre debe tener al menos ${FIELD_LIMITS.name.min} caracteres.`;
      if (value.length > FIELD_LIMITS.name.max)
        return `El nombre no puede superar ${FIELD_LIMITS.name.max} caracteres.`;
      return undefined;

    case 'email':
      if (value === '') return 'Escribe tu correo electrónico.';
      if (value.length > FIELD_LIMITS.email.max || !EMAIL_PATTERN.test(value))
        return 'Escribe un correo válido, por ejemplo nombre@empresa.com.';
      return undefined;

    case 'message':
      if (value === '') return 'Cuéntanos qué problema quieres resolver.';
      if (value.length < FIELD_LIMITS.message.min)
        return `Danos un poco más de detalle (mínimo ${FIELD_LIMITS.message.min} caracteres).`;
      if (value.length > FIELD_LIMITS.message.max)
        return `El mensaje no puede superar ${FIELD_LIMITS.message.max} caracteres.`;
      return undefined;
  }
}

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  for (const field of CONTACT_FIELDS) {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  }

  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0;
}

export type SubmitResult = { ok: true } | { ok: false; reason: 'network' | 'server' };

/** Envía el mensaje como JSON. Nunca lanza: devuelve el motivo del fallo. */
export async function submitContact(
  endpoint: string,
  values: ContactValues,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = SUBMIT_TIMEOUT_MS,
): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(values),
      signal: controller.signal,
    });

    return response.ok ? { ok: true } : { ok: false, reason: 'server' };
  } catch {
    return { ok: false, reason: 'network' };
  } finally {
    clearTimeout(timer);
  }
}
