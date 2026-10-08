export interface NumberCheck {
  ok: boolean;
  issues: string[];
}

// Fullwidth digits (０-９) → ASCII, so 午後７時 is read as 7.
function toAsciiDigits(text: string): string {
  return text.replace(/[０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0),
  );
}

// "2,500" and "2500" are the same number. A comma followed by exactly three
// digits is a thousands separator; "2,5" (decimal comma) is left untouched.
function stripThousandsSeparators(text: string): string {
  return text.replace(/(?<=\d),(?=\d{3}(?!\d))/g, '');
}

function extractNumbers(text: string): string[] {
  return (
    stripThousandsSeparators(toAsciiDigits(text)).match(/\d+(?:[.,]\d+)*/g) ??
    []
  );
}

// "7pm" may legitimately become 19時, "12am" may become 0時 or 24時.
// Maps a number from the source to other numbers that are also acceptable.
function acceptedAlternatives(source: string): Map<string, string[]> {
  const alternatives = new Map<string, string[]>();
  const clock = /(\d{1,2})(?::\d{2})?\s*([ap])\.?m\.?(?![a-z])/gi;

  for (const match of toAsciiDigits(source).matchAll(clock)) {
    const hour = Number(match[1]);
    const isPm = match[2].toLowerCase() === 'p';
    const extra: string[] = [];

    if (isPm && hour < 12) extra.push(String(hour + 12));
    if (!isPm && hour === 12) extra.push('0', '24');

    if (extra.length > 0) {
      alternatives.set(match[1], [
        ...(alternatives.get(match[1]) ?? []),
        ...extra,
      ]);
    }
  }

  return alternatives;
}

export function checkNumbers(source: string, translation: string): NumberCheck {
  const inTranslation = new Set(extractNumbers(translation));
  const alternatives = acceptedAlternatives(source);
  const issues: string[] = [];

  for (const n of new Set(extractNumbers(source))) {
    const accepted = [n, ...(alternatives.get(n) ?? [])];
    if (!accepted.some((candidate) => inTranslation.has(candidate))) {
      issues.push(
        `Number "${n}" appears in the original but not in the translation`,
      );
    }
  }

  return { ok: issues.length === 0, issues };
}
