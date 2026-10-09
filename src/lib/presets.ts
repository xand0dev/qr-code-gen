import type { QRConfig } from '../App';

export type StyleConfig = Omit<QRConfig, 'value' | 'image'>;

export type Preset = {
  id: string;
  name: string;
  createdAt: string;
  style: StyleConfig;
};

export const PRESETS_VERSION = 1;

const DOTS_TYPES = ['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'] as const;
const CORNERS_SQUARE_TYPES = ['square', 'dot', 'extra-rounded'] as const;
const CORNERS_DOT_TYPES = ['square', 'dot'] as const;
const ERROR_CORRECTIONS = ['L', 'M', 'Q', 'H'] as const;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function isValidColor(color: string): boolean {
  return HEX_COLOR_PATTERN.test(color);
}

function validatePreset(preset: unknown, index: number): { valid: boolean; error?: string } {
  if (typeof preset !== 'object' || preset === null) {
    return { valid: false, error: `Preset at index ${index} is not an object` };
  }
  const p = preset as Record<string, unknown>;

  if (typeof p.id !== 'string') {
    return { valid: false, error: `Preset at index ${index}: id is not a string` };
  }

  if (typeof p.name !== 'string') {
    return { valid: false, error: `Preset at index ${index}: name is not a string` };
  }
  const trimmedName = p.name.trim();
  if (trimmedName.length === 0) {
    return { valid: false, error: `Preset at index ${index}: name is empty` };
  }
  if (trimmedName.length > 60) {
    return { valid: false, error: `Preset at index ${index}: name is longer than 60 characters` };
  }

  if (typeof p.createdAt !== 'string') {
    return { valid: false, error: `Preset at index ${index}: createdAt is not a string` };
  }

  if (typeof p.style !== 'object' || p.style === null) {
    return { valid: false, error: `Preset at index ${index}: style is not an object` };
  }
  const s = p.style as Record<string, unknown>;

  const styleFields: (keyof StyleConfig)[] = [
    'size', 'margin', 'bgColor', 'dotsColor', 'dotsType',
    'cornersSquareType', 'cornersSquareColor', 'cornersDotType',
    'cornersDotColor', 'imageSize', 'errorCorrection'
  ];

  for (const field of styleFields) {
    if (!(field in s)) {
      return { valid: false, error: `Preset at index ${index}: missing ${field}` };
    }
  }

  if (typeof s.size !== 'number' || s.size < 200 || s.size > 1000) {
    return { valid: false, error: `Preset at index ${index}: size must be between 200 and 1000` };
  }

  if (typeof s.margin !== 'number' || s.margin < 0 || s.margin > 50) {
    return { valid: false, error: `Preset at index ${index}: margin must be between 0 and 50` };
  }

  if (typeof s.imageSize !== 'number' || s.imageSize < 0.1 || s.imageSize > 0.6) {
    return { valid: false, error: `Preset at index ${index}: imageSize must be between 0.1 and 0.6` };
  }

  if (typeof s.bgColor !== 'string' || !isValidColor(s.bgColor)) {
    return { valid: false, error: `Preset at index ${index}: bgColor must be a valid hex color` };
  }

  if (typeof s.dotsColor !== 'string' || !isValidColor(s.dotsColor)) {
    return { valid: false, error: `Preset at index ${index}: dotsColor must be a valid hex color` };
  }

  if (typeof s.cornersSquareColor !== 'string' || !isValidColor(s.cornersSquareColor)) {
    return { valid: false, error: `Preset at index ${index}: cornersSquareColor must be a valid hex color` };
  }

  if (typeof s.cornersDotColor !== 'string' || !isValidColor(s.cornersDotColor)) {
    return { valid: false, error: `Preset at index ${index}: cornersDotColor must be a valid hex color` };
  }

  if (typeof s.dotsType !== 'string' || !DOTS_TYPES.includes(s.dotsType as typeof DOTS_TYPES[number])) {
    return { valid: false, error: `Preset at index ${index}: invalid dotsType` };
  }

  if (typeof s.cornersSquareType !== 'string' || !CORNERS_SQUARE_TYPES.includes(s.cornersSquareType as typeof CORNERS_SQUARE_TYPES[number])) {
    return { valid: false, error: `Preset at index ${index}: invalid cornersSquareType` };
  }

  if (typeof s.cornersDotType !== 'string' || !CORNERS_DOT_TYPES.includes(s.cornersDotType as typeof CORNERS_DOT_TYPES[number])) {
    return { valid: false, error: `Preset at index ${index}: invalid cornersDotType` };
  }

  if (typeof s.errorCorrection !== 'string' || !ERROR_CORRECTIONS.includes(s.errorCorrection as typeof ERROR_CORRECTIONS[number])) {
    return { valid: false, error: `Preset at index ${index}: invalid errorCorrection` };
  }

  return { valid: true };
}

export function serializePresets(presets: Preset[]): string {
  return JSON.stringify({ version: PRESETS_VERSION, presets }, null, 2);
}

export function parsePresets(json: string): { presets: Preset[]; errors: string[] } {
  const errors: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    return { presets: [], errors: ['Некоректний JSON'] };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { presets: [], errors: ['Invalid JSON structure'] };
  }

  const root = parsed as Record<string, unknown>;

  if (root.version !== PRESETS_VERSION) {
    errors.push(`Unsupported version: ${root.version}`);
  }

  if (!Array.isArray(root.presets)) {
    return { presets: [], errors: ['presets is not an array'] };
  }

  const validPresets: Preset[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < root.presets.length; i++) {
    const validation = validatePreset(root.presets[i], i);
    if (!validation.valid) {
      errors.push(validation.error!);
      continue;
    }
    const preset = root.presets[i] as Preset;
    if (seenIds.has(preset.id)) {
      errors.push(`Preset at index ${i}: duplicate id`);
      continue;
    }
    seenIds.add(preset.id);
    validPresets.push(preset);
  }

  return { presets: validPresets, errors };
}

export function addPreset(
  list: Preset[],
  name: string,
  style: StyleConfig,
  now: Date,
  id: string
): Preset[] {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return list;
  }
  const newPreset: Preset = {
    id,
    name: trimmedName,
    createdAt: now.toISOString(),
    style,
  };
  return [...list, newPreset];
}

export function removePreset(list: Preset[], id: string): Preset[] {
  return list.filter((p) => p.id !== id);
}