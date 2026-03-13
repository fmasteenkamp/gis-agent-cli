#!/usr/bin/env node
import { Command } from 'commander';
import { buildOverlapCommand } from './commands/overlap.js';

const program = new Command()
  .name('anb-gis')
  .description('ANB GIS CLI — Agentschap Natuur en Bos')
  .version('0.1.0');

program.addCommand(buildOverlapCommand());

program.parse();
