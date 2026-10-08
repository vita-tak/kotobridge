import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_FILE = 'kotobridge.config.json';

const TEMPLATE = {
  provider: 'anthropic',
  model: 'claude-haiku-4-5-20251001',
  defaultFrom: 'English',
  defaultTo: 'Japanese',
  contextLevel: 'formal',
};

export function init(): void {
  const path = join(process.cwd(), CONFIG_FILE);

  if (existsSync(path)) {
    console.log(`${CONFIG_FILE} already exists. Nothing changed.`);
    return;
  }

  writeFileSync(path, JSON.stringify(TEMPLATE, null, 2) + '\n');
  console.log(`Created ${CONFIG_FILE}`);
  console.log(
    'Next: add your API key to .env (ANTHROPIC_API_KEY or OPENAI_API_KEY).',
  );
  console.log('Never put API keys in the config file.');
}
