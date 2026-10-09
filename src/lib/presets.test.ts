import { describe, expect, it } from 'vitest';
import {
  PRESETS_VERSION,
  serializePresets,
  parsePresets,
  addPreset,
  removePreset,
  type Preset,
  type StyleConfig,
} from './presets';

const createValidStyle = (overrides: Partial<StyleConfig> = {}): StyleConfig => ({
  size: 300,
  margin: 10,
  bgColor: '#ffffff',
  dotsColor: '#000000',
  dotsType: 'square',
  cornersSquareType: 'square',
  cornersSquareColor: '#000000',
  cornersDotType: 'square',
  cornersDotColor: '#000000',
  imageSize: 0.4,
  errorCorrection: 'Q',
  ...overrides,
});

const createValidPreset = (overrides: Partial<Preset> = {}): Preset => ({
  id: 'test-id',
  name: 'Test Preset',
  createdAt: '2024-01-01T00:00:00.000Z',
  style: createValidStyle(),
  ...overrides,
});

describe('serializePresets', () => {
  it('serializes presets with version', () => {
    const presets = [createValidPreset()];
    const json = serializePresets(presets);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(PRESETS_VERSION);
    expect(parsed.presets).toHaveLength(1);
  });

  it('pretty-prints with 2 spaces', () => {
    const presets = [createValidPreset()];
    const json = serializePresets(presets);
    expect(json).toContain('\n  ');
  });
});

