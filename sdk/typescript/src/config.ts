import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { KotoBridgeOptions } from './types.js';

const CONFIG_FILE = 'kotobridge.config.json';

export function loadConfigFile(dir: string = process.cwd()): KotoBridgeOptions {
  const path = join(dir, CONFIG_FILE);
  if (!existsSync(path)) return {};

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    throw new Error(
      `Could not parse ${CONFIG_FILE}. Check that it is valid JSON.`,
    );
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(`${CONFIG_FILE} must contain a JSON object.`);
  }

  const { apiKey, ...rest } = raw as Record<string, unknown>;
  if (apiKey !== undefined) {
    console.warn(
      `[kotobridge] Ignoring "apiKey" in ${CONFIG_FILE}. Keep API keys in .env instead.`,
    );
  }

  return rest as KotoBridgeOptions;
}
