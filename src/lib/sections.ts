import { projects } from '@/content/projects';
import type { PagePath } from '@/types/content';

/** Páginas opcionales: se ocultan (junto con su enlace) cuando no tienen contenido. */
export const hasProjects = projects.length > 0;

export const hiddenPaths: readonly PagePath[] = hasProjects ? [] : ['/proyectos/'];
