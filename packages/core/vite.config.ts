import { defineConfig } from 'vite';
import { resolve } from 'path';

const tiptapExternals = [
    '@tiptap/core',
    '@tiptap/starter-kit',
    '@tiptap/pm',
    '@tiptap/pm/state',
    '@tiptap/pm/view',
    '@tiptap/pm/model',
    '@tiptap/pm/commands',
    '@tiptap/pm/keymap',
    '@tiptap/pm/inputrules',
    '@tiptap/pm/transform',
    '@tiptap/extension-color',
    '@tiptap/extension-font-family',
    '@tiptap/extension-highlight',
    '@tiptap/extension-image',
    '@tiptap/extension-placeholder',
    '@tiptap/extension-subscript',
    '@tiptap/extension-superscript',
    '@tiptap/extension-table',
    '@tiptap/extension-table-cell',
    '@tiptap/extension-table-header',
    '@tiptap/extension-table-row',
    '@tiptap/extension-task-item',
    '@tiptap/extension-task-list',
    '@tiptap/extension-text-align',
    '@tiptap/extension-text-style',
    '@tiptap/extension-underline',
];

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'RkEditorCore',
            fileName: (format) => `rk-editor-core.${format === 'es' ? 'mjs' : 'cjs'}`,
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: [
                ...tiptapExternals,
                'docx',
                'file-saver',
                'mammoth',
                'marked',
                'turndown',
                'turndown-plugin-gfm',
            ],
            output: {
                exports: 'named',
            },
        },
        sourcemap: true,
        minify: 'esbuild',
        target: 'es2020',
        emptyOutDir: true,
    },
});
