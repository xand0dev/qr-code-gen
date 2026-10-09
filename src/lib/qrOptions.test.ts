import { describe, expect, it } from 'vitest';
import type { QRConfig } from '../App';
import { toQrOptions } from './qrOptions';

const base: QRConfig = {
  value: 'https://example.com',
  size: 300,
  margin: 10,
  bgColor: '#ffffff',
  dotsColor: '#000000',
  dotsType: 'rounded',
  cornersSquareType: 'extra-rounded',
  cornersSquareColor: '#111111',
  cornersDotType: 'dot',
  cornersDotColor: '#222222',
  image: null,
  imageSize: 0.4,
  errorCorrection: 'Q',
};

describe('toQrOptions', () => {
  it('uses size for both width and height', () => {
    const o = toQrOptions({ ...base, size: 512 });
    expect(o.width).toBe(512);
    expect(o.height).toBe(512);
  });

  it('never passes empty data to the encoder', () => {
    expect(toQrOptions({ ...base, value: '' }).data).toBe(' ');
    expect(toQrOptions(base).data).toBe('https://example.com');
  });

  it('maps styles and colours', () => {
    const o = toQrOptions(base);
    expect(o.margin).toBe(10);
    expect(o.backgroundOptions).toEqual({ color: '#ffffff' });
    expect(o.dotsOptions).toEqual({ color: '#000000', type: 'rounded' });
    expect(o.cornersSquareOptions).toEqual({ color: '#111111', type: 'extra-rounded' });
    expect(o.cornersDotOptions).toEqual({ color: '#222222', type: 'dot' });
  });

  it('omits the logo when none is set and passes it through otherwise', () => {
    expect(toQrOptions(base).image).toBeUndefined();
    const o = toQrOptions({ ...base, image: 'data:image/png;base64,AAA', imageSize: 0.3 });
    expect(o.image).toBe('data:image/png;base64,AAA');
    expect(o.imageOptions).toEqual({ crossOrigin: 'anonymous', margin: 5, imageSize: 0.3 });
  });

  it('passes error correction level', () => {
    expect(toQrOptions(base).qrOptions).toEqual({ errorCorrectionLevel: 'Q' });
    expect(toQrOptions({ ...base, errorCorrection: 'H' }).qrOptions).toEqual({ errorCorrectionLevel: 'H' });
  });
});
