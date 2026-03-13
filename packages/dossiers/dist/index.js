#!/usr/bin/env node
import { Command } from 'commander';
import { buildNatuurBeheerPlanCommand } from './commands/natuurbeheerplan.js';
const program = new Command()
    .name('dossiers')
    .description('Dossiers CLI')
    .version('0.1.0')
    .option('--token <jwt>', 'JWT bearer token (or set DOSSIERS_TOKEN env var)');
program.addCommand(buildNatuurBeheerPlanCommand(() => program.opts().token));
program.parse();
