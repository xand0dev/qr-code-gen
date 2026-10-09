export function analyzeUrl(input: string): { isUrl: boolean; warnings: string[] } {
  const trimmed = input.trim();
  const warnings: string[] = [];

  let url: URL | null = null;
  let host: string | null = null;
  let isUrl = false;

  try {
    url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      isUrl = true;
      host = url.hostname;
    }
  } catch {
    // try with https:// prefix
    try {
      const withScheme = `https://${trimmed}`;
      url = new URL(withScheme);
      if (url.protocol === 'https:') {
        isUrl = true;
        host = url.hostname;
      }
    } catch {
      // not a URL
    }
  }

  if (!isUrl) {
    return { isUrl: false, warnings: [] };
  }

  if (url!.protocol === 'http:') {
    warnings.push("Незахищене з'єднання (http)");
  }

  const shortenerHosts = ['bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'is.gd', 'ow.ly', 'buff.ly', 'rebrand.ly', 'cutt.ly'];
  if (host && shortenerHosts.includes(host)) {
    warnings.push('Скорочене посилання приховує реальну адресу');
  }

  if (host && /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    warnings.push('Адреса задана IP');
  }

  if (host && host.includes('xn--')) {
    warnings.push('Схоже на підміну символів у домені');
  }

  if (host) {
    const isLocalhost = host === 'localhost' || host.endsWith('.local');
    const isPrivateIp = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host);
    if (isLocalhost || isPrivateIp) {
      warnings.push('Локальна адреса не відкриється ззовні');
    }
  }

  if (trimmed.length > 200) {
    warnings.push('Дуже довге посилання');
  }

  return { isUrl, warnings };
}

export function withUtm(
  url: string,
  utm: { source?: string; medium?: string; campaign?: string; term?: string; content?: string }
): string {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return url;
  }

  const params = new URLSearchParams(parsedUrl.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

  // Remove existing UTM parameters
  for (const key of utmKeys) {
    params.delete(key);
  }

  // Add new UTM parameters if they have non-empty trimmed values
  if (utm.source?.trim()) params.set('utm_source', utm.source.trim());
  if (utm.medium?.trim()) params.set('utm_medium', utm.medium.trim());
  if (utm.campaign?.trim()) params.set('utm_campaign', utm.campaign.trim());
  if (utm.term?.trim()) params.set('utm_term', utm.term.trim());
  if (utm.content?.trim()) params.set('utm_content', utm.content.trim());

  parsedUrl.search = params.toString();
  return parsedUrl.toString();
}