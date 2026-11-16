/** Cálculos puros del sistema de movimiento. Sin DOM, para poder probarlos. */

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Avance (0–1) de una sección mientras cruza la pantalla: empieza cuando su borde
 * superior pasa el 75 % de la altura visible y termina cuando ha recorrido el 70 %
 * de su propia altura. Así la secuencia se completa antes de salir, sin bloquear el scroll.
 */
export function scrollProgress(top: number, height: number, viewportHeight: number): number {
  const start = viewportHeight * 0.75;
  const distance = Math.max(height * 0.7, 1);
  return clamp((start - top) / distance, 0, 1);
}

/** Cuántas etapas de una secuencia están activas para un avance dado. */
export function activeStageCount(progress: number, stages: number): number {
  if (stages <= 0 || progress <= 0) return 0;
  if (stages === 1) return 1;
  return Math.min(stages, 1 + Math.floor(progress * (stages - 1) + 1e-6));
}

/**
 * Índice del elemento «en foco» de una lista: el último cuyo borde superior ya cruzó
 * la línea de lectura. -1 si todavía ninguno la cruzó.
 */
export function focusedIndex(tops: readonly number[], line: number): number {
  let index = -1;
  tops.forEach((top, i) => {
    if (top <= line) index = i;
  });
  return index;
}

/** Posición del puntero respecto al centro de una caja, de -1 a 1 en cada eje. */
export function pointerRatio(x: number, y: number, box: Box): { x: number; y: number } {
  const ratioX = (x - (box.left + box.width / 2)) / (box.width / 2 || 1);
  const ratioY = (y - (box.top + box.height / 2)) / (box.height / 2 || 1);
  return { x: clamp(ratioX, -1, 1), y: clamp(ratioY, -1, 1) };
}

/** Desplazamiento de un botón magnético: sigue al puntero sin pasar de `max` píxeles. */
export function magneticOffset(
  x: number,
  y: number,
  box: Box,
  strength = 0.3,
  max = 8,
): { x: number; y: number } {
  const dx = (x - (box.left + box.width / 2)) * strength;
  const dy = (y - (box.top + box.height / 2)) * strength;
  return { x: clamp(dx, -max, max), y: clamp(dy, -max, max) };
}
