import { site } from '@/config/site';
import type { PagePath } from '@/types/content';

/**
 * Encabezado y metadatos de cada página interior. `title` va al <title>
 * (máx. 60 caracteres) y `description` al meta description (70–200).
 */
export interface PageContent {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  lead: string;
}

const withName = (label: string): string => `${label} — ${site.name}`;

export const pages = {
  servicios: {
    title: withName('Servicios'),
    description:
      'Desarrollo de productos digitales, automatización, datos e infraestructura: los servicios con los que Scalora lleva una idea a un negocio escalable.',
    eyebrow: 'Servicios',
    heading: 'Todo lo que tu producto necesita para crecer.',
    lead: 'Estrategia, diseño, software, automatización, datos e infraestructura bajo un mismo equipo, pensados para negocios reales.',
  },
  proceso: {
    title: withName('Cómo trabajamos'),
    description:
      'Nuestro enfoque y las seis etapas con las que Scalora pasa de la idea al crecimiento: entender el negocio primero y construir después.',
    eyebrow: 'Cómo trabajamos',
    heading: 'Primero el negocio, después la tecnología.',
    lead: 'Un enfoque claro y un proceso por etapas para que cada decisión técnica responda a un objetivo de negocio.',
  },
  proyectos: {
    title: withName('Deployments'),
    description:
      'Deployments de Scalora: ideas convertidas en productos digitales y productos convertidos en negocios preparados para escalar.',
    eyebrow: 'Deployments',
    heading: 'Lo que hemos construido.',
    lead: 'Ideas convertidas en productos, y productos en negocios escalables.',
  },
  nosotros: {
    title: withName('Nosotros'),
    description:
      'Conoce a Scalora: el equipo tecnológico que ayuda a convertir una idea en un negocio escalable, y los principios con los que trabajamos.',
    eyebrow: 'Nosotros',
    heading: 'Un equipo técnico que entiende el negocio.',
    lead: 'Combinamos visión de producto e ingeniería para construir tecnología que mueve resultados.',
  },
  contacto: {
    title: withName('Contacto'),
    description:
      'Cuéntale a Scalora sobre tu idea o el problema de tu negocio. Respondemos con una propuesta clara para construir, automatizar y escalar.',
    eyebrow: 'Contacto',
    heading: 'Hablemos de tu proyecto.',
    lead: 'Escríbenos qué quieres resolver y te respondemos con los siguientes pasos.',
  },
} as const satisfies Record<string, PageContent>;

/** Resumen de servicios en la portada, con enlace a la página completa. */
export const homeServices = {
  eyebrow: 'Qué hacemos',
  title: 'Cuatro frentes, un mismo objetivo: que tu negocio escale.',
  link: { label: 'Ver todos los servicios', href: '/servicios/' as PagePath },
} as const;

/** Cierre de la portada y de las páginas interiores. */
export const callToAction = {
  title: '¿Tienes una idea o un proceso que quieres mejorar?',
  lead: 'Cuéntanos qué quieres resolver y diseñamos contigo el camino para construirlo.',
  primary: { label: 'Iniciar un proyecto', href: '/contacto/' as PagePath },
  secondary: { label: 'Ver cómo trabajamos', href: '/proceso/' as PagePath },
} as const;
