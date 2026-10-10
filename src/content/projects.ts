import type { Project } from '@/types/content';

export const projectsSection = {
  eyebrow: 'Portafolio',
  title: 'Proyectos',
  lead: 'Ideas convertidas en productos, y productos en negocios escalables.',
  imagePlaceholder: 'Captura pendiente',
  linkLabel: 'Ver proyecto',
} as const;

/*
 * PENDIENTE DE CONTENIDO: estas tres entradas son marcadores.
 * Reemplázalas por proyectos reales antes de publicar. Cada proyecto admite
 * `url` (enlace público) e `image` (ruta dentro de `public/`, p. ej. 'projects/credify.jpg').
 * Si dejas el arreglo vacío, la sección y su enlace del menú desaparecen solos.
 */
export const projects: readonly Project[] = [
  {
    id: 'proyecto-1',
    category: '[CATEGORÍA · SECTOR]',
    name: '[NOMBRE DEL PROYECTO]',
    description: '[Qué problema de negocio resolvió y qué se construyó.]',
    stack: ['[TECNOLOGÍA]', '[TECNOLOGÍA]'],
  },
  {
    id: 'proyecto-2',
    category: '[CATEGORÍA · SECTOR]',
    name: '[NOMBRE DEL PROYECTO]',
    description: '[Qué problema de negocio resolvió y qué se construyó.]',
    stack: ['[TECNOLOGÍA]', '[TECNOLOGÍA]'],
  },
  {
    id: 'proyecto-3',
    category: '[CATEGORÍA · SECTOR]',
    name: '[NOMBRE DEL PROYECTO]',
    description: '[Qué problema de negocio resolvió y qué se construyó.]',
    stack: ['[TECNOLOGÍA]', '[TECNOLOGÍA]'],
  },
];
