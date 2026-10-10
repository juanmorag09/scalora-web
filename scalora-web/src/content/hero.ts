import type { Pillar } from '@/types/content';

export const hero = {
  badge: 'Build. Automate. Scale.',
  title: { lead: 'Tu idea merece convertirse en', highlight: 'algo real.' },
  lead: 'En Scalora transformamos ideas y negocios en productos digitales modernos, automatizados y preparados para crecer. Desde el primer MVP hasta una plataforma capaz de atender miles de usuarios, construimos la tecnología que tu negocio necesita para avanzar.',
  primaryAction: { label: 'Iniciar un proyecto', href: '#contacto' },
  secondaryAction: { label: 'Ver cómo trabajamos', href: '#proceso' },
  note: {
    lead: 'No solo desarrollamos software.',
    highlight: 'Construimos negocios preparados para escalar.',
  },
} as const;

export const pillars = [
  { step: '01', title: 'Build', description: 'Construimos productos digitales.' },
  { step: '02', title: 'Automate', description: 'Automatizamos negocios.' },
  { step: '03', title: 'Scale', description: 'Creamos la tecnología necesaria para escalar.' },
] as const satisfies readonly Pillar[];
