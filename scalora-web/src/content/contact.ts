export const contactSection = {
  eyebrow: 'Contacto',
  title: 'Cuéntanos sobre tu idea.',
  lead: 'Comenzamos con el problema del negocio, construimos la solución y acompañamos su evolución.',
  emailLead: 'También puedes escribirnos a',
} as const;

export const contactForm = {
  fields: {
    name: { label: 'Nombre', placeholder: 'Tu nombre' },
    email: { label: 'Email', placeholder: 'tu@empresa.com' },
    message: {
      label: '¿Qué problema quieres resolver?',
      placeholder: 'Cuéntanos sobre tu idea o tu negocio',
    },
  },
  submit: 'Enviar mensaje',
  status: {
    sending: 'Enviando…',
    success: 'Gracias, recibimos tu mensaje.',
    invalid: 'Revisa los campos marcados.',
    failed: 'No pudimos enviar el mensaje. Inténtalo de nuevo en unos minutos.',
    notConfigured: 'El envío del formulario todavía no está conectado.',
  },
} as const;
