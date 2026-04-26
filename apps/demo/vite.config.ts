import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: [
            { find: '@raazkhnl/rk-editor-ui/styles.css', replacement: resolve(__dirname, '../../packages/ui/src/styles.css') },
            { find: /^@raazkhnl\/rk-editor-ui$/, replacement: resolve(__dirname, '../../packages/ui/src/index.ts') },
            { find: /^@raazkhnl\/rk-editor-core$/, replacement: resolve(__dirname, '../../packages/core/src/index.ts') },
        ],
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2020',
        sourcemap: true,
    },
    server: {
        port: 3000,
        open: true,
    },
});
