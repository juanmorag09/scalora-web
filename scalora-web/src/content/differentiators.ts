import type { Differentiator } from '@/types/content';

export const differentiatorsSection = {
  eyebrow: 'Diferenciadores',
  title: 'Lo que no somos dice mucho de lo que hacemos.',
} as const;

export const differentiators = [
  {
    statement: 'No somos una fábrica de páginas web.',
    answer: 'Construimos productos digitales.',
  },
  {
    statement: 'No vendemos horas de programación.',
    answer: 'Vendemos soluciones orientadas a resultados.',
  },
  {
    statement: 'No trabajamos únicamente desde el código.',
    answer: 'Entendemos primero el problema de negocio.',
  },
  {
    statement: 'No buscamos solamente lanzar.',
    answer: 'Diseñamos pensando en lo que viene después.',
  },
  {
    statement: 'Tecnología sin complejidad innecesaria.',
    answer: 'Utilizamos tecnologías modernas, pero siempre con una razón de negocio detrás.',
  },
] as const satisfies readonly Differentiator[];
