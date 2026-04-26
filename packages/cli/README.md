# @raazkhnl/rk-editor-cli

> Project scaffolder for [**RK Word Editor**](https://github.com/raazkhnl/rk-word-editor) — `npx @raazkhnl/rk-editor-cli init` to bootstrap a free, open-source MS-Word / Google-Docs-style rich-text editor in a fresh project.

[![npm](https://img.shields.io/npm/v/%40raazkhnl%2Frk-editor-cli?label=npm)](https://www.npmjs.com/package/@raazkhnl/rk-editor-cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/raazkhnl/rk-word-editor/blob/main/LICENSE)

## Quick start

```bash
# One-off (recommended)
npx @raazkhnl/rk-editor-cli init my-editor

# Or install globally
npm install -g @raazkhnl/rk-editor-cli
rk-editor init my-editor
```

Then:

```bash
cd my-editor
npm install
npm run dev
```

## What it generates

A minimal Vite + TypeScript project that depends on:

- [`@raazkhnl/rk-editor-core`](https://www.npmjs.com/package/@raazkhnl/rk-editor-core) — the engine
- [`@raazkhnl/rk-editor-ui`](https://www.npmjs.com/package/@raazkhnl/rk-editor-ui) — the toolbar / menubar / dialogs

…wired up via the one-line `EditorShell` so you get a fully-featured Word-style editor out of the box: DOCX export, PDF print, find &amp; replace, page layout, dark mode, document outline, and more.

## Documentation

[Full docs on GitHub →](https://github.com/raazkhnl/rk-word-editor#readme)

## License

MIT © [RaaZ Khanal](https://github.com/raazkhnl)
