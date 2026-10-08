import type { Provider, TranslateRequest, TranslateResult } from '../types.js';
import { buildSystemPrompt } from './cultural-context.js';

export async function translate(
  provider: Provider,
  request: TranslateRequest,
): Promise<TranslateResult> {
  const level = request.contextLevel ?? 'formal';
  const systemPrompt = buildSystemPrompt(request.from, request.to, level);

  const safeText = request.text.replace(/<\/?message>/gi, '');
  const text = await provider.complete(
    systemPrompt,
    `<message>\n${safeText}\n</message>`,
  );

  return { text: text.trim(), from: request.from, to: request.to };
}
