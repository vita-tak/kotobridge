export type ContextLevel = 'formal' | 'neutral' | 'casual';

export interface TranslateRequest {
  text: string;
  from: string;
  to: string;
  contextLevel?: ContextLevel;
}

export interface TranslateResult {
  text: string;
  from: string;
  to: string;
}

export interface Provider {
  complete(systemPrompt: string, userMessage: string): Promise<string>;
  transcribe?(audio: Buffer, language?: string): Promise<string>;
}

export type ProviderName = 'anthropic' | 'openai';

export interface KotoBridgeOptions {
  provider?: ProviderName;
  model?: string;
  apiKey?: string;
  defaultFrom?: string;
  defaultTo?: string;
  contextLevel?: ContextLevel;
}

export interface BridgeTranslateInput {
  text: string;
  from?: string;
  to?: string;
  contextLevel?: ContextLevel;
}

export interface BridgeResult extends TranslateResult {
  warnings: string[];
}
