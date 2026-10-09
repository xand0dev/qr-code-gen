import type { Options } from 'qr-code-styling';
import type { QRConfig } from '../App';

// Maps the form state onto qr-code-styling options. Kept pure so it can be unit-tested.
export function toQrOptions(config: QRConfig): Partial<Options> {
  return {
    width: config.size,
    height: config.size,
    data: config.value || ' ',
    margin: config.margin,
    backgroundOptions: { color: config.bgColor },
    dotsOptions: { color: config.dotsColor, type: config.dotsType },
    cornersSquareOptions: { color: config.cornersSquareColor, type: config.cornersSquareType },
    cornersDotOptions: { color: config.cornersDotColor, type: config.cornersDotType },
    image: config.image || undefined,
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: config.imageSize },
  };
}
