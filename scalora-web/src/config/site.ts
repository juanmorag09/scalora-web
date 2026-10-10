import type { NavLink } from '@/types/content';

/** Datos globales del sitio: identidad, metadatos y navegación. */
export const site = {
  name: 'Scalora',
  tagline: 'Build. Automate. Scale.',
  slogan: 'From idea to scalable business.',
  title: 'Scalora — De la idea al negocio escalable',
  description:
    'Scalora transforma ideas y negocios en productos digitales modernos, automatizados y preparados para crecer: desarrollo de producto, automatización, datos e infraestructura.',
  lang: 'es',
  ogLocale: 'es_LA',
  themeColor: '#0b0d12',
  ogImage: 'og-image.png',
} as const;

export const primaryNav = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Nosotros', href: '#nosotros' },
] as const satisfies readonly NavLink[];

export const contactLink = { label: 'Hablemos', href: '#contacto' } as const satisfies NavLink;

export const footerNav = [
  ...primaryNav,
  { label: 'Contacto', href: '#contacto' },
] as const satisfies readonly NavLink[];
