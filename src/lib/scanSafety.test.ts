import { describe, expect, it } from 'vitest';
import { byteLength, QR_MAX_BYTES, assessScanSafety } from './scanSafety';

describe('byteLength', () => {
  it('returns byte length for ASCII', () => {
    expect(byteLength('hello')).toBe(5);
  });

  it('returns byte length for multi-byte characters', () => {
    expect(byteLength('Привіт')).toBe(12);
    expect(byteLength('😀')).toBe(4);
    expect(byteLength('aПривітb')).toBe(14);
  });

  it('returns 0 for empty string', () => {
    expect(byteLength('')).toBe(0);
  });
});

describe('QR_MAX_BYTES', () => {
  it('has correct values', () => {
    expect(QR_MAX_BYTES.L).toBe(2953);
    expect(QR_MAX_BYTES.M).toBe(2331);
    expect(QR_MAX_BYTES.Q).toBe(1663);
    expect(QR_MAX_BYTES.H).toBe(1273);
  });
});

describe('assessScanSafety', () => {
  const baseInput = {
    value: 'test',
    errorCorrection: 'L' as const,
    logoSize: null as number | null,
    contrast: 7,
    margin: 4,
  };

  it('returns ok for valid input', () => {
    const result = assessScanSafety(baseInput);
    expect(result.level).toBe('ok');
    expect(result.issues).toEqual([]);
  });

  it('returns risk when bytes exceed max', () => {
    const result = assessScanSafety({
      ...baseInput,
      value: 'x'.repeat(QR_MAX_BYTES.L + 1),
    });
    expect(result.level).toBe('risk');
    expect(result.issues).toContain('Забагато даних для цього рівня корекції');
  });

  it('returns warn when bytes exceed 60% of max', () => {
    const result = assessScanSafety({
      ...baseInput,
      value: 'x'.repeat(Math.floor(QR_MAX_BYTES.L * 0.6) + 1),
    });
    expect(result.level).toBe('warn');
    expect(result.issues).toContain('Щільний код: складно скануватися з відстані');
  });

  it('returns risk when logo area exceeds 0.3', () => {
    const result = assessScanSafety({
      ...baseInput,
      logoSize: 0.55,
    });
    expect(result.level).toBe('risk');
    expect(result.issues).toContain('Логотип закриває забагато коду');
  });

  it('returns warn when logo area exceeds 0.2 and errorCorrection is not H', () => {
    const result = assessScanSafety({
      ...baseInput,
      logoSize: 0.5,
      errorCorrection: 'M',
    });
    expect(result.level).toBe('warn');
    expect(result.issues).toContain('З логотипом краще рівень корекції H');
  });

  it('does not warn for logo when errorCorrection is H', () => {
    const result = assessScanSafety({
      ...baseInput,
      logoSize: 0.5,
      errorCorrection: 'H',
    });
    expect(result.level).toBe('ok');
    expect(result.issues).not.toContain('З логотипом краще рівень корекції H');
  });

  it('does not warn for logo when no logo', () => {
    const result = assessScanSafety({
      ...baseInput,
      logoSize: null,
    });
    expect(result.level).toBe('ok');
  });

  it('returns risk when contrast below 3', () => {
    const result = assessScanSafety({
      ...baseInput,
      contrast: 2,
    });
    expect(result.level).toBe('risk');
    expect(result.issues).toContain('Низький контраст');
  });

  it('returns warn when contrast below 4.5', () => {
    const result = assessScanSafety({
      ...baseInput,
      contrast: 4,
    });
    expect(result.level).toBe('warn');
    expect(result.issues).toContain('Контраст нижче рекомендованого');
  });

  it('returns warn when margin below 4', () => {
    const result = assessScanSafety({
      ...baseInput,
      margin: 3,
    });
    expect(result.level).toBe('warn');
    expect(result.issues).toContain('Замалі відступи (quiet zone)');
  });

  it('picks worst level when multiple issues', () => {
    const result = assessScanSafety({
      ...baseInput,
      value: 'x'.repeat(QR_MAX_BYTES.L + 1),
      contrast: 2,
      margin: 3,
    });
    expect(result.level).toBe('risk');
    expect(result.issues.length).toBeGreaterThan(1);
  });

  it('warn beats ok when no risk', () => {
    const result = assessScanSafety({
      ...baseInput,
      value: 'x'.repeat(Math.floor(QR_MAX_BYTES.L * 0.6) + 1),
      margin: 3,
    });
    expect(result.level).toBe('warn');
  });

  it('risk beats warn', () => {
    const result = assessScanSafety({
      ...baseInput,
      value: 'x'.repeat(QR_MAX_BYTES.L + 1),
      margin: 3,
    });
    expect(result.level).toBe('risk');
  });

  it('works with different errorCorrection levels', () => {
    const result = assessScanSafety({
      ...baseInput,
      errorCorrection: 'H',
      value: 'x'.repeat(QR_MAX_BYTES.H + 1),
    });
    expect(result.level).toBe('risk');
    expect(result.issues).toContain('Забагато даних для цього рівня корекції');
  });
});