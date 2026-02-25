const { resolve } = require('path');

module.exports = {
    resolve: {
        alias: {
            // Use source files so Vite handles all TypeScript compilation directly
            '@rk-editor/core': resolve(__dirname, '../../packages/core/src/index.ts'),
            '@rk-editor/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
            '@rk-editor/styles': resolve(__dirname, '../../packages/ui/src/styles.css'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        commonjsOptions: {
            include: [/node_modules/],
        },
    },
    server: {
        port: 3000,
    },
    optimizeDeps: {
        exclude: ['@tiptap/pm'],
        include: [
            '@tiptap/core',
            '@tiptap/starter-kit',
            '@tiptap/extension-color',
            '@tiptap/extension-font-family',
            '@tiptap/extension-highlight',
            '@tiptap/extension-image',
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
        ],
    },
};
