import { useState } from 'react';
import type { PayloadKind } from '../lib/payloads';
import { buildPayload } from '../lib/payloads';
import type { CSSProperties } from 'react';

interface PayloadFormProps {
  kind: PayloadKind;
  onKindChange: (kind: PayloadKind) => void;
  onChange: (value: string) => void;
}

const STYLES: Record<string, CSSProperties> = {
  label: { fontSize: '0.9rem', color: '#aaa' },
  input: { padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff' },
  select: { padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: '#fff', cursor: 'pointer' },
  checkbox: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  row: { display: 'flex', gap: '1rem' },
};

const OPTIONS = [
  { value: 'text', label: 'Текст' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'phone', label: 'Телефон' },
  { value: 'geo', label: 'Геолокація' },
  { value: 'vcard', label: 'Візитка (vCard)' },
];

export function PayloadForm({ kind, onKindChange, onChange }: PayloadFormProps) {
  const [fields, setFields] = useState<Record<string, string>>({});

  const handleKindChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKind = e.target.value as PayloadKind;
    onKindChange(newKind);
    setFields({});
    onChange(buildPayload(newKind, {}));
  };

  const handleFieldChange = (key: string, value: string) => {
    const newFields = { ...fields, [key]: value };
    setFields(newFields);
    onChange(buildPayload(kind, newFields));
  };

  const handleCheckboxChange = (key: string, checked: boolean) => {
    handleFieldChange(key, checked ? 'true' : 'false');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={STYLES.field}>
        <label style={STYLES.label}>Тип вмісту</label>
        <select value={kind} onChange={handleKindChange} style={STYLES.select}>
          {OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {kind === 'wifi' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Назва мережі</label>
            <input type="text" value={fields.ssid ?? ''} onChange={e => handleFieldChange('ssid', e.target.value)} style={STYLES.input} placeholder="SSID" />
          </div>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Пароль</label>
            <input type="text" value={fields.password ?? ''} onChange={e => handleFieldChange('password', e.target.value)} style={STYLES.input} placeholder="Пароль" />
          </div>
        </div>
      )}

      {kind === 'wifi' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Захист</label>
            <select value={fields.security ?? 'WPA'} onChange={e => handleFieldChange('security', e.target.value)} style={STYLES.select}>
              <option value="WPA">WPA</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Без пароля</option>
            </select>
          </div>
          <div style={STYLES.field}>
            <label style={STYLES.checkbox}>
              <input type="checkbox" checked={fields.hidden === 'true'} onChange={e => handleCheckboxChange('hidden', e.target.checked)} />
              <span>Прихована</span>
            </label>
          </div>
        </div>
      )}

      {kind === 'email' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Кому</label>
            <input type="email" value={fields.to ?? ''} onChange={e => handleFieldChange('to', e.target.value)} style={STYLES.input} placeholder="email@example.com" />
          </div>
        </div>
      )}

      {kind === 'email' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Тема</label>
            <input type="text" value={fields.subject ?? ''} onChange={e => handleFieldChange('subject', e.target.value)} style={STYLES.input} placeholder="Тема листа" />
          </div>
        </div>
      )}

      {kind === 'email' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Текст</label>
            <input type="text" value={fields.body ?? ''} onChange={e => handleFieldChange('body', e.target.value)} style={STYLES.input} placeholder="Тіло листа" />
          </div>
        </div>
      )}

      {kind === 'sms' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Номер</label>
            <input type="tel" value={fields.number ?? ''} onChange={e => handleFieldChange('number', e.target.value)} style={STYLES.input} placeholder="+380XXXXXXXXX" />
          </div>
        </div>
      )}

      {kind === 'sms' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Повідомлення</label>
            <input type="text" value={fields.message ?? ''} onChange={e => handleFieldChange('message', e.target.value)} style={STYLES.input} placeholder="Текст SMS" />
          </div>
        </div>
      )}

      {kind === 'phone' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Номер</label>
            <input type="tel" value={fields.number ?? ''} onChange={e => handleFieldChange('number', e.target.value)} style={STYLES.input} placeholder="+380XXXXXXXXX" />
          </div>
        </div>
      )}

      {kind === 'geo' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Широта</label>
            <input type="text" value={fields.lat ?? ''} onChange={e => handleFieldChange('lat', e.target.value)} style={STYLES.input} placeholder="50.4501" />
          </div>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Довгота</label>
            <input type="text" value={fields.lng ?? ''} onChange={e => handleFieldChange('lng', e.target.value)} style={STYLES.input} placeholder="30.5234" />
          </div>
        </div>
      )}

      {kind === 'vcard' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Ім'я</label>
            <input type="text" value={fields.firstName ?? ''} onChange={e => handleFieldChange('firstName', e.target.value)} style={STYLES.input} placeholder="Іван" />
          </div>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Прізвище</label>
            <input type="text" value={fields.lastName ?? ''} onChange={e => handleFieldChange('lastName', e.target.value)} style={STYLES.input} placeholder="Іванов" />
          </div>
        </div>
      )}

      {kind === 'vcard' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Організація</label>
            <input type="text" value={fields.org ?? ''} onChange={e => handleFieldChange('org', e.target.value)} style={STYLES.input} placeholder="Компанія" />
          </div>
        </div>
      )}

      {kind === 'vcard' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Телефон</label>
            <input type="tel" value={fields.phone ?? ''} onChange={e => handleFieldChange('phone', e.target.value)} style={STYLES.input} placeholder="+380XXXXXXXXX" />
          </div>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Email</label>
            <input type="email" value={fields.email ?? ''} onChange={e => handleFieldChange('email', e.target.value)} style={STYLES.input} placeholder="email@example.com" />
          </div>
        </div>
      )}

      {kind === 'vcard' && (
        <div style={STYLES.row}>
          <div style={STYLES.field}>
            <label style={STYLES.label}>Сайт</label>
            <input type="url" value={fields.url ?? ''} onChange={e => handleFieldChange('url', e.target.value)} style={STYLES.input} placeholder="https://example.com" />
          </div>
        </div>
      )}
    </div>
  );
}