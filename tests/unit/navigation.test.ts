import { describe, expect, it } from 'vitest';
import { isCurrentPage, visibleLinks } from '@/lib/navigation';
import type { NavLink } from '@/types/content';

const links: NavLink[] = [
  { label: 'Servicios', href: '/servicios/' },
  { label: 'Proyectos', href: '/proyectos/' },
];

describe('visibleLinks', () => {
  it('conserva todos los enlaces si no hay secciones ocultas', () => {
    expect(visibleLinks(links, [])).toEqual(links);
  });

  it('quita el enlace de una página oculta', () => {
    expect(visibleLinks(links, ['/proyectos/'])).toEqual([
      { label: 'Servicios', href: '/servicios/' },
    ]);
  });
});

describe('isCurrentPage', () => {
  it('reconoce la página actual con o sin barra final', () => {
    expect(isCurrentPage('/servicios/', '/servicios/')).toBe(true);
    expect(isCurrentPage('/servicios', '/servicios/')).toBe(true);
    expect(isCurrentPage('/repo/servicios/', '/repo/servicios/')).toBe(true);
  });

  it('no confunde páginas distintas ni la portada', () => {
    expect(isCurrentPage('/servicios/', '/proceso/')).toBe(false);
    expect(isCurrentPage('/', '/servicios/')).toBe(false);
  });
});
