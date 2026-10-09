export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'svg';

export const MAX_EXPORT_PX = 4000;

export function resolveExport(input: {
  format: ExportFormat;
  scale: number;
  transparent: boolean;
  size: number;
}): {
  extension: ExportFormat;
  width: number;
  height: number;
  transparent: boolean;
  notes: string[];
} {
  const { format, scale, transparent, size } = input;
  const notes: string[] = [];

  let clampedScale = Math.round(scale);
  if (clampedScale < 1) clampedScale = 1;
  if (clampedScale > 4) clampedScale = 4;

  let finalTransparent = transparent;
  if (format === 'jpeg') {
    finalTransparent = false;
    notes.push('JPEG не підтримує прозорість');
  }

  if (format === 'svg') {
    return {
      extension: 'svg',
      width: size,
      height: size,
      transparent: finalTransparent,
      notes: [],
    };
  }

  let width = size * clampedScale;
  let height = size * clampedScale;

  if (width > MAX_EXPORT_PX) {
    clampedScale = Math.floor(MAX_EXPORT_PX / size);
    if (clampedScale < 1) clampedScale = 1;
    width = size * clampedScale;
    height = size * clampedScale;
    notes.push('Розмір зменшено до ліміту 4000 px');
  }

  return {
    extension: format,
    width,
    height,
    transparent: finalTransparent,
    notes,
  };
}