import { KotoBridge } from 'kotobridge';

const bridge = new KotoBridge({
  provider: 'anthropic',
  model: 'claude-haiku-4-5-20251001',
  contextLevel: 'formal',
});

const LANGUAGES = ['English', 'Japanese'];
const MAX_LENGTH = 1000;

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 },
    );
  }

  const { text, from, to } = await request.json();

  if (typeof text !== 'string' || !text.trim() || text.length > MAX_LENGTH) {
    return Response.json({ error: 'Invalid text' }, { status: 400 });
  }
  if (!LANGUAGES.includes(from) || !LANGUAGES.includes(to) || from === to) {
    return Response.json({ error: 'Invalid language' }, { status: 400 });
  }

  try {
    const result = await bridge.translate({ text, from, to });
    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Translation failed' }, { status: 500 });
  }
}
