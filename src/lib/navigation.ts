import type { NavLink, PagePath } from '@/types/content';

/** Quita del menú los enlaces a páginas que no se publican. */
export function visibleLinks<T extends NavLink>(
  links: readonly T[],
  hiddenPaths: readonly PagePath[],
): T[] {
  return links.filter((link) => !hiddenPaths.includes(link.href));
}

/** Normaliza una ruta para compararla: siempre con barra final. */
function normalize(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

/** Indica si `href` es la página actual (para marcar el enlace con `aria-current`). */
export function isCurrentPage(currentPath: string, href: string): boolean {
  return normalize(currentPath) === normalize(href);
}
