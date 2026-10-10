import { describe, expect, it } from 'vitest';
import { contactLink, footerNav, primaryNav, site } from '@/config/site';
import { principles } from '@/content/about';
import { audiences } from '@/content/audiences';
import { differentiators } from '@/content/differentiators';
import { pillars } from '@/content/hero';
import { problems } from '@/content/problem';
import { processSteps } from '@/content/process';
import { projects } from '@/content/projects';
import { services } from '@/content/services';

/** Anclas que la página realmente renderiza (ids de las secciones). */
const SECTION_IDS = [
  'inicio',
  'problema',
  'servicios',
  'enfoque',
  'proceso',
  'para-quien',
  'diferenciadores',
  'proyectos',
  'nosotros',
  'contacto',
];

const unique = (values: readonly string[]): boolean => new Set(values).size === values.length;

describe('navegación', () => {
  it('cada enlace apunta a una sección que existe', () => {
    for (const link of [...primaryNav, ...footerNav, contactLink]) {
      expect(SECTION_IDS, link.label).toContain(link.href.slice(1));
    }
  });
});

describe('metadatos del sitio', () => {
  it('la descripción cabe en un resultado de búsqueda', () => {
    expect(site.description.length).toBeGreaterThanOrEqual(70);
    expect(site.description.length).toBeLessThanOrEqual(200);
  });

  it('el título no se trunca en buscadores', () => {
    expect(site.title.length).toBeLessThanOrEqual(60);
  });
});

describe('contenido', () => {
  it('conserva las cantidades definidas en el documento de marca', () => {
    expect(pillars).toHaveLength(3);
    expect(problems).toHaveLength(10);
    expect(services).toHaveLength(4);
    expect(processSteps).toHaveLength(6);
    expect(audiences).toHaveLength(4);
    expect(differentiators).toHaveLength(5);
    expect(principles).toHaveLength(3);
  });

  it('numera las etapas del proceso de forma consecutiva', () => {
    expect(processSteps.map((step) => step.number)).toEqual(['01', '02', '03', '04', '05', '06']);
  });

  it('no repite identificadores', () => {
    expect(unique(services.map((service) => service.id))).toBe(true);
    expect(unique(projects.map((project) => project.id))).toBe(true);
  });

  it('ningún servicio queda sin elementos', () => {
    for (const service of services) {
      expect(service.items.length, service.title).toBeGreaterThan(0);
    }
  });

  it('las URL de proyectos, si existen, son https', () => {
    for (const project of projects) {
      if (project.url) expect(project.url, project.name).toMatch(/^https:\/\//);
    }
  });
});
