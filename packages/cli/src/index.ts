#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';

const program = new Command();

program
    .name('rk-editor')
    .description('CLI for RK Word Editor scaffolding')
    .version('3.5.0');

program
    .command('init [dir]')
    .description('Initialize a new RK Word Editor project')
    .action(async (dir) => {
        const targetDir = dir || '.';
        console.log(chalk.blue(`Initializing RK Word Editor in ${targetDir}...`));

        const response = await prompts({
            type: 'text',
            name: 'projectName',
            message: 'What is your project name?',
            initial: 'my-rk-editor-app'
        });

        if (!response.projectName) return;

        try {
            await fs.ensureDir(targetDir);

            const pkgJson = {
                name: response.projectName,
                version: '0.1.0',
                private: true,
                dependencies: {
                    "@raazkhnl/rk-editor-core": "^3.5.0",
                    "@raazkhnl/rk-editor-ui": "^3.5.0",
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0"
                }
            };

            await fs.writeJSON(path.join(targetDir, 'package.json'), pkgJson, { spaces: 2 });

            console.log(chalk.green('✓ Project initialized successfully!'));
            console.log(chalk.yellow('Next steps:'));
            console.log(`  cd ${targetDir}`);
            console.log('  npm install');
        } catch (err: any) {
            console.error(chalk.red(`Error: ${err.message}`));
        }
    });

program.parse();
