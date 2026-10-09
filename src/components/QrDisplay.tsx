import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRConfig } from '../App';
import { toQrOptions } from '../lib/qrOptions';
import { downloadName } from '../lib/downloadName';
import { contrastRatio } from '../lib/contrast';
import { assessScanSafety } from '../lib/scanSafety';
import { resolveExport } from '../lib/exportOptions';
import type { ExportFormat } from '../lib/exportOptions';

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
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState(2);
  const [transparent, setTransparent] = useState(false);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const exportOpts = resolveExport({ format, scale, transparent, size: config.size });

  const handleDownload = () => {
    const { extension, width, height, transparent: finalTransparent } = exportOpts;
    const type = extension === 'svg' ? 'svg' : 'canvas';
    new QRCodeStyling({
      ...toQrOptions(config),
      type,
      width,
      height,
      backgroundOptions: { color: finalTransparent ? 'transparent' : config.bgColor },
    }).download({ name: downloadName(new Date()), extension });
  };

  const handleCopyPng = async () => {
    const opts = resolveExport({ format: 'png', scale, transparent, size: config.size });
    const { width, height, transparent: finalTransparent } = opts;
    const qr = new QRCodeStyling({
      ...toQrOptions(config),
      type: 'canvas',
      width,
      height,
      backgroundOptions: { color: finalTransparent ? 'transparent' : config.bgColor },
    });
    try {
      const blob = await qr.getRawData('png');
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob as Blob })]);
        setCopyMsg('Скопійовано');
      } else {
        setCopyMsg('Не вдалося скопіювати');
      }
    } catch {
      setCopyMsg('Не вдалося скопіювати');
    }
    setTimeout(() => setCopyMsg(null), 2000);
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
          <select disabled={isDisabled} value={format} onChange={e => setFormat(e.target.value as ExportFormat)} style={{ padding: '0.5rem' }}>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
            <option value="svg">SVG</option>
          </select>
          <select disabled={isDisabled} value={scale} onChange={e => setScale(Number(e.target.value))} style={{ padding: '0.5rem' }}>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={3}>3×</option>
            <option value={4}>4×</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input type="checkbox" disabled={isDisabled} checked={transparent} onChange={e => setTransparent(e.target.checked)} />
            Прозорий фон
          </label>
          <button disabled={isDisabled} onClick={handleDownload} style={{ ...btnStyle, backgroundColor: '#4CAF50' }}>
            Завантажити
          </button>
          <button disabled={isDisabled} onClick={handleCopyPng} style={{ ...btnStyle, backgroundColor: '#2196F3' }}>
            Копіювати PNG
          </button>
        </div>
        {copyMsg && <div style={{ fontSize: '0.85rem', color: '#cccccc' }}>{copyMsg}</div>}
        {exportOpts.notes.length > 0 && (
          <div style={{ fontSize: '0.8rem', color: '#aaaaaa' }}>
            {exportOpts.notes.join(', ')}
          </div>
        )}
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
          <strong style={{ color: '#222' }}>
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