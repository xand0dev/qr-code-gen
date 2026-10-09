import { useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import type { QRConfig } from '../App';
import type { PayloadKind } from '../lib/payloads';
import type { StyleConfig } from '../lib/presets';
import { PayloadForm } from './PayloadForm';
import { PresetsPanel } from './PresetsPanel';
import { analyzeUrl, withUtm } from '../lib/urlGuard';

interface InputFormProps {
  config: QRConfig;
  onChange: <K extends keyof QRConfig>(field: K, val: QRConfig[K]) => void;
  onApplyStyle?: (style: StyleConfig) => void;
}

// Внутрішній компонент для секцій акордеону
const AccordionSection = ({
  title,
  isOpen,
  onClick,
  children
}: {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <div style={{ backgroundColor: '#2a2a2a', borderRadius: '8px', overflow: 'hidden' }}>
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        borderBottom: isOpen ? '1px solid #333' : 'none'
      }}
    >
      {title}
      <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
        ▼
      </span>
    </button>
    {isOpen && (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {children}
      </div>
    )}
  </div>
);

const Select = ({ config, onChange, label, field, options }: { config: QRConfig, onChange: InputFormProps['onChange'], label: string, field: keyof QRConfig, options: string[] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
    <label style={{ fontSize: '0.9rem', color: '#aaa' }}>{label}</label>
    <select
      value={config[field] as string}
      onChange={(e) => onChange(field, e.target.value)}
      style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff', cursor: 'pointer' }}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const ColorPicker = ({ config, onChange, label, field }: { config: QRConfig, onChange: InputFormProps['onChange'], label: string, field: keyof QRConfig }) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
    <label style={{ fontSize: '0.9rem', color: '#aaa' }}>{label}</label>
    <input
      type="color"
      value={config[field] as string}
      onChange={(e) => onChange(field, e.target.value)}
      style={{ width: '100%', height: '40px', cursor: 'pointer' }}
    />
  </div>
);

export function InputForm({ config, onChange, onApplyStyle }: InputFormProps) {
  // Стан для контролю відкритої секції (за замовчуванням відкрита перша)
  const [openSection, setOpenSection] = useState<string>('data');
  const [payloadKind, setPayloadKind] = useState<PayloadKind>('text');
  const [utmOpen, setUtmOpen] = useState(false);
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '', term: '', content: '' });

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? '' : section);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => onChange('image', event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
      
      {/* 1. Дані та розміри */}
      <AccordionSection title="Дані та Розміри" isOpen={openSection === 'data'} onClick={() => toggleSection('data')}>
        <PayloadForm kind={payloadKind} onKindChange={setPayloadKind} onChange={(v) => onChange('value', v)} />
        {payloadKind === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Текст або URL</label>
            <input
              type="text"
              value={config.value}
              onChange={(e) => onChange('value', e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff' }}
            />
            {analyzeUrl(config.value).warnings.map((w, i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: '#ffb300' }}>{w}</div>
            ))}
            <button
              onClick={() => setUtmOpen(!utmOpen)}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#aaa',
                fontSize: '0.9rem',
                cursor: 'pointer',
                alignSelf: 'flex-start'
              }}
            >
              {utmOpen ? 'Сховати UTM-мітки' : 'UTM-мітки'}
            </button>
            {utmOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="utm_source"
                  value={utm.source}
                  onChange={(e) => setUtm({ ...utm, source: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff' }}
                />
                <input
                  type="text"
                  placeholder="utm_medium"
                  value={utm.medium}
                  onChange={(e) => setUtm({ ...utm, medium: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff' }}
                />
                <input
                  type="text"
                  placeholder="utm_campaign"
                  value={utm.campaign}
                  onChange={(e) => setUtm({ ...utm, campaign: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff' }}
                />
                <input
                  type="text"
                  placeholder="utm_term"
                  value={utm.term}
                  onChange={(e) => setUtm({ ...utm, term: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff' }}
                />
                <input
                  type="text"
                  placeholder="utm_content"
                  value={utm.content}
                  onChange={(e) => setUtm({ ...utm, content: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff' }}
                />
                <button
                  onClick={() => onChange('value', withUtm(config.value, utm))}
                  style={{ padding: '0.6rem', background: '#ffb300', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start' }}
                >
                  Застосувати UTM
                </button>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#aaa' }}>
              <span>Розмір</span> <span>{config.size}px</span>
            </label>
            <input type="range" min="200" max="1000" step="10" value={config.size} onChange={(e) => onChange('size', parseInt(e.target.value, 10))} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#aaa' }}>
              <span>Відступи</span> <span>{config.margin}px</span>
            </label>
            <input type="range" min="0" max="50" step="1" value={config.margin} onChange={(e) => onChange('margin', parseInt(e.target.value, 10))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Select config={config} onChange={onChange} label="Корекція помилок" field="errorCorrection" options={['L', 'M', 'Q', 'H']} />
        </div>
      </AccordionSection>

      {/* 2. Стилізація тіла */}
      <AccordionSection title="Стиль QR-коду" isOpen={openSection === 'body'} onClick={() => toggleSection('body')}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Select config={config} onChange={onChange} label="Форма точок" field="dotsType" options={['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded']} />
          <ColorPicker config={config} onChange={onChange} label="Колір точок" field="dotsColor" />
        </div>
        <ColorPicker config={config} onChange={onChange} label="Колір фону" field="bgColor" />
      </AccordionSection>

      {/* 3. Стилізація очей */}
      <AccordionSection title="Стиль Очей (Кутів)" isOpen={openSection === 'eyes'} onClick={() => toggleSection('eyes')}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Select config={config} onChange={onChange} label="Форма рамки" field="cornersSquareType" options={['square', 'dot', 'extra-rounded']} />
          <ColorPicker config={config} onChange={onChange} label="Колір рамки" field="cornersSquareColor" />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Select config={config} onChange={onChange} label="Форма центру" field="cornersDotType" options={['square', 'dot']} />
          <ColorPicker config={config} onChange={onChange} label="Колір центру" field="cornersDotColor" />
        </div>
      </AccordionSection>

      {/* 4. Логотип */}
      <AccordionSection title="Логотип" isOpen={openSection === 'logo'} onClick={() => toggleSection('logo')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ color: '#aaa' }} />
          {config.image && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#aaa' }}>
                <span>Розмір логотипу</span>
                <span>{config.imageSize.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={config.imageSize}
                onChange={(e) => onChange('imageSize', parseFloat(e.target.value))}
              />
              <button
                onClick={() => {
                  onChange('image', null);
                  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
                  if (fileInput) fileInput.value = '';
                }}
                style={{ padding: '0.8rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Видалити логотип
              </button>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* 5. Пресети бренду */}
      {onApplyStyle && (
        <AccordionSection title="Пресети бренду" isOpen={openSection === 'presets'} onClick={() => toggleSection('presets')}>
          <PresetsPanel
            config={{
              size: config.size,
              margin: config.margin,
              bgColor: config.bgColor,
              dotsColor: config.dotsColor,
              dotsType: config.dotsType,
              cornersSquareType: config.cornersSquareType,
              cornersSquareColor: config.cornersSquareColor,
              cornersDotType: config.cornersDotType,
              cornersDotColor: config.cornersDotColor,
              imageSize: config.imageSize,
              errorCorrection: config.errorCorrection,
            }}
            onApply={onApplyStyle}
          />
        </AccordionSection>
      )}

    </div>
  );
}