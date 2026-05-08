#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';

const CLI_VERSION = '4.6.0';
const EDITOR_VERSION = '^4.6.0';

const program = new Command();

program
    .name('rk-editor')
    .description('CLI scaffolder for RK Word Editor — bootstrap a Vanilla JS, React, Vue, or Svelte starter project.')
    .version(CLI_VERSION);

type Template = 'vanilla' | 'react' | 'vue' | 'svelte';

program
    .command('init [dir]')
    .description('Initialize a new RK Word Editor project')
    .option('-t, --template <name>', 'Template to use (vanilla, react, vue, svelte)')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (dir, opts) => {
        const targetDir = path.resolve(dir || '.');

        console.log(chalk.cyan('\n╭─────────────────────────────────────────╮'));
        console.log(chalk.cyan('│  RK Word Editor — project scaffolder    │'));
        console.log(chalk.cyan('╰─────────────────────────────────────────╯\n'));

        let answers: { projectName: string; template: Template } = {
            projectName: path.basename(targetDir) || 'my-rk-editor-app',
            template: (opts.template as Template) || 'vanilla',
        };

        if (!opts.yes) {
            const response = await prompts([
                {
                    type: 'text',
                    name: 'projectName',
                    message: 'Project name?',
                    initial: answers.projectName,
                },
                {
                    type: opts.template ? null : 'select',
                    name: 'template',
                    message: 'Pick a template',
                    choices: [
                        { title: 'Vanilla JS / TS', value: 'vanilla' },
                        { title: 'React (Vite)', value: 'react' },
                        { title: 'Vue 3 (Vite)', value: 'vue' },
                        { title: 'Svelte (Vite)', value: 'svelte' },
                    ],
                    initial: 0,
                },
            ]);
            if (!response.projectName) {
                console.log(chalk.yellow('Cancelled.'));
                return;
            }
            answers = { ...answers, ...response };
        }

        try {
            await fs.ensureDir(targetDir);
            await scaffold(targetDir, answers.projectName, answers.template);

            console.log(chalk.green('\n✓ Project ready!'));
            console.log(chalk.bold('\nNext steps:'));
            if (path.resolve(targetDir) !== process.cwd()) {
                console.log(chalk.gray(`  cd ${path.relative(process.cwd(), targetDir) || targetDir}`));
            }
            console.log(chalk.gray('  npm install'));
            console.log(chalk.gray('  npm run dev'));
            console.log(chalk.gray('\nDocs: https://github.com/raazkhnl/rk-word-editor'));
        } catch (err: any) {
            console.error(chalk.red(`Error: ${err.message}`));
            process.exit(1);
        }
    });

async function scaffold(targetDir: string, projectName: string, template: Template) {
    const pkg: any = {
        name: projectName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
        },
        dependencies: {
            '@raazkhnl/rk-editor-core': EDITOR_VERSION,
            '@raazkhnl/rk-editor-ui': EDITOR_VERSION,
        },
        devDependencies: {
            vite: '^5.4.0',
            typescript: '^5.3.0',
        },
    };

    if (template === 'react') {
        pkg.dependencies.react = '^18.2.0';
        pkg.dependencies['react-dom'] = '^18.2.0';
        pkg.devDependencies['@types/react'] = '^18.2.0';
        pkg.devDependencies['@types/react-dom'] = '^18.2.0';
        pkg.devDependencies['@vitejs/plugin-react'] = '^4.3.0';
    } else if (template === 'vue') {
        pkg.dependencies.vue = '^3.4.0';
        pkg.devDependencies['@vitejs/plugin-vue'] = '^5.0.0';
    } else if (template === 'svelte') {
        pkg.dependencies.svelte = '^4.2.0';
        pkg.devDependencies['@sveltejs/vite-plugin-svelte'] = '^3.0.0';
    }

    await fs.writeJSON(path.join(targetDir, 'package.json'), pkg, { spaces: 2 });
    await fs.writeFile(path.join(targetDir, 'index.html'), buildIndexHtml(template, projectName));
    await fs.ensureDir(path.join(targetDir, 'src'));
    await fs.writeFile(path.join(targetDir, 'src', mainFilename(template)), buildMainFile(template));
    await fs.writeFile(path.join(targetDir, 'vite.config.ts'), buildViteConfig(template));
    await fs.writeFile(path.join(targetDir, 'tsconfig.json'), JSON.stringify({
        compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'bundler',
            strict: true,
            jsx: template === 'react' ? 'react-jsx' : undefined,
            esModuleInterop: true,
            skipLibCheck: true,
            isolatedModules: true,
        },
        include: ['src'],
    }, null, 2));
    await fs.writeFile(path.join(targetDir, '.gitignore'), 'node_modules\ndist\n.env\n');
    await fs.writeFile(path.join(targetDir, 'README.md'), `# ${projectName}\n\nGenerated with @raazkhnl/rk-editor-cli (${template} template).\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`);
}

function mainFilename(t: Template): string {
    if (t === 'react') return 'main.tsx';
    if (t === 'vue') return 'main.ts';
    if (t === 'svelte') return 'main.ts';
    return 'main.ts';
}

function buildIndexHtml(template: Template, name: string): string {
    const entry = template === 'react' ? '/src/main.tsx' : '/src/main.ts';
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${name}</title>
    <style>html, body, #app { height: 100%; margin: 0; }</style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="${entry}"></script>
  </body>
</html>
`;
}

function buildMainFile(template: Template): string {
    if (template === 'react') {
        return `import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorShell } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

function App() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const shell = new EditorShell({
      container: ref.current,
      initialContent: '<h1>Hello, world!</h1><p>Start typing…</p>',
      outline: true,
    });
    return () => shell.destroy();
  }, []);
  return <div ref={ref} style={{ height: '100vh' }} />;
}

createRoot(document.getElementById('app')!).render(<App />);
`;
    }
    return `import { EditorShell } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

new EditorShell({
  container: document.getElementById('app')!,
  initialContent: '<h1>Hello, world!</h1><p>Start typing…</p>',
  outline: true,
});
`;
}

function buildViteConfig(template: Template): string {
    if (template === 'react') {
        return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
});
`;
    }
    if (template === 'vue') {
        return `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: { port: 3000 },
});
`;
    }
    if (template === 'svelte') {
        return `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: { port: 3000 },
});
`;
    }
    return `import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 3000 },
});
`;
}

program.parse();
