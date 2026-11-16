/**
 * Movimiento del sitio. Todo es mejora progresiva: sin este script el contenido se ve
 * completo y estático (ver `src/styles/motion.css`).
 *
 * - Revelado de `[data-reveal]` al entrar en pantalla (una sola vez).
 * - Estado de la barra al desplazarse (`data-scrolled`).
 * - Secuencia Build → Automate → Scale ligada al scroll (`[data-journey]`).
 * - Listas que se recorren con el scroll, un elemento en foco a la vez (`[data-spotlight]`).
 * - Solo con puntero fino: parallax del hero, botones magnéticos y brillo de tarjetas.
 */
import {
  activeStageCount,
  focusedIndex,
  magneticOffset,
  pointerRatio,
  scrollProgress,
} from '@/lib/motion';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

export function initMotion(): void {
  const root = document.documentElement;
  const reduced = window.matchMedia(REDUCED_MOTION).matches;
  root.classList.add('motion-ready');

  initReveal(reduced);
  initScrollEffects(reduced);

  if (!reduced && window.matchMedia(FINE_POINTER).matches) {
    initHeroParallax();
    initMagnetic();
    initCardGlow();
  }
}

function initReveal(reduced: boolean): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  elements.forEach((element) => observer.observe(element));
}

/** Un único listener de scroll (pasivo y agrupado por frame) para barra y secuencias. */
function initScrollEffects(reduced: boolean): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const journeys = Array.from(document.querySelectorAll<HTMLElement>('[data-journey]'));
  const spotlights = Array.from(document.querySelectorAll<HTMLElement>('[data-spotlight]'));

  const update = (): void => {
    if (header) header.dataset['scrolled'] = String(window.scrollY > 8);
    for (const journey of journeys) updateJourney(journey, reduced);
    for (const spotlight of spotlights) updateSpotlight(spotlight);
  };

  let queued = false;
  const onScroll = (): void => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  };

  journeys.forEach((journey) => (journey.dataset['journeyReady'] = 'true'));
  spotlights.forEach((spotlight) => (spotlight.dataset['spotlightReady'] = 'true'));
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

function updateJourney(journey: HTMLElement, reduced: boolean): void {
  const stages = journey.querySelectorAll<HTMLElement>('[data-journey-stage]');
  const rect = journey.getBoundingClientRect();
  const progress = reduced ? 1 : scrollProgress(rect.top, rect.height, window.innerHeight);
  const active = activeStageCount(progress, stages.length);

  journey.style.setProperty('--progress', progress.toFixed(3));
  stages.forEach((stage, index) => {
    stage.toggleAttribute('data-active', index < active);
  });
}

/** Marca el elemento en foco, los ya recorridos, el contador y si la lista terminó. */
function updateSpotlight(spotlight: HTMLElement): void {
  const items = Array.from(spotlight.querySelectorAll<HTMLElement>('[data-spotlight-item]'));
  const line = window.innerHeight * 0.42;
  const current = focusedIndex(
    items.map((item) => item.getBoundingClientRect().top),
    line,
  );

  items.forEach((item, index) => {
    item.toggleAttribute('data-current', index === current);
    item.toggleAttribute('data-passed', index < current);
  });

  const total = items.length;
  const seen = current + 1;
  spotlight.style.setProperty('--spotlight-progress', total ? (seen / total).toFixed(3) : '0');
  spotlight.toggleAttribute('data-complete', total > 0 && seen === total);
  const counter = spotlight.querySelector<HTMLElement>('[data-spotlight-count]');
  if (counter) counter.textContent = String(Math.max(seen, 0)).padStart(2, '0');
}

function initHeroParallax(): void {
  const hero = document.querySelector<HTMLElement>('[data-parallax]');
  if (!hero) return;

  hero.addEventListener('pointermove', (event) => {
    const ratio = pointerRatio(event.clientX, event.clientY, hero.getBoundingClientRect());
    hero.style.setProperty('--px', ratio.x.toFixed(3));
    hero.style.setProperty('--py', ratio.y.toFixed(3));
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--px', '0');
    hero.style.setProperty('--py', '0');
  });
}

function initMagnetic(): void {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const offset = magneticOffset(event.clientX, event.clientY, element.getBoundingClientRect());
      element.style.setProperty('--mx', `${offset.x.toFixed(1)}px`);
      element.style.setProperty('--my', `${offset.y.toFixed(1)}px`);
    });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--mx', '0px');
      element.style.setProperty('--my', '0px');
    });
  });
}

/** El borde iluminado de las tarjetas sigue al puntero. */
function initCardGlow(): void {
  document.addEventListener(
    'pointermove',
    (event) => {
      if (!(event.target instanceof Element)) return;
      const card = event.target.closest<HTMLElement>('.card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--gx', `${(event.clientX - rect.left).toFixed(0)}px`);
      card.style.setProperty('--gy', `${(event.clientY - rect.top).toFixed(0)}px`);
    },
    { passive: true },
  );
}
