import { describe, expect, it } from 'vitest';
import { resolveExport, MAX_EXPORT_PX } from './exportOptions';

describe('resolveExport', () => {
  it('png: applies scale and respects 4000px limit', () => {
    const r = resolveExport({ format: 'png', scale: 2, transparent: true, size: 1000 });
    expect(r).toEqual({
      extension: 'png',
      width: 2000,
      height: 2000,
      transparent: true,
      notes: [],
    });
  });

  it('png: clamps scale below 1 to 1', () => {
    const r = resolveExport({ format: 'png', scale: 0.5, transparent: true, size: 500 });
    expect(r.width).toBe(500);
    expect(r.height).toBe(500);
  });

  it('png: clamps scale above 4 to 4', () => {
    const r = resolveExport({ format: 'png', scale: 5, transparent: true, size: 500 });
    expect(r.width).toBe(2000);
    expect(r.height).toBe(2000);
  });

  it('png: lowers scale when exceeding MAX_EXPORT_PX and adds note', () => {
    const r = resolveExport({ format: 'png', scale: 4, transparent: true, size: 1500 });
    expect(r.width).toBeLessThanOrEqual(MAX_EXPORT_PX);
    expect(r.height).toBeLessThanOrEqual(MAX_EXPORT_PX);
    expect(r.notes).toContain('Розмір зменшено до ліміту 4000 px');
  });

  it('jpeg: forces transparent to false and adds note', () => {
    const r = resolveExport({ format: 'jpeg', scale: 2, transparent: true, size: 500 });
    expect(r.transparent).toBe(false);
    expect(r.notes).toContain('JPEG не підтримує прозорість');
    expect(r.width).toBe(1000);
    expect(r.height).toBe(1000);
  });

  it('webp: respects transparency and scale', () => {
    const r = resolveExport({ format: 'webp', scale: 3, transparent: false, size: 400 });
    expect(r).toEqual({
      extension: 'webp',
      width: 1200,
      height: 1200,
      transparent: false,
      notes: [],
    });
  });

  it('svg: ignores scale, uses size directly, no notes', () => {
    const r = resolveExport({ format: 'svg', scale: 5, transparent: true, size: 300 });
    expect(r).toEqual({
      extension: 'svg',
      width: 300,
      height: 300,
      transparent: true,
      notes: [],
    });
  });
});