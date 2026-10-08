import OpenAI from 'openai';
import type { Provider } from '../types.js';

export class OpenAIProvider implements Provider {
  private client: OpenAI;

  constructor(
    apiKey?: string,
    private model = 'gpt-4o',
  ) {
    this.client = new OpenAI({ apiKey: apiKey ?? process.env.OPENAI_API_KEY });
  }

  async complete(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    return response.choices[0]?.message.content ?? '';
  }
}
