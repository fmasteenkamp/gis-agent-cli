#!/usr/bin/env node
import { Command } from 'commander';
import { buildOverlapCommand } from './commands/overlap.js';
import { buildMapServerCommand } from './commands/mapserver.js';
import { buildPrintCommand } from './commands/print.js';

const program = new Command()
  .name('anb-gis')
  .description('ANB GIS CLI — Agentschap Natuur en Bos')
  .version('0.1.0');

program.addCommand(buildOverlapCommand());
program.addCommand(buildMapServerCommand());
program.addCommand(buildPrintCommand());

program.parse();
