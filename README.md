# Kotobridge

Culturally aware, tone-adapted translation between English and Japanese, as a small TypeScript SDK with a split-screen demo.

Kotobridge does not translate word for word. It asks the model to express the same intent the way a skilled native speaker would, in a register you choose (`formal`, `neutral`, `casual`), and it checks the result for numbers that went missing.

> **Status:** early (v0.1). Not yet published to npm. AI translation can be wrong, so have important messages reviewed by a human.

## Repository layout

```
sdk/typescript/   The SDK
examples/chat/    Next.js split-screen demo (English | 日本語)
```

## SDK

### Setup from source

```bash
cd sdk/typescript
pnpm install
pnpm run build
```

### Usage

```ts
import { KotoBridge } from 'kotobridge';

const bridge = new KotoBridge({
  provider: 'anthropic', // or 'openai'
  model: 'claude-haiku-4-5-20251001',
  contextLevel: 'formal',
});

const result = await bridge.translate({
  text: 'Are you available for a call on June 5th?',
  from: 'English',
  to: 'Japanese',
});

console.log(result.text); // the translation
console.log(result.warnings); // e.g. numbers missing from the translation
```

### API keys

Keys are never read from the config file. Set them as environment variables (see `.env.example`):

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

You can also pass `apiKey` explicitly in code, but environment variables are preferred.

### Configuration

Create a `kotobridge.config.json` in your project root (or run `npx kotobridge init` once the package is published):

```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "defaultFrom": "English",
  "defaultTo": "Japanese",
  "contextLevel": "formal"
}
```

Priority: values passed in code > config file > environment variables.

### How it works

- The text to translate is passed in a separate user message, wrapped in tags, so it is treated as content and not as instructions.
- The system prompt contains fidelity rules (no added facts, translate every sentence) and, for Japanese, style rules and examples (keigo, softened requests).
- After translating, numbers in the original are compared with the translation. Mismatches become `warnings`. Clock times written differently in two languages (`7pm` and `19時`) and thousands separators (`2,500` and `2500`) are handled.

## Demo

A Next.js app with two panels. Type in either language, and the translation appears on the other side.

```bash
# 1. Build and pack the SDK
cd sdk/typescript
pnpm install
pnpm run build
pnpm pack                       # creates kotobridge-0.1.0.tgz

# 2. Run the demo
cd ../../examples/chat
cp .env.example .env.local      # then add your API key
bun install
bun run dev                     # http://localhost:3000
```

If you rebuild the SDK, clear Bun's cache before reinstalling, since it keeps the same name and version:

```bash
bun pm cache rm && rm -rf node_modules bun.lock && bun install
```

## License

MIT
