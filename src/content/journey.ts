import type { JourneyStage } from '@/types/content';

export const journeySection = {
  eyebrow: 'Build. Automate. Scale.',
  title: 'Tres etapas para pasar de la idea al crecimiento.',
  lead: 'Cada etapa construye sobre la anterior: primero el producto, después la operación y al final la capacidad de crecer.',
} as const;

export const journeyStages = [
  {
    step: '01',
    title: 'Build',
    heading: 'Construimos el producto.',
    description:
      'Diseñamos y desarrollamos la aplicación, plataforma o MVP que tu negocio necesita, con bases sólidas desde el primer día.',
    items: ['Aplicaciones web', 'Plataformas y SaaS', 'MVPs'],
  },
  {
    step: '02',
    title: 'Automate',
    heading: 'Automatizamos la operación.',
    description:
      'Conectamos herramientas y convertimos procesos repetitivos en flujos automáticos para que el equipo se enfoque en lo que genera valor.',
    items: ['Integraciones y APIs', 'Flujos de trabajo', 'Reportes automatizados'],
  },
  {
    step: '03',
    title: 'Scale',
    heading: 'Preparamos el crecimiento.',
    description:
      'Datos e infraestructura listos para atender a más usuarios y tomar mejores decisiones sin perder estabilidad.',
    items: ['Cloud y CI/CD', 'Datos y analítica', 'Arquitecturas escalables'],
  },
] as const satisfies readonly JourneyStage[];
