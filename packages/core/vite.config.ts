import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'RkEditorCore',
            fileName: (format) => `rk-editor-core.${format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: [
                '@tiptap/core',
                '@tiptap/starter-kit',
                '@tiptap/pm',
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
            output: {
                globals: {
                    '@tiptap/core': 'TiptapCore',
                    '@tiptap/starter-kit': 'TiptapStarterKit',
                    '@tiptap/pm': 'TiptapPM',
                },
                exports: 'named',
            },
        },
        sourcemap: false,
    },
});
