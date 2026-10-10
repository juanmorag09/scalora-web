/** Contratos del contenido. El marcado nunca define textos: los lee de `src/content`. */

export type IconName = 'product' | 'automation' | 'data' | 'infrastructure' | 'menu' | 'close';

export type SectionAnchor = `#${string}`;

export interface NavLink {
  label: string;
  href: SectionAnchor;
}

export interface Pillar {
  step: string;
  title: string;
  description: string;
}

export interface Service {
  id: string;
  icon: IconName;
  title: string;
  summary: string;
  items: readonly string[];
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface Audience {
  title: string;
  description: string;
  needs: string;
}

export interface Differentiator {
  statement: string;
  answer: string;
}

export interface Project {
  id: string;
  category: string;
  name: string;
  description: string;
  stack: readonly string[];
  /** URL pública del proyecto. Sin URL no se muestra el enlace. */
  url?: string;
  /** Ruta de la captura dentro de `public/`. Sin imagen se muestra un marco vacío. */
  image?: string;
}

export interface Principle {
  label: string;
  statement: string;
  detail: string;
}
