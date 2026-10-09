import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';

describe('contrastRatio', () => {
  it('returns 21 for black vs white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21);
  });

  it('returns 1 for a color vs itself', () => {
    expect(contrastRatio('#ff0000', '#ff0000')).toBe(1);
  });

  it('order of arguments does not matter', () => {
    const ratio1 = contrastRatio('#000000', '#ffffff');
    const ratio2 = contrastRatio('#ffffff', '#000000');
    expect(ratio1).toBe(ratio2);
  });

  it('3-digit shorthand works', () => {
    expect(contrastRatio('#fff', '#000')).toBe(21);
  });
});