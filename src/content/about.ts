import type { Principle } from '@/types/content';

export const aboutSection = {
  eyebrow: 'Nosotros',
  title: 'El equipo tecnológico que ayuda a convertir una idea en un negocio escalable.',
} as const;

export const principles = [
  {
    label: 'Misión',
    statement: 'Transformar ideas y negocios en productos digitales capaces de crecer.',
    detail:
      'Combinamos estrategia, tecnología y automatización para crear soluciones que generen resultados reales.',
  },
  {
    label: 'Visión',
    statement:
      'Ser un referente latinoamericano en la creación y escalamiento de negocios digitales.',
    detail: 'Desarrollando productos tecnológicos que puedan competir en mercados globales.',
  },
  {
    label: 'Propósito',
    statement: 'Hacer que construir y escalar un negocio mediante tecnología sea más accesible.',
    detail:
      'Queremos reducir la distancia entre una buena idea y un producto capaz de llegar al mercado.',
  },
] as const satisfies readonly Principle[];
