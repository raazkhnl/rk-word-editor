import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'RkEditorUI',
            fileName: (format) => `rk-editor-ui.${format === 'es' ? 'mjs' : 'cjs'}`,
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: ['@rk-editor/core', '@tiptap/core'],
            output: {
                globals: {
                    '@rk-editor/core': 'RkEditorCore',
                    '@tiptap/core': 'TiptapCore',
                },
                exports: 'named',
            },
        },
        sourcemap: false,
    },
});
