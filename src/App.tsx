import { useState } from 'react';
import { InputForm } from './components/InputForm';
import { QrDisplay } from './components/QrDisplay';
import './index.css';

export interface QRConfig {
  value: string;
  size: number;
  margin: number;
  bgColor: string;
  dotsColor: string;
  dotsType: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
  cornersSquareType: 'square' | 'dot' | 'extra-rounded';
  cornersSquareColor: string;
  cornersDotType: 'square' | 'dot';
  cornersDotColor: string;
  image: string | null;
  imageSize: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

export default function App() {
  const [config, setConfig] = useState<QRConfig>({
    value: 'https://github.com/xand0dev/qr-code-gen',
    size: 300,
    margin: 10,
    bgColor: '#ffffff',
    dotsColor: '#000000',
    dotsType: 'square',
    cornersSquareType: 'square',
    cornersSquareColor: '#000000',
    cornersDotType: 'square',
    cornersDotColor: '#000000',
    image: null,
    imageSize: 0.4,
    errorCorrection: 'Q',
  });

  const updateConfig = <K extends keyof QRConfig>(field: K, val: QRConfig[K]) => {
    setConfig((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="app-container">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>QR CODE GEN</h1>
      
      <main className="main-layout">
        {/* Ліва колонка: Форма налаштувань */}
        <section className="controls">
          <InputForm config={config} onChange={updateConfig} />
        </section>

        {/* Права колонка: Липкий (sticky) QR-код, щоб не тікав при скролі */}
        <section 
          className="preview" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-start',
            position: 'sticky',
            top: '2rem' 
          }}
        >
          <QrDisplay config={config} />
        </section>
      </main>
    </div>
  );
}