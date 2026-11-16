/**
 * Apertura de marca (ver `components/layout/Splash.astro`): espera a que termine la
 * secuencia del logo y lo hace volar hasta el logo de la cabecera mientras se descubre
 * la página. Devuelve una promesa que se resuelve cuando la página ya está a la vista.
 */

/*
 * Los tiempos se miden con el reloj de las propias animaciones CSS de la apertura, no
 * desde que empezó a cargar la página: en equipos lentos el primer pintado llega tarde y
 * la secuencia empieza después, pero el despegue sigue sincronizado con ella.
 */

/** Retraso que llevan las animaciones de entrada del hero (`--intro-offset`). */
export const INTRO_OFFSET_MS = 1900;
const FLIGHT_MS = 700;
const SKIP_FLIGHT_MS = 380;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

export function initSplash(): Promise<void> {
  const root = document.documentElement;
  const splash = document.querySelector<HTMLElement>('[data-splash]');
  const logo = splash?.querySelector<HTMLElement>('[data-splash-logo]');
  const backdrop = splash?.querySelector<HTMLElement>('[data-splash-backdrop]');
  const target = document.querySelector<HTMLElement>('.site-header__brand .logo');

  if (!root.classList.contains('splash-active') || !splash || !logo || !backdrop || !target) {
    root.classList.remove('splash-active');
    return Promise.resolve();
  }

  // Referencia ya validada, para usarla dentro de las funciones de abajo.
  const host: HTMLElement = splash;

  /** Animaciones de la secuencia (barras, nombre, lema), sin el respaldo del contenedor. */
  const sequence = host
    .getAnimations({ subtree: true })
    .filter((animation) => (animation.effect as KeyframeEffect | null)?.target !== host);
  /** El respaldo del contenedor sirve de reloj: empezó a la vez que la secuencia. */
  const clock = host.getAnimations()[0];

  return new Promise((resolve) => {
    let launched = false;
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

    const finish = (): void => {
      root.classList.remove('splash-active');
      host.remove();
      resolve();
    };

    const fly = (duration: number): void => {
      if (launched) return;
      launched = true;
      events.forEach((type) => window.removeEventListener(type, skip));

      const scale = Number(getComputedStyle(logo).getPropertyValue('--splash-scale')) || 1;
      const from = logo.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      const ratio = to.width / from.width;

      const flight = logo.animate(
        [
          { transform: `translate(0px, 0px) translate(-50%, -50%) scale(${scale})` },
          {
            transform: `translate(${dx}px, ${dy}px) translate(-50%, -50%) scale(${scale * ratio})`,
          },
        ],
        { duration, easing: EASE, fill: 'forwards' },
      );
      backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: duration * 0.85,
        delay: duration * 0.1,
        easing: 'ease-out',
        fill: 'forwards',
      });
      flight.finished.then(finish, finish);
    };

    /** Saltar: completa el logo, adelanta la entrada del hero y despega ya. */
    function skip(): void {
      if (launched) return;
      sequence.forEach((animation) => animation.finish());
      const elapsed = Number(clock?.currentTime ?? INTRO_OFFSET_MS);
      const remaining = INTRO_OFFSET_MS - elapsed;
      if (remaining > 0) {
        for (const animation of document.getAnimations()) {
          const node = (animation.effect as KeyframeEffect | null)?.target;
          if (node && host.contains(node)) continue;
          animation.currentTime = Number(animation.currentTime ?? 0) + remaining;
        }
      }
      fly(SKIP_FLIGHT_MS);
    }

    events.forEach((type) => window.addEventListener(type, skip, { passive: true }));
    // Despega cuando la secuencia termina (el lema ya se fue).
    void Promise.all(sequence.map((animation) => animation.finished)).then(
      () => fly(FLIGHT_MS),
      () => fly(FLIGHT_MS),
    );
  });
}
