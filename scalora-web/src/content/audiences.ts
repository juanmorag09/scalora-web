import type { Audience } from '@/types/content';

export const audienceSection = {
  eyebrow: 'Para quién',
  title: '¿Para quién es Scalora?',
  needsLabel: 'Necesitan',
} as const;

export const audiences = [
  {
    title: 'Emprendedores',
    description: 'Personas que tienen una idea y necesitan convertirla en un producto real.',
    needs: 'MVP, plataforma, validación y acompañamiento tecnológico.',
  },
  {
    title: 'Startups',
    description: 'Empresas que necesitan desarrollar rápidamente un producto capaz de crecer.',
    needs: 'Arquitectura escalable, desarrollo, integraciones, cloud y evolución continua.',
  },
  {
    title: 'Empresas tradicionales',
    description: 'Negocios que quieren modernizar procesos y adoptar tecnología.',
    needs: 'Automatización, sistemas internos, dashboards, integraciones y transformación digital.',
  },
  {
    title: 'Empresas en crecimiento',
    description:
      'Organizaciones que ya tienen clientes y necesitan tecnología para soportar una mayor operación.',
    needs: 'Optimización, automatización, infraestructura y escalabilidad.',
  },
] as const satisfies readonly Audience[];
