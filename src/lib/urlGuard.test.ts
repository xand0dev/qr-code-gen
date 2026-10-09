import { describe, expect, it } from 'vitest';
import { analyzeUrl, withUtm } from './urlGuard';

describe('analyzeUrl', () => {
  it('returns isUrl false for non-URL input', () => {
    const result = analyzeUrl('not a url');
    expect(result.isUrl).toBe(false);
    expect(result.warnings).toEqual([]);
  });

  it('returns isUrl false for empty string', () => {
    const result = analyzeUrl('');
    expect(result.isUrl).toBe(false);
    expect(result.warnings).toEqual([]);
  });

  it('returns isUrl false for whitespace only', () => {
    const result = analyzeUrl('   ');
    expect(result.isUrl).toBe(false);
    expect(result.warnings).toEqual([]);
  });

  it('detects HTTP scheme warning', () => {
    const result = analyzeUrl('http://example.com');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain("Незахищене з'єднання (http)");
  });

  it('detects URL shortener warning for bit.ly', () => {
    const result = analyzeUrl('https://bit.ly/abc');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Скорочене посилання приховує реальну адресу');
  });

  it('detects URL shortener warning for t.co', () => {
    const result = analyzeUrl('https://t.co/abc');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Скорочене посилання приховує реальну адресу');
  });

  it('detects URL shortener warning for tinyurl.com', () => {
    const result = analyzeUrl('https://tinyurl.com/abc');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Скорочене посилання приховує реальну адресу');
  });

  it('detects URL shortener warning for goo.gl', () => {
    const result = analyzeUrl('https://goo.gl/abc');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Скорочене посилання приховує реальну адресу');
  });

  it('detects URL shortener warning for is.gd', () => {
    const result = analyzeUrl('https://is.gd/abc');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Скорочене посилання приховує реальну адресу');
  });

  it('detects URL shortener warning for ow.ly', () => {
    const result = analyzeUrl('https://ow.ly/abc');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Скорочене посилання приховує реальну адресу');
  });

  it('detects URL shortener warning for buff.ly', () => {
    const result = analyzeUrl('https://buff.ly/abc');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Скорочене посилання приховує реальну адресу');
  });

  it('detects URL shortener warning for rebrand.ly', () => {
    const result = analyzeUrl('https://rebrand.ly/abc');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Скорочене посилання приховує реальну адресу');
  });

  it('detects URL shortener warning for cutt.ly', () => {
    const result = analyzeUrl('https://cutt.ly/abc');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Скорочене посилання приховує реальну адресу');
  });

  it('detects IPv4 host warning', () => {
    const result = analyzeUrl('https://192.168.1.1');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Адреса задана IP');
  });

  it('detects xn-- punycode warning', () => {
    const result = analyzeUrl('https://xn--e1afmkfd.xn--p1ai');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Схоже на підміну символів у домені');
  });

  it('detects localhost warning', () => {
    const result = analyzeUrl('https://localhost:3000');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Локальна адреса не відкриється ззовні');
  });

  it('detects .local host warning', () => {
    const result = analyzeUrl('https://myhost.local');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Локальна адреса не відкриється ззовні');
  });

  it('detects private IPv4 10.x warning', () => {
    const result = analyzeUrl('https://10.0.0.1');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Локальна адреса не відкриється ззовні');
  });

  it('detects private IPv4 192.168.x warning', () => {
    const result = analyzeUrl('https://192.168.1.100');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Локальна адреса не відкриється ззовні');
  });

  it('detects private IPv4 172.16.x warning', () => {
    const result = analyzeUrl('https://172.16.0.1');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Локальна адреса не відкриється ззовні');
  });

  it('detects private IPv4 172.31.x warning', () => {
    const result = analyzeUrl('https://172.31.255.255');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Локальна адреса не відкриється ззовні');
  });

  it('detects long URL warning (>200 chars)', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(200);
    const result = analyzeUrl(longUrl);
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toContain('Дуже довге посилання');
  });

  it('recognizes host without scheme (example.com)', () => {
    const result = analyzeUrl('example.com');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it('recognizes host with path without scheme', () => {
    const result = analyzeUrl('example.com/path');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it('trims input before analyzing', () => {
    const result = analyzeUrl('  https://example.com  ');
    expect(result.isUrl).toBe(true);
  });

  it('does not warn for valid HTTPS URL', () => {
    const result = analyzeUrl('https://example.com');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it('does not warn for 172.15.x (not private)', () => {
    const result = analyzeUrl('https://172.15.0.1');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).not.toContain('Локальна адреса не відкриється ззовні');
  });

  it('does not warn for 172.32.x (not private)', () => {
    const result = analyzeUrl('https://172.32.0.1');
    expect(result.isUrl).toBe(true);
    expect(result.warnings).not.toContain('Локальна адреса не відкриється ззовні');
  });
});

describe('withUtm', () => {
  it('returns url unchanged when it cannot be parsed', () => {
    const result = withUtm('not a url', { source: 'test' });
    expect(result).toBe('not a url');
  });

  it('adds utm_source when provided', () => {
    const result = withUtm('https://example.com', { source: 'google' });
    expect(result).toBe('https://example.com/?utm_source=google');
  });

  it('adds utm_medium when provided', () => {
    const result = withUtm('https://example.com', { medium: 'cpc' });
    expect(result).toBe('https://example.com/?utm_medium=cpc');
  });

  it('adds utm_campaign when provided', () => {
    const result = withUtm('https://example.com', { campaign: 'summer_sale' });
    expect(result).toBe('https://example.com/?utm_campaign=summer_sale');
  });

  it('adds utm_term when provided', () => {
    const result = withUtm('https://example.com', { term: 'keyword' });
    expect(result).toBe('https://example.com/?utm_term=keyword');
  });

  it('adds utm_content when provided', () => {
    const result = withUtm('https://example.com', { content: 'banner' });
    expect(result).toBe('https://example.com/?utm_content=banner');
  });

  it('keeps the fragment', () => {
    const result = withUtm('https://example.com#section', { source: 'test' });
    expect(result).toBe('https://example.com/?utm_source=test#section');
  });

  it('replaces existing utm_source', () => {
    const result = withUtm('https://example.com?utm_source=old', { source: 'new' });
    expect(result).toBe('https://example.com/?utm_source=new');
  });

  it('replaces existing utm_medium', () => {
    const result = withUtm('https://example.com?utm_medium=old', { medium: 'new' });
    expect(result).toBe('https://example.com/?utm_medium=new');
  });

  it('replaces existing utm_campaign', () => {
    const result = withUtm('https://example.com?utm_campaign=old', { campaign: 'new' });
    expect(result).toBe('https://example.com/?utm_campaign=new');
  });

  it('replaces existing utm_term', () => {
    const result = withUtm('https://example.com?utm_term=old', { term: 'new' });
    expect(result).toBe('https://example.com/?utm_term=new');
  });

  it('replaces existing utm_content', () => {
    const result = withUtm('https://example.com?utm_content=old', { content: 'new' });
    expect(result).toBe('https://example.com/?utm_content=new');
  });

  it('skips empty utm_source', () => {
    const result = withUtm('https://example.com', { source: '' });
    expect(result).toBe('https://example.com/');
  });

  it('skips whitespace-only utm_source', () => {
    const result = withUtm('https://example.com', { source: '   ' });
    expect(result).toBe('https://example.com/');
  });

  it('skips empty utm values', () => {
    const result = withUtm('https://example.com', { source: '', medium: 'cpc', campaign: '' });
    expect(result).toBe('https://example.com/?utm_medium=cpc');
  });

  it('keeps other query parameters', () => {
    const result = withUtm('https://example.com?foo=bar', { source: 'test' });
    expect(result).toBe('https://example.com/?foo=bar&utm_source=test');
  });

  it('keeps other query parameters and fragment', () => {
    const result = withUtm('https://example.com?foo=bar#section', { source: 'test' });
    expect(result).toBe('https://example.com/?foo=bar&utm_source=test#section');
  });

  it('handles URL with existing query params and adds multiple utm params', () => {
    const result = withUtm('https://example.com?existing=value', {
      source: 'google',
      medium: 'cpc',
      campaign: 'summer',
    });
    expect(result).toBe('https://example.com/?existing=value&utm_source=google&utm_medium=cpc&utm_campaign=summer');
  });

  it('works with bare host and path (example.com/path)', () => {
    const result = withUtm('example.com/path', { source: 'test' });
    expect(result).toBe('https://example.com/path?utm_source=test');
  });

  it('works with bare host without path', () => {
    const result = withUtm('example.com', { source: 'test' });
    expect(result).toBe('https://example.com/?utm_source=test');
  });

  it('works with localhost', () => {
    const result = withUtm('localhost:3000/path', { source: 'test' });
    expect(result).toBe('https://localhost:3000/path?utm_source=test');
  });

  it('returns unchanged for plain text that is not a host', () => {
    const result = withUtm('not a url', { source: 'test' });
    expect(result).toBe('not a url');
  });

  it('returns unchanged for plain text without dots', () => {
    const result = withUtm('plaintext', { source: 'test' });
    expect(result).toBe('plaintext');
  });

  it('returns unchanged for host without dot and not localhost', () => {
    const result = withUtm('intranet/path', { source: 'test' });
    expect(result).toBe('intranet/path');
  });
});