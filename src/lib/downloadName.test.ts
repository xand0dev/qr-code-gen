import { describe, expect, it } from 'vitest';
import { downloadName } from './downloadName';

describe('downloadName', () => {
  it('formats a date as qr-code-YYYYMMDD-HHMMSS', () => {
    expect(downloadName(new Date(2024, 0, 5, 9, 7, 12))).toBe('qr-code-20240105-090712');
  });

  it('pads single-digit components', () => {
    expect(downloadName(new Date(2026, 9, 9, 0, 0, 0))).toBe('qr-code-20261009-000000');
  });

  it('uses local time', () => {
    const d = new Date(2025, 6, 20, 23, 59, 59);
    expect(downloadName(d)).toBe('qr-code-20250720-235959');
  });
});