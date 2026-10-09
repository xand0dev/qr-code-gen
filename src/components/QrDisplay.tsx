import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRConfig } from '../App';
import { toQrOptions } from '../lib/qrOptions';
import { downloadName } from '../lib/downloadName';
import { contrastRatio } from '../lib/contrast';
import { assessScanSafety } from '../lib/scanSafety';

interface QrDisplayProps {
  config: QRConfig;
}

export function QrDisplay({ config }: QrDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Ініціалізуємо інстанс бібліотеки один раз і тримаємо в рефі
  const qrCode = useRef<QRCodeStyling>(
    new QRCodeStyling({
      type: 'svg', // Використовуємо SVG для чіткого рендеру в DOM
      width: config.size,
      height: config.size,
      data: config.value || ' ',
    })
  );

  // Монтуємо QR-код у DOM при першому рендері
  useEffect(() => {
    if (qrRef.current) {
      qrCode.current.append(qrRef.current);
    }
  }, []);

  // Оновлюємо налаштування при будь-якій зміні config
  useEffect(() => {
    qrCode.current.update(toQrOptions(config));
  }, [config]);

  // Вбудовані методи завантаження з бібліотеки
  const handleDownload = (ext: 'png' | 'svg') => {
    qrCode.current.download({ extension: ext, name: downloadName(new Date()) });
  };

  const isDisabled = !config.value.trim();

  const safety = assessScanSafety({
    value: config.value,
    errorCorrection: config.errorCorrection,
    logoSize: config.image ? config.imageSize : null,
    contrast: contrastRatio(config.dotsColor, config.bgColor),
    margin: config.margin,
  });

  const btnStyle = {
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      
      {/* Контейнер для ін'єкції QR-коду */}
      <div 
        ref={qrRef}
        style={{ 
          backgroundColor: '#fff', // Робимо фон контейнера білим для чистого експорту
          padding: '1rem',
          borderRadius: '12px',
          display: 'inline-flex'
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        {isDisabled && <div style={{ color: '#d32f2f', fontSize: '0.9rem' }}>Введіть текст або URL</div>}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            disabled={isDisabled}
            onClick={() => handleDownload('png')}
            style={{ ...btnStyle, backgroundColor: '#4CAF50' }}
          >
            Завантажити PNG
          </button>
          
          <button
            disabled={isDisabled}
            onClick={() => handleDownload('svg')}
            style={{ ...btnStyle, backgroundColor: '#2196F3' }}
          >
            Завантажити SVG
          </button>
        </div>
      </div>

      <div style={{ 
        width: '100%', 
        maxWidth: '320px',
        padding: '0.75rem 1rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 
              safety.level === 'ok' ? '#4CAF50' : 
              safety.level === 'warn' ? '#ffb300' : '#d32f2f'
          }} />
          <strong>
            Безпека сканування: {safety.level === 'ok' ? 'OK' : safety.level === 'warn' ? 'Увага' : 'Ризик'}
          </strong>
        </div>
        {safety.issues.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#333' }}>
            {safety.issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}