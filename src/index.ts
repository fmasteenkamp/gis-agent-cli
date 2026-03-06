#!/usr/bin/env node
import { Command } from 'commander';
import { buildAddressCommand } from './commands/capakey/search.js';
import { buildCaPaKeyCommand } from './commands/capakey/lookup.js';
import { buildBufferCommand } from './commands/buffer.js';
import { buildConvertCommand } from './commands/convert.js';

const program = new Command()
  .name('gis-tools')
  .description('Flemish GIS utilities CLI — Geopunt / CaPaKey')
  .version('0.1.0');

program.addCommand(buildAddressCommand());
program.addCommand(buildCaPaKeyCommand());
program.addCommand(buildBufferCommand());
program.addCommand(buildConvertCommand());

program.parse();
