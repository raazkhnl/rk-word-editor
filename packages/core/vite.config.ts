import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'RkEditorCore',
            fileName: (format) => `rk-editor-core.${format}.js`,
            formats: ['es'],
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
                    '@tiptap/extension-color': 'TiptapExtensionColor',
                    '@tiptap/extension-font-family': 'TiptapExtensionFontFamily',
                    '@tiptap/extension-highlight': 'TiptapExtensionHighlight',
                    '@tiptap/extension-image': 'TiptapExtensionImage',
                    '@tiptap/extension-subscript': 'TiptapExtensionSubscript',
                    '@tiptap/extension-superscript': 'TiptapExtensionSuperscript',
                    '@tiptap/extension-table': 'TiptapExtensionTable',
                    '@tiptap/extension-table-cell': 'TiptapExtensionTableCell',
                    '@tiptap/extension-table-header': 'TiptapExtensionTableHeader',
                    '@tiptap/extension-table-row': 'TiptapExtensionTableRow',
                    '@tiptap/extension-task-item': 'TiptapExtensionTaskItem',
                    '@tiptap/extension-task-list': 'TiptapExtensionTaskList',
                    '@tiptap/extension-text-align': 'TiptapExtensionTextAlign',
                    '@tiptap/extension-text-style': 'TiptapExtensionTextStyle',
                    '@tiptap/extension-underline': 'TiptapExtensionUnderline',
                },
                exports: 'named',
            },
        },
        sourcemap: false,
    },
});
