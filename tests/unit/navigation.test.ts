import { describe, expect, it } from 'vitest';
import { visibleLinks } from '@/lib/navigation';
import type { NavLink } from '@/types/content';

const links: NavLink[] = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Proyectos', href: '#proyectos' },
];

describe('visibleLinks', () => {
  it('conserva todos los enlaces si no hay secciones ocultas', () => {
    expect(visibleLinks(links, [])).toEqual(links);
  });

  it('quita el enlace de una sección oculta', () => {
    expect(visibleLinks(links, ['#proyectos'])).toEqual([
      { label: 'Servicios', href: '#servicios' },
    ]);
  });
});