describe('parsePresets', () => {
  it('round-trips a valid preset', () => {
    const presetsList = [createValidPreset({ id: 'id-1', name: 'Preset 1' })];
    const json = serializePresets(presetsList);
    const { presets, errors } = parsePresets(json);
    expect(errors).toHaveLength(0);
    expect(presets).toHaveLength(1);
    expect(presets[0].id).toBe('id-1');
    expect(presets[0].name).toBe('Preset 1');
  });

  it('round-trips multiple presets', () => {
    const presetsList = [
      createValidPreset({ id: 'id-1', name: 'Preset 1' }),
      createValidPreset({ id: 'id-2', name: 'Preset 2' }),
    ];
    const json = serializePresets(presetsList);
    const { presets: parsed, errors } = parsePresets(json);
    expect(errors).toHaveLength(0);
    expect(parsed).toHaveLength(2);
  });

  it('returns error for invalid JSON', () => {
    const { presets, errors } = parsePresets('not valid json');
    expect(presets).toHaveLength(0);
    expect(errors).toContain('Некоректний JSON');
  });

  it('returns error for wrong version', () => {
    const json = JSON.stringify({ version: 999, presets: [] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('Unsupported version'))).toBe(true);
  });

  it('drops preset with empty name', () => {
    const preset = createValidPreset({ name: '' });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('name is empty'))).toBe(true);
  });

  it('drops preset with name longer than 60 characters', () => {
    const longName = 'a'.repeat(61);
    const preset = createValidPreset({ name: longName });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('longer than 60'))).toBe(true);
  });

  it('drops preset with invalid bgColor', () => {
    const preset = createValidPreset({ style: createValidStyle({ bgColor: 'invalid' }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('bgColor'))).toBe(true);
  });

  it('drops preset with invalid dotsColor', () => {
    const preset = createValidPreset({ style: createValidStyle({ dotsColor: 'invalid' }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('dotsColor'))).toBe(true);
  });

  it('drops preset with invalid cornersSquareColor', () => {
    const preset = createValidPreset({ style: createValidStyle({ cornersSquareColor: 'invalid' }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('cornersSquareColor'))).toBe(true);
  });

  it('drops preset with invalid cornersDotColor', () => {
    const preset = createValidPreset({ style: createValidStyle({ cornersDotColor: 'invalid' }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('cornersDotColor'))).toBe(true);
  });

  it('drops preset with invalid dotsType', () => {
    const preset = createValidPreset({ style: createValidStyle({ dotsType: 'invalid' as typeof preset.style.dotsType }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('dotsType'))).toBe(true);
  });

  it('drops preset with invalid cornersSquareType', () => {
    const preset = createValidPreset({ style: createValidStyle({ cornersSquareType: 'invalid' as typeof preset.style.cornersSquareType }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('cornersSquareType'))).toBe(true);
  });

  it('drops preset with invalid cornersDotType', () => {
    const preset = createValidPreset({ style: createValidStyle({ cornersDotType: 'invalid' as typeof preset.style.cornersDotType }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('cornersDotType'))).toBe(true);
  });

  it('drops preset with invalid errorCorrection', () => {
    const preset = createValidPreset({ style: createValidStyle({ errorCorrection: 'X' as typeof preset.style.errorCorrection }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('errorCorrection'))).toBe(true);
  });

  it('drops preset with size below 200', () => {
    const preset = createValidPreset({ style: createValidStyle({ size: 100 }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('size'))).toBe(true);
  });

  it('drops preset with size above 1000', () => {
    const preset = createValidPreset({ style: createValidStyle({ size: 2000 }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('size'))).toBe(true);
  });

  it('drops preset with margin below 0', () => {
    const preset = createValidPreset({ style: createValidStyle({ margin: -1 }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('margin'))).toBe(true);
  });

  it('drops preset with margin above 50', () => {
    const preset = createValidPreset({ style: createValidStyle({ margin: 51 }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('margin'))).toBe(true);
  });

  it('drops preset with imageSize below 0.1', () => {
    const preset = createValidPreset({ style: createValidStyle({ imageSize: 0.05 }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('imageSize'))).toBe(true);
  });

  it('drops preset with imageSize above 0.6', () => {
    const preset = createValidPreset({ style: createValidStyle({ imageSize: 0.7 }) });
    const json = JSON.stringify({ version: PRESETS_VERSION, presets: [preset] }, null, 2);
    const { presets, errors } = parsePresets(json);
    expect(presets).toHaveLength(0);
    expect(errors.some((e) => e.includes('imageSize'))).toBe(true);
  });

  it('drops preset with duplicate id', () => {
    const presets = [
      createValidPreset({ id: 'same-id', name: 'Preset 1' }),
      createValidPreset({ id: 'same-id', name: 'Preset 2' }),
    ];
    const json = JSON.stringify({ version: PRESETS_VERSION, presets }, null, 2);
    const { presets: parsed, errors } = parsePresets(json);
    expect(parsed).toHaveLength(1);
    expect(errors.some((e) => e.includes('duplicate id'))).toBe(true);
  });

  it('keeps valid presets and drops invalid ones with errors', () => {
    const presets = [
      createValidPreset({ id: 'valid-1', name: 'Valid 1' }),
      createValidPreset({ id: 'valid-2', name: 'Valid 2' }),
      createValidPreset({ id: 'invalid', name: '' }),
    ];
    const json = JSON.stringify({ version: PRESETS_VERSION, presets }, null, 2);
    const { presets: parsed, errors } = parsePresets(json);
    expect(parsed).toHaveLength(2);
    expect(errors).toHaveLength(1);
  });
});

describe('addPreset', () => {
  it('adds a preset to the list', () => {
    const list: Preset[] = [];
    const now = new Date('2024-01-01T00:00:00.000Z');
    const style = createValidStyle();
    const result = addPreset(list, 'New Preset', style, now, 'new-id');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('new-id');
    expect(result[0].name).toBe('New Preset');
    expect(result[0].createdAt).toBe(now.toISOString());
    expect(result[0].style).toEqual(style);
  });

  it('trims the name', () => {
    const list: Preset[] = [];
    const now = new Date('2024-01-01T00:00:00.000Z');
    const style = createValidStyle();
    const result = addPreset(list, '  Trimmed  ', style, now, 'new-id');
    expect(result[0].name).toBe('Trimmed');
  });

  it('returns unchanged list when trimmed name is empty', () => {
    const list: Preset[] = [createValidPreset({ id: 'existing' })];
    const now = new Date('2024-01-01T00:00:00.000Z');
    const style = createValidStyle();
    const result = addPreset(list, '   ', style, now, 'new-id');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('existing');
  });
});

describe('removePreset', () => {
  it('removes a preset by id', () => {
    const list = [
      createValidPreset({ id: 'id-1', name: 'Preset 1' }),
      createValidPreset({ id: 'id-2', name: 'Preset 2' }),
    ];
    const result = removePreset(list, 'id-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id-2');
  });

  it('returns unchanged list if id not found', () => {
    const list = [createValidPreset({ id: 'id-1' })];
    const result = removePreset(list, 'non-existent');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id-1');
  });

  it('removes all matching presets', () => {
    const list = [
      createValidPreset({ id: 'id-1', name: 'Preset 1' }),
      createValidPreset({ id: 'id-1', name: 'Preset 2' }),
      createValidPreset({ id: 'id-2', name: 'Preset 3' }),
    ];
    const result = removePreset(list, 'id-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id-2');
  });
});