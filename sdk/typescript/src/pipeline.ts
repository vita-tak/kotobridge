import type {
  BridgeResult,
  BridgeTranslateInput,
  KotoBridgeOptions,
  Provider,
} from './types.js';
import { loadConfigFile } from './config.js';
import { translate } from './ai-service/translation.js';
import { checkNumbers } from './ai-service/verification.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { OpenAIProvider } from './providers/openai.js';

function definedOnly<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function createProvider(options: KotoBridgeOptions): Provider {
  switch (options.provider) {
    case 'anthropic':
      return new AnthropicProvider(options.apiKey, options.model);
    case 'openai':
      return new OpenAIProvider(options.apiKey, options.model);
    default:
      throw new Error(
        `Unknown or missing provider "${options.provider}". Set "provider" to "anthropic" or "openai" in kotobridge.config.json or in code.`,
      );
  }
}

export class KotoBridge {
  private provider: Provider;
  private options: KotoBridgeOptions;

  constructor(options: KotoBridgeOptions = {}) {
    // Prioritet: kod vinner över config-filen
    this.options = { ...loadConfigFile(), ...definedOnly(options) };
    this.provider = createProvider(this.options);
  }

  async translate(input: BridgeTranslateInput): Promise<BridgeResult> {
    const from = input.from ?? this.options.defaultFrom;
    const to = input.to ?? this.options.defaultTo;
    if (!from || !to) {
      throw new Error(
        'Missing language. Pass "from" and "to", or set "defaultFrom" and "defaultTo" in kotobridge.config.json.',
      );
    }

    const result = await translate(this.provider, {
      text: input.text,
      from,
      to,
      contextLevel: input.contextLevel ?? this.options.contextLevel,
    });

    const check = checkNumbers(input.text, result.text);
    return { ...result, warnings: check.issues };
  }
}
