import { KotoBridge } from 'kotobridge';

const bridge = new KotoBridge({
  provider: 'anthropic',
  model: 'claude-haiku-4-5-20251001',
  contextLevel: 'formal',
});

const LANGUAGES = ['English', 'Japanese'];
const MAX_LENGTH = 1000;

export async function POST(request: Request) {
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
