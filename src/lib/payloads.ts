export type PayloadKind = 'text' | 'wifi' | 'email' | 'sms' | 'phone' | 'geo' | 'vcard';

function escapeWifi(str: string): string {
  return str.replace(/[\\;,:"]/g, '\\$&');
}

function escapeVCard(str: string): string {
  return str.replace(/[,\n;]/g, '\\$&');
}

function buildVCard(fields: Record<string, string>): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCard(fields.lastName ?? '')};${escapeVCard(fields.firstName ?? '')};;;`,
    `FN:${escapeVCard((fields.firstName ?? '') + ' ' + (fields.lastName ?? '')).trim()}`,
  ];

  if (fields.org) lines.push(`ORG:${escapeVCard(fields.org)}`);
  if (fields.phone) lines.push(`TEL:${escapeVCard(fields.phone)}`);
  if (fields.email) lines.push(`EMAIL:${escapeVCard(fields.email)}`);
  if (fields.url) lines.push(`URL:${escapeVCard(fields.url)}`);

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function buildPayload(kind: PayloadKind, f: Record<string, string>): string {
  switch (kind) {
    case 'text':
      return f.value ?? '';
    case 'wifi': {
      const security = f.security ?? 'WPA';
      const hidden = f.hidden === 'true' ? 'true' : 'false';
      const ssid = escapeWifi(f.ssid ?? '');
      const password = escapeWifi(f.password ?? '');
      return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
    }
    case 'email': {
      const to = f.to ?? '';
      const parts: string[] = [];
      if (f.subject) parts.push(`subject=${encodeURIComponent(f.subject)}`);
      if (f.body) parts.push(`body=${encodeURIComponent(f.body)}`);
      const query = parts.length > 0 ? '?' + parts.join('&') : '';
      return `mailto:${to}${query}`;
    }
    case 'sms':
      return `SMSTO:${f.number ?? ''}:${f.message ?? ''}`;
    case 'phone':
      return `tel:${(f.number ?? '').replace(/\s+/g, '')}`;
    case 'geo':
      return `geo:${f.lat ?? ''},${f.lng ?? ''}`;
    case 'vcard':
      return buildVCard(f);
    default:
      return '';
  }
}