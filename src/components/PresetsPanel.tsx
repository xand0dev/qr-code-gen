import { useState } from 'react';
import type { StyleConfig, Preset } from '../lib/presets';
import { serializePresets, parsePresets, addPreset, removePreset } from '../lib/presets';

const STORAGE_KEY = 'qr-presets';

function loadPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.presets && Array.isArray(parsed.presets)) return parsed.presets;
    }
  } catch {
    // ignore
  }
  return [];
}

function savePresets(list: Preset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function PresetsPanel({ config, onApply }: { config: StyleConfig; onApply: (style: StyleConfig) => void }) {
  const [presets, setPresets] = useState<Preset[]>(loadPresets);
  const [presetName, setPresetName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  function handleSave() {
    const id = crypto.randomUUID();
    const newPresets = addPreset(presets, presetName, config, new Date(), id);
    setPresets(newPresets);
    savePresets(newPresets);
    setPresetName('');
  }

  function handleApply(style: StyleConfig) {
    onApply(style);
  }

  function handleDelete(id: string) {
    const newPresets = removePreset(presets, id);
    setPresets(newPresets);
    savePresets(newPresets);
  }

  function handleExport() {
    const json = serializePresets(presets);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-presets.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { presets: imported, errors } = parsePresets(text);
      if (errors.length > 0) {
        setImportError(errors.join('\n'));
      } else {
        setImportError(null);
        const existingIds = new Set(presets.map(p => p.id));
        const merged = [...presets, ...imported.filter(p => !existingIds.has(p.id))];
        setPresets(merged);
        savePresets(merged);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="Назва пресету"
          style={{
            flex: 1,
            padding: '0.8rem',
            borderRadius: '6px',
            border: '1px solid #444',
            backgroundColor: '#1e1e1e',
            color: '#fff',
          }}
        />
        <button
          onClick={handleSave}
          disabled={presetName.trim().length === 0}
          style={{
            padding: '0.8rem 1.5rem',
            background: '#2e7d32',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: presetName.trim().length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: presetName.trim().length === 0 ? 0.6 : 1,
          }}
        >
          Зберегти поточний стиль
        </button>
      </div>

      {importError && (
        <div style={{ color: '#ef5350', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
          {importError}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {presets.map((preset) => (
          <div
            key={preset.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#1e1e1e',
              borderRadius: '6px',
              border: '1px solid #333',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 'bold', color: '#fff' }}>{preset.name}</span>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>
                {new Date(preset.createdAt).toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleApply(preset.style)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Застосувати
              </button>
              <button
                onClick={() => handleDelete(preset.id)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
        {presets.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
            Пресетів немає
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleExport}
          disabled={presets.length === 0}
          style={{
            padding: '0.8rem 1.5rem',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: presets.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: presets.length === 0 ? 0.6 : 1,
          }}
        >
          Експорт JSON
        </button>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <span style={{
            padding: '0.8rem 1.5rem',
            background: '#1565c0',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}>
            Імпорт JSON
          </span>
        </label>
      </div>
    </div>
  );
}