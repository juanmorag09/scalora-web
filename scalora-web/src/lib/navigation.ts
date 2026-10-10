import type { NavLink, SectionAnchor } from '@/types/content';

/** Quita del menú los enlaces a secciones que no se van a renderizar. */
export function visibleLinks<T extends NavLink>(
  links: readonly T[],
  hiddenAnchors: readonly SectionAnchor[],
): T[] {
  return links.filter((link) => !hiddenAnchors.includes(link.href));
}
