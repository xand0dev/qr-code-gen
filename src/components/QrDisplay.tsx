import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRConfig } from '../App';
import { toQrOptions } from '../lib/qrOptions';

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
    qrCode.current.download({ extension: ext, name: `qr-code-monkey-clone-${Date.now()}` });
  };

  const btnStyle = {
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
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

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => handleDownload('png')}
          style={{ ...btnStyle, backgroundColor: '#4CAF50' }}
        >
          Завантажити PNG
        </button>
        
        <button
          onClick={() => handleDownload('svg')}
          style={{ ...btnStyle, backgroundColor: '#2196F3' }}
        >
          Завантажити SVG
        </button>
      </div>
    </div>
  );
}