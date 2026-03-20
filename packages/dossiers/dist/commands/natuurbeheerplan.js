import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { listPlannen, getPlan, getDossierByNummer, getDossierById, getStatusHistory, getPossibleActions, getNotities, getMe, } from '../services/natuurbeheerplan.js';
function resolveToken(token) {
    const t = token ?? process.env['DOSSIERS_TOKEN'];
    if (!t) {
        console.error(chalk.red('Error: no token provided. Use --token <jwt> or set DOSSIERS_TOKEN env var.'));
        process.exit(1);
    }
    return t;
}
function print(data, format) {
    if (format === 'json') {
        console.log(JSON.stringify(data, null, 2));
        return;
    }
    // table: pretty-print top-level keys for objects, or iterate arrays
    if (Array.isArray(data)) {
        if (data.length === 0) {
            console.log(chalk.yellow('No results.'));
            return;
        }
        for (const item of data) {
            console.log(chalk.gray('─'.repeat(60)));
            printObject(item);
        }
        console.log(chalk.gray('─'.repeat(60)));
    }
    else {
        printObject(data);
    }
}
function printObject(obj, indent = '') {
    for (const [key, val] of Object.entries(obj)) {
        if (val === null || val === undefined)
            continue;
        if (typeof val === 'object' && !Array.isArray(val)) {
            console.log(`${indent}${chalk.bold(key)}:`);
            printObject(val, indent + '  ');
        }
        else if (Array.isArray(val)) {
            console.log(`${indent}${chalk.bold(key)}: ${chalk.gray(`[${val.length} items]`)}`);
        }
        else {
            console.log(`${indent}${chalk.bold(key)}: ${val}`);
        }
    }
}
export function buildNatuurBeheerPlanCommand(getToken) {
    const cmd = new Command('natuurbeheerplan')
        .alias('nbp')
        .description('Natuurbeheerplan backoffice commands');
    const fmt = ['-f, --format <format>', 'Output format: table|json', 'table'];
    // --- me ---
    cmd
        .command('me')
        .description('Show current authenticated user')
        .option(...fmt)
        .action(async (opts) => {
        const token = resolveToken(getToken());
        const spinner = ora('Fetching user info...').start();
        try {
            const data = await getMe(token);
            spinner.stop();
            print(data, opts.format);
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- list ---
    cmd
        .command('list')
        .description('List all natuurbeheerplannen')
        .option(...fmt)
        .action(async (opts) => {
        const token = resolveToken(getToken());
        const spinner = ora('Fetching plannen...').start();
        try {
            const data = await listPlannen(token);
            spinner.stop();
            print(data, opts.format);
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- get ---
    cmd
        .command('get <id>')
        .description('Get a natuurbeheerplan by UUID')
        .option(...fmt)
        .action(async (id, opts) => {
        const token = resolveToken(getToken());
        const spinner = ora(`Fetching plan ${id}...`).start();
        try {
            const data = await getPlan(id, token);
            spinner.stop();
            print(data, opts.format);
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- dossier ---
    const dossier = cmd
        .command('dossier')
        .description('Dossier lookup commands');
    dossier
        .command('nummer <nummer>')
        .description('Get dossier by dossier number')
        .option(...fmt)
        .action(async (nummer, opts) => {
        const token = resolveToken(getToken());
        const spinner = ora(`Fetching dossier ${nummer}...`).start();
        try {
            const data = await getDossierByNummer(nummer, token);
            spinner.stop();
            print(data, opts.format);
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    dossier
        .command('id <id>')
        .description('Get dossier by numeric ID')
        .option(...fmt)
        .action(async (id, opts) => {
        const dossierId = parseInt(id, 10);
        if (isNaN(dossierId)) {
            console.error(chalk.red('Error: id must be a number'));
            process.exit(1);
        }
        const token = resolveToken(getToken());
        const spinner = ora(`Fetching dossier ${dossierId}...`).start();
        try {
            const data = await getDossierById(dossierId, token);
            spinner.stop();
            print(data, opts.format);
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- status ---
    const status = cmd
        .command('status')
        .description('Status commands');
    status
        .command('history <planId>')
        .description('Get status history for a plan')
        .option(...fmt)
        .action(async (planId, opts) => {
        const token = resolveToken(getToken());
        const spinner = ora('Fetching status history...').start();
        try {
            const data = await getStatusHistory(planId, token);
            spinner.stop();
            print(data, opts.format);
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    status
        .command('actions <planId>')
        .description('Get possible status actions for a plan')
        .option(...fmt)
        .action(async (planId, opts) => {
        const token = resolveToken(getToken());
        const spinner = ora('Fetching possible actions...').start();
        try {
            const data = await getPossibleActions(planId, token);
            spinner.stop();
            print(data, opts.format);
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- notitie ---
    cmd
        .command('notities <referentieId>')
        .description('List notities for a referentie ID')
        .option(...fmt)
        .action(async (referentieId, opts) => {
        const token = resolveToken(getToken());
        const spinner = ora('Fetching notities...').start();
        try {
            const data = await getNotities(referentieId, token);
            spinner.stop();
            print(data, opts.format);
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    return cmd;
}
