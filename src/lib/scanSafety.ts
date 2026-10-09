export function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

export const QR_MAX_BYTES = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
} as const;

export function assessScanSafety(input: {
  value: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  logoSize: number | null;
  contrast: number;
  margin: number;
}): { level: 'ok' | 'warn' | 'risk'; issues: string[] } {
  const issues: string[] = [];
  const maxBytes = QR_MAX_BYTES[input.errorCorrection];
  const bytes = byteLength(input.value);

  if (bytes > maxBytes) {
    issues.push('Забагато даних для цього рівня корекції');
  } else if (bytes > maxBytes * 0.6) {
    issues.push('Щільний код: складно скануватися з відстані');
  }

  if (input.logoSize !== null) {
    const logoArea = input.logoSize * input.logoSize;
    if (logoArea > 0.3) {
      issues.push('Логотип закриває забагато коду');
    } else if (logoArea > 0.2 && input.errorCorrection !== 'H') {
      issues.push('З логотипом краще рівень корекції H');
    }
  }

  if (input.contrast < 3) {
    issues.push('Низький контраст');
  } else if (input.contrast < 4.5) {
    issues.push('Контраст нижче рекомендованого');
  }

  if (input.margin < 4) {
    issues.push('Замалі відступи (quiet zone)');
  }

  let level: 'ok' | 'warn' | 'risk' = 'ok';
  for (const issue of issues) {
    if (issue === 'Забагато даних для цього рівня корекції' ||
        issue === 'Логотип закриває забагато коду' ||
        issue === 'Низький контраст') {
      level = 'risk';
    } else if (level !== 'risk' && (
        issue === 'Щільний код: складно скануватися з відстані' ||
        issue === 'З логотипом краще рівень корекції H' ||
        issue === 'Контраст нижче рекомендованого' ||
        issue === 'Замалі відступи (quiet zone)')) {
      level = 'warn';
    }
  }

  return { level, issues };
}