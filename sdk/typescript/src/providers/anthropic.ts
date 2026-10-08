import Anthropic from '@anthropic-ai/sdk';
import type { Provider } from '../types.js';

export class AnthropicProvider implements Provider {
  private client: Anthropic;

  constructor(
    apiKey?: string,
    private model = 'claude-sonnet-5-5',
  ) {
    this.client = new Anthropic({
      apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
  }

  async complete(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    return response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');
  }
}
