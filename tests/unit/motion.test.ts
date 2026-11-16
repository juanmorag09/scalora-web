import { describe, expect, it } from 'vitest';
import {
  activeStageCount,
  clamp,
  focusedIndex,
  magneticOffset,
  pointerRatio,
  scrollProgress,
} from '@/lib/motion';

const box = { left: 100, top: 100, width: 200, height: 100 };

describe('clamp', () => {
  it('limita un valor al rango', () => {
    expect(clamp(-2, 0, 1)).toBe(0);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
    expect(clamp(9, 0, 1)).toBe(1);
  });
});

describe('scrollProgress', () => {
  it('es 0 mientras la sección no ha llegado al 75 % de la pantalla', () => {
    expect(scrollProgress(900, 600, 1000)).toBe(0);
  });

  it('avanza a medida que la sección sube', () => {
    // start = 750; recorre 420 px (70 % de 600). A top = 540 lleva 210 px: la mitad.
    expect(scrollProgress(540, 600, 1000)).toBeCloseTo(0.5);
  });

  it('se queda en 1 cuando la sección ya pasó', () => {
    expect(scrollProgress(-2000, 600, 1000)).toBe(1);
  });
});

describe('activeStageCount', () => {
  it('no activa nada antes de empezar', () => {
    expect(activeStageCount(0, 3)).toBe(0);
  });

  it('activa las etapas en orden: Build, luego Automate, luego Scale', () => {
    expect(activeStageCount(0.01, 3)).toBe(1);
    expect(activeStageCount(0.49, 3)).toBe(1);
    expect(activeStageCount(0.5, 3)).toBe(2);
    expect(activeStageCount(0.99, 3)).toBe(2);
    expect(activeStageCount(1, 3)).toBe(3);
  });

  it('soporta secuencias de una etapa o vacías', () => {
    expect(activeStageCount(0.3, 1)).toBe(1);
    expect(activeStageCount(1, 0)).toBe(0);
  });
});

describe('focusedIndex', () => {
  const tops = [100, 200, 300, 400];

  it('es -1 si ningún elemento cruzó la línea de lectura', () => {
    expect(focusedIndex(tops, 50)).toBe(-1);
  });

  it('es el último elemento que ya cruzó la línea', () => {
    expect(focusedIndex(tops, 250)).toBe(1);
    expect(focusedIndex(tops, 300)).toBe(2);
  });

  it('se queda en el último cuando la lista ya pasó', () => {
    expect(focusedIndex([-900, -800, -700], 500)).toBe(2);
  });
});

describe('pointerRatio', () => {
  it('es 0 en el centro y ±1 en los bordes', () => {
    expect(pointerRatio(200, 150, box)).toEqual({ x: 0, y: 0 });
    expect(pointerRatio(100, 100, box)).toEqual({ x: -1, y: -1 });
    expect(pointerRatio(300, 200, box)).toEqual({ x: 1, y: 1 });
  });

  it('no se sale del rango aunque el puntero esté fuera', () => {
    expect(pointerRatio(5000, -5000, box)).toEqual({ x: 1, y: -1 });
  });
});

describe('magneticOffset', () => {
  it('sigue al puntero de forma proporcional', () => {
    expect(magneticOffset(210, 155, box)).toEqual({ x: 3, y: 1.5 });
  });

  it('nunca desplaza más del máximo', () => {
    expect(magneticOffset(1000, -1000, box)).toEqual({ x: 8, y: -8 });
  });
});
