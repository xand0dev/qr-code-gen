import { describe, expect, it } from 'vitest';
import { buildPayload } from './payloads';

describe('buildPayload', () => {
  it('text returns value', () => {
    expect(buildPayload('text', { value: 'hello' })).toBe('hello');
  });

  it('text returns empty string when value missing', () => {
    expect(buildPayload('text', {})).toBe('');
  });

  it('wifi defaults security to WPA and hidden to false', () => {
    expect(buildPayload('wifi', { ssid: 'MyNet', password: 'secret' })).toBe('WIFI:T:WPA;S:MyNet;P:secret;H:false;;');
  });

  it('wifi uses provided security and hidden', () => {
    expect(buildPayload('wifi', { ssid: 'MyNet', password: 'secret', security: 'WEP', hidden: 'true' })).toBe('WIFI:T:WEP;S:MyNet;P:secret;H:true;;');
  });

  it('wifi escapes special characters in ssid and password', () => {
    expect(buildPayload('wifi', { ssid: 'A\\B;C:D,"E', password: 'p;a,s:s"w\\o:r,d' })).toBe('WIFI:T:WPA;S:A\\\\B\\;C\\:D\\,\\"E;P:p\\;a\\,s\\:s\\"w\\\\o\\:r\\,d;H:false;;');
  });

  it('email returns mailto with only non-empty parts', () => {
    expect(buildPayload('email', { to: 'a@b.com', subject: 'Hello', body: 'World' })).toBe('mailto:a@b.com?subject=Hello&body=World');
    expect(buildPayload('email', { to: 'a@b.com', subject: '', body: 'World' })).toBe('mailto:a@b.com?body=World');
    expect(buildPayload('email', { to: 'a@b.com', subject: 'Hello', body: '' })).toBe('mailto:a@b.com?subject=Hello');
    expect(buildPayload('email', { to: 'a@b.com' })).toBe('mailto:a@b.com');
  });

  it('email encodes URI components', () => {
    expect(buildPayload('email', { to: 'a@b.com', subject: 'Hello World', body: 'Line1\nLine2' })).toBe('mailto:a@b.com?subject=Hello%20World&body=Line1%0ALine2');
  });

  it('sms returns SMSTO format', () => {
    expect(buildPayload('sms', { number: '+1234567890', message: 'Hello' })).toBe('SMSTO:+1234567890:Hello');
  });

  it('phone removes spaces', () => {
    expect(buildPayload('phone', { number: '+1 234 567 890' })).toBe('tel:+1234567890');
  });

  it('geo returns geo format', () => {
    expect(buildPayload('geo', { lat: '40.7128', lng: '-74.0060' })).toBe('geo:40.7128,-74.0060');
  });

  it('vcard includes only non-empty optional fields', () => {
    const result = buildPayload('vcard', {
      firstName: 'John',
      lastName: 'Doe',
      org: 'Acme Inc',
      phone: '+1234567890',
      email: 'john@example.com',
      url: 'https://example.com',
    });
    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('VERSION:3.0');
    expect(result).toContain('N:Doe;John;;;');
    expect(result).toContain('FN:John Doe');
    expect(result).toContain('ORG:Acme Inc');
    expect(result).toContain('TEL:+1234567890');
    expect(result).toContain('EMAIL:john@example.com');
    expect(result).toContain('URL:https://example.com');
    expect(result).toContain('END:VCARD');
    expect(result.split('\r\n').filter(l => l).length).toBe(9);
  });

  it('vcard omits empty optional fields', () => {
    const result = buildPayload('vcard', {
      firstName: 'John',
      lastName: 'Doe',
      org: '',
      phone: '',
      email: '',
      url: '',
    });
    const lines = result.split('\r\n').filter(l => l);
    expect(lines).toEqual([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Doe;John;;;',
      'FN:John Doe',
      'END:VCARD',
    ]);
  });

  it('vcard escapes comma, semicolon, and newline', () => {
    const result = buildPayload('vcard', {
      firstName: 'John, Jr.',
      lastName: 'Doe;Smith',
      org: 'Acme\nInc',
    });
    expect(result).toContain('N:Doe\\;Smith;John\\, Jr.;;;');
    expect(result).toContain('FN:John\\, Jr. Doe\\;Smith');
    expect(result).toContain('ORG:Acme');
    expect(result).toContain('Inc');
  });

  it('handles missing fields as empty strings', () => {
    expect(buildPayload('wifi', {})).toBe('WIFI:T:WPA;S:;P:;H:false;;');
    expect(buildPayload('email', {})).toBe('mailto:');
    expect(buildPayload('sms', {})).toBe('SMSTO::');
    expect(buildPayload('phone', {})).toBe('tel:');
    expect(buildPayload('geo', {})).toBe('geo:,');
    expect(buildPayload('vcard', {})).toContain('N:;;;');
    expect(buildPayload('vcard', {})).toContain('FN:');
  });
});