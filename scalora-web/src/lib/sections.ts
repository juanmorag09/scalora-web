import { projects } from '@/content/projects';
import type { SectionAnchor } from '@/types/content';

/** Secciones opcionales: se ocultan (junto con su enlace) cuando no tienen contenido. */
export const hasProjects = projects.length > 0;

export const hiddenAnchors: readonly SectionAnchor[] = hasProjects ? [] : ['#proyectos'];
