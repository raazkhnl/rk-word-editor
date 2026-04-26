import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@raazkhnl/rk-editor-core': resolve(__dirname, '../core/src/index.ts'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'RkEditorUI',
            fileName: (format) => `rk-editor-ui.${format === 'es' ? 'mjs' : 'cjs'}`,
            formats: ['es', 'cjs'],
            cssFileName: 'style',
        },
        rollupOptions: {
            external: [
                '@raazkhnl/rk-editor-core',
                '@tiptap/core',
                '@tiptap/pm',
                '@tiptap/pm/state',
                '@tiptap/pm/view',
            ],
            output: {
                exports: 'named',
                assetFileNames: (assetInfo: any) => {
                    if (assetInfo.name === 'style.css') return 'style.css';
                    return assetInfo.name || 'asset-[hash][extname]';
                },
            },
        },
        sourcemap: true,
        minify: 'esbuild',
        target: 'es2020',
        emptyOutDir: true,
        cssCodeSplit: false,
    },
});
