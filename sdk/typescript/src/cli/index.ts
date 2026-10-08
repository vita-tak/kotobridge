#!/usr/bin/env node
import { init } from './init.js';

const command = process.argv[2];

if (command === 'init') {
  init();
} else {
  console.log('Usage: kotobridge init');
  process.exit(command ? 1 : 0);
}
