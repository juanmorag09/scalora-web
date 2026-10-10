import { contactForm } from '@/content/contact';
import {
  CONTACT_FIELDS,
  hasErrors,
  isSpam,
  readContactValues,
  submitContact,
  validateContact,
  validateField,
  type ContactErrors,
  type ContactField,
} from '@/lib/contact-form';

type StatusState = 'idle' | 'sending' | 'success' | 'error';
type FieldControl = HTMLInputElement | HTMLTextAreaElement;

const { status: messages } = contactForm;

/** Conecta la validación accesible y el envío asíncrono al formulario de contacto. */
export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const statusElement = form.querySelector<HTMLElement>('[data-form-status]');
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  let attempted = false;

  // La validación propia sustituye a la del navegador; sin JS sigue actuando la nativa.
  form.noValidate = true;

  const controlOf = (field: ContactField): FieldControl | null => {
    const control = form.elements.namedItem(field);
    return control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement
      ? control
      : null;
  };

  const showFieldError = (field: ContactField, message: string | undefined): void => {
    const control = controlOf(field);
    const errorElement = form.querySelector<HTMLElement>(
      `[data-field="${field}"] [data-field-error]`,
    );
    if (!control || !errorElement) return;

    if (message) {
      control.setAttribute('aria-invalid', 'true');
      errorElement.textContent = message;
      errorElement.hidden = false;
    } else {
      control.removeAttribute('aria-invalid');
      errorElement.textContent = '';
      errorElement.hidden = true;
    }
  };

  const showErrors = (errors: ContactErrors): void => {
    for (const field of CONTACT_FIELDS) showFieldError(field, errors[field]);
  };

  const setStatus = (state: StatusState, message = ''): void => {
    if (!statusElement) return;
    statusElement.dataset['state'] = state;
    statusElement.textContent = message;
  };

  const setBusy = (busy: boolean): void => {
    if (submitButton) submitButton.disabled = busy;
    form.setAttribute('aria-busy', String(busy));
  };

  // Tras el primer intento, cada campo se corrige en vivo mientras se escribe.
  for (const field of CONTACT_FIELDS) {
    controlOf(field)?.addEventListener('input', (event) => {
      if (!attempted) return;
      const control = event.currentTarget as FieldControl;
      showFieldError(field, validateField(field, control.value));
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    attempted = true;

    const data = new FormData(form);
    const values = readContactValues(data);
    const errors = validateContact(values);
    showErrors(errors);

    if (hasErrors(errors)) {
      setStatus('error', messages.invalid);
      const firstInvalid = CONTACT_FIELDS.find((field) => errors[field]);
      if (firstInvalid) controlOf(firstInvalid)?.focus();
      return;
    }

    // A un bot se le responde como si todo hubiera salido bien, sin enviar nada.
    if (isSpam(data)) {
      form.reset();
      setStatus('success', messages.success);
      return;
    }

    const endpoint = form.dataset['endpoint'] ?? '';
    if (endpoint === '') {
      setStatus('error', messages.notConfigured);
      return;
    }

    setBusy(true);
    setStatus('sending', messages.sending);

    void submitContact(endpoint, values).then((result) => {
      setBusy(false);

      if (result.ok) {
        form.reset();
        attempted = false;
        setStatus('success', messages.success);
      } else {
        setStatus('error', messages.failed);
      }
    });
  });
}
