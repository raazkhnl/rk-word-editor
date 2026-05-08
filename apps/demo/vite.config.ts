import { defineConfig } from 'vite';
import { resolve } from 'path';

// When deploying to https://<user>.github.io/rk-word-editor/, the base path
// must match the repository name so the bundled assets resolve correctly.
// In any other context (Vercel, custom domain, local dev), default to '/'.
const base = process.env.RK_DEMO_BASE
    || (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/').pop()}/` : '/');

export default defineConfig({
    base,
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
        chunkSizeWarningLimit: 900,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Keep the heavy DOCX exporter (jszip+docx) and DOCX importer
                    // (mammoth) in their own chunks so the initial editor surface
                    // paints fast — they're only fetched when the user actually
                    // exports/imports.
                    'rk-docx': ['docx', 'file-saver'],
                    'rk-docx-import': ['mammoth'],
                },
            },
        },
    },
    server: {
        port: 3000,
        open: process.env.CI ? false : true,
    },
});
