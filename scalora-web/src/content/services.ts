import type { Service } from '@/types/content';

export const servicesSection = {
  eyebrow: 'Qué hacemos',
  title: 'De la idea al negocio escalable.',
  lead: 'Combinamos estrategia, diseño, desarrollo de software, automatización, datos e infraestructura tecnológica para construir productos preparados para crecer.',
} as const;

export const services = [
  {
    id: 'producto',
    icon: 'product',
    title: 'Desarrollo de productos digitales',
    summary: 'Soluciones digitales diseñadas alrededor de las necesidades reales de cada negocio.',
    items: [
      'Aplicaciones web',
      'Plataformas digitales',
      'SaaS',
      'Sistemas empresariales',
      'E-commerce',
      'MVPs',
      'Portales y plataformas especializadas',
      'Dashboards y herramientas internas',
    ],
  },
  {
    id: 'automatizacion',
    icon: 'automation',
    title: 'Automatización',
    summary: 'Convertimos procesos repetitivos en sistemas automatizados.',
    items: [
      'Automatización de procesos',
      'Integraciones entre plataformas',
      'APIs',
      'Webhooks',
      'Automatización administrativa',
      'Flujos de trabajo',
      'Integración de herramientas empresariales',
    ],
  },
  {
    id: 'datos',
    icon: 'data',
    title: 'Datos e inteligencia',
    summary:
      'Convertimos los datos de una empresa en información útil para tomar mejores decisiones.',
    items: [
      'Dashboards',
      'Business Intelligence',
      'Analítica',
      'Reportes automatizados',
      'Integración de datos',
      'Inteligencia artificial',
      'Sistemas de recomendación',
    ],
  },
  {
    id: 'infraestructura',
    icon: 'infrastructure',
    title: 'Infraestructura tecnológica',
    summary: 'Construimos la infraestructura necesaria para que los productos puedan crecer.',
    items: [
      'Cloud',
      'AWS',
      'Bases de datos',
      'APIs',
      'CI/CD',
      'Seguridad',
      'Monitoreo',
      'Arquitecturas escalables',
      'Despliegue y mantenimiento',
    ],
  },
] as const satisfies readonly Service[];
