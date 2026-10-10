import { describe, expect, it } from 'vitest';
import { joinBase } from '@/lib/url';

describe('joinBase', () => {
  it.each([
    ['/', 'favicon.svg', '/favicon.svg'],
    ['/', '/favicon.svg', '/favicon.svg'],
    ['/scalora-web', 'favicon.svg', '/scalora-web/favicon.svg'],
    ['/scalora-web/', '/favicon.svg', '/scalora-web/favicon.svg'],
    ['/scalora-web/', 'projects/demo.jpg', '/scalora-web/projects/demo.jpg'],
  ])('une %s con %s', (base, path, expected) => {
    expect(joinBase(base, path)).toBe(expected);
  });
});
