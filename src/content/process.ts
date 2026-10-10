import type { ProcessStep } from '@/types/content';

export const processSection = {
  eyebrow: 'Cómo trabajamos',
  title: 'Seis etapas, de la idea al crecimiento.',
  lead: 'Trabajamos mediante iteraciones y entregas progresivas para mantener el proyecto visible y controlado.',
  closing: { lead: 'El lanzamiento no es el final.', highlight: 'Es el comienzo del crecimiento.' },
} as const;

export const processSteps = [
  {
    number: '01',
    title: 'Descubrimiento',
    description:
      'Entendemos el negocio, el problema, los usuarios y los objetivos. Definimos qué necesita realmente el producto y establecemos el alcance inicial.',
  },
  {
    number: '02',
    title: 'Estrategia',
    description:
      'Convertimos la idea en una solución concreta: funcionalidades, arquitectura, prioridades, tecnología y roadmap. Comenzamos con lo necesario para validar y crecer, sin construir cosas innecesarias.',
  },
  {
    number: '03',
    title: 'Diseño',
    description:
      'Diseñamos experiencias digitales intuitivas, modernas y orientadas al usuario. Interfaces que no solamente se ven bien, sino que facilitan el uso del producto.',
  },
  {
    number: '04',
    title: 'Desarrollo',
    description:
      'Construimos el producto utilizando tecnologías modernas y arquitecturas preparadas para crecer, con iteraciones y entregas progresivas.',
  },
  {
    number: '05',
    title: 'Lanzamiento',
    description:
      'Desplegamos el producto y dejamos lista la infraestructura para operar en producción: dominios, infraestructura, seguridad, monitoreo y procesos de despliegue.',
  },
  {
    number: '06',
    title: 'Escalamiento',
    description:
      'Analizamos el comportamiento del producto y seguimos evolucionándolo: nuevas funcionalidades, procesos automatizados, infraestructura optimizada y decisiones basadas en datos.',
  },
] as const satisfies readonly ProcessStep[];
