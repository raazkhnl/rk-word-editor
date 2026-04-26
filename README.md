# RK Word Editor — Free Open-Source Word Editor for the Web

> **A modern, drop-in, fully open-source Microsoft Word / Google Docs alternative for the web.** Build rich-text editing into any web app — Vanilla JS, React, Vue, Svelte, Angular, Next.js or as a `<rk-word-editor>` Web Component — with first-class **DOCX export, true PDF/print, page layout, find &amp; replace, track changes, draggable text boxes, image resize, dark mode** and a polished Word-style UI. MIT-licensed. No paywall. No telemetry.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm: core](https://img.shields.io/npm/v/%40raazkhnl%2Frk-editor-core?label=core)](https://www.npmjs.com/package/@raazkhnl/rk-editor-core)
[![npm: ui](https://img.shields.io/npm/v/%40raazkhnl%2Frk-editor-ui?label=ui)](https://www.npmjs.com/package/@raazkhnl/rk-editor-ui)
[![npm downloads](https://img.shields.io/npm/dm/%40raazkhnl%2Frk-editor-core?label=downloads)](https://www.npmjs.com/package/@raazkhnl/rk-editor-core)
[![Made with TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Built on Tiptap](https://img.shields.io/badge/built%20on-Tiptap-78cfb1)](https://tiptap.dev)

RK Word Editor is the rich-text editor we wished existed when we needed something between *"a textarea"* and *"Microsoft Word in the browser"*: a **fast, accessible, drop-in WYSIWYG editor** with everything that paid editors charge for — under MIT.

**Search terms / aliases**: free word editor for the web, Microsoft Word alternative, Google Docs clone, MIT-licensed rich-text editor, Tiptap UI, ProseMirror toolbar, DOCX export JavaScript, PDF export web editor, rich text editor React/Vue/Svelte, Word editor open source.

---

## Table of contents

- [Highlights](#highlights)
- [Live demo](#live-demo)
- [Packages](#packages)
- [Quick start](#quick-start)
  - [Plain HTML / vanilla JS](#plain-html--vanilla-js)
  - [Vite / TypeScript](#vite--typescript)
  - [As a Web Component](#as-a-web-component)
  - [React](#react)
  - [Vue 3](#vue-3)
  - [Next.js](#nextjs)
- [Headless usage (`@raazkhnl/rk-editor-core`)](#headless-usage-raazkhnlrk-editor-core)
- [API reference](#api-reference)
  - [`WordEditor` options](#wordeditor-options)
  - [Exports & imports](#exports--imports)
  - [Page layout](#page-layout)
  - [Find &amp; replace](#find--replace)
  - [Track changes](#track-changes)
  - [Auto-save](#auto-save)
- [Recipes](#recipes)
- [Theming &amp; customisation](#theming--customisation)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Highlights

> **v4.0.2** — adds **draggable text boxes**, fixes outline scroll, table column resize, sub/sup icons, placeholder showing on every line, deprecated `baseUrl` + missing CSS module declaration. See [CHANGELOG](CHANGELOG.md).

- **DOCX export** with embedded images, hyperlinks, tables, lists (incl. Nepali numbering), task lists, headings, blockquotes, code blocks, citations and footnotes.
- **True PDF / print** rendered in an isolated iframe — only the document prints, with proper A4 / Letter / Legal page sizes, margins and pagination.
- **Page layout dialog** — A3, A4, A5, Letter, Legal, Tabloid; portrait/landscape; per-side margins.
- **DOCX / Markdown / HTML / JSON / TXT import**.
- **Find &amp; replace** with regex, whole-word and case-sensitive options.
- **Document outline** sidebar; **read-only mode**; **dark mode**; **status bar** with zoom, page count and reading time.
- **Draggable, resizable text boxes** for callouts, sidebars, pull quotes — Word-style floating frames with content inside.
- **Slash commands** (`/heading`, `/table`, `/image`, …), **format painter**, **track changes**, **drag-and-drop image upload**, **interactive image resize handles**.
- **Headless core** for building your own UI, plus a polished default UI shell with a unified SVG icon set.
- **Vanilla, React, Vue, Web Component** — works anywhere; no React requirement.
- ESM + CJS dual build. Tiny CSS, zero global pollution. Fully typed.

## Live demo

Run the included demo locally:

```bash
git clone https://github.com/raazkhnl/rk-word-editor.git
cd rk-word-editor
npm install
npm run dev
```

Then open `http://localhost:3000`.

A hosted demo is available at https://rk-word-editor.vercel.app *(WIP)*.

## Packages

| Package | What it is | Install |
| --- | --- | --- |
| [`@raazkhnl/rk-editor-core`](packages/core) | Headless engine: Tiptap extensions, DOCX/Markdown/HTML/JSON exporters, print engine, page layout, find &amp; replace. | `npm i @raazkhnl/rk-editor-core` |
| [`@raazkhnl/rk-editor-ui`](packages/ui) | Default UI: menubar, toolbar, modals, find bar, status bar, document outline, dark mode. | `npm i @raazkhnl/rk-editor-ui` |
| [`@raazkhnl/rk-editor-cli`](packages/cli) | `rk-editor init` scaffolder. | `npm i -g @raazkhnl/rk-editor-cli` |

The UI package depends on the core package as a peer dependency.

## Quick start

### Plain HTML / vanilla JS

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/@raazkhnl/rk-editor-ui/dist/style.css" />
    <style>html, body, #app { height: 100%; margin: 0; }</style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      import { EditorShell } from 'https://unpkg.com/@raazkhnl/rk-editor-ui';
      new EditorShell({
        container: document.getElementById('app'),
        initialContent: '<h1>Hello, world!</h1><p>Start typing…</p>',
        outline: true,
      });
    </script>
  </body>
</html>
```

### Vite / TypeScript

```bash
npm install @raazkhnl/rk-editor-core @raazkhnl/rk-editor-ui
```

```ts
import { EditorShell } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

const shell = new EditorShell({
  container: document.getElementById('app')!,
  initialContent: '<p>Hello!</p>',
  placeholder: 'Start typing…',
  theme: 'light',
  outline: true,
  onUpdate: (json) => console.log('content updated', json),
});

// shell.editor — the WordEditor instance
// shell.toolbar — the WordToolbar instance
```

### As a Web Component

```html
<script type="module" src="https://unpkg.com/@raazkhnl/rk-editor-ui"></script>
<link rel="stylesheet" href="https://unpkg.com/@raazkhnl/rk-editor-ui/dist/style.css" />

<rk-word-editor placeholder="Type here…" theme="light" outline></rk-word-editor>
```

Attributes:

| Attribute | Default | Notes |
| --- | --- | --- |
| `placeholder` | – | Placeholder text |
| `theme` | `light` | `light` &#124; `dark` &#124; `auto` |
| `readonly` | – | Present → read-only |
| `outline` | – | Present → show document outline |
| `menubar` / `toolbar` / `statusbar` | `true` | Set to `"false"` to hide |

### React

The editor itself is framework-agnostic; in React, mount it in a ref:

```tsx
import { useEffect, useRef } from 'react';
import { EditorShell } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

export default function MyEditor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const shell = new EditorShell({
      container: ref.current,
      initialContent: '<p>Hello, React!</p>',
      onUpdate: (json) => console.log(json),
    });
    return () => shell.destroy();
  }, []);

  return <div ref={ref} style={{ height: '100vh' }} />;
}
```

### Vue 3

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { EditorShell } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

const root = ref<HTMLDivElement | null>(null);
let shell: EditorShell | null = null;

onMounted(() => {
  if (root.value) {
    shell = new EditorShell({ container: root.value, initialContent: '<p>Hi from Vue</p>' });
  }
});

onBeforeUnmount(() => shell?.destroy());
</script>

<template>
  <div ref="root" style="height: 100vh" />
</template>
```

### Next.js

The editor uses browser APIs. Render on the client only:

```tsx
'use client';
import dynamic from 'next/dynamic';

export default dynamic(() => import('./MyEditor'), { ssr: false });
```

## Headless usage (`@raazkhnl/rk-editor-core`)

If you don't need the bundled toolbar, use just the core. You get the `WordEditor` class plus all extensions, the export engines, find &amp; replace, page layout — but build your own UI.

```ts
import { WordEditor } from '@raazkhnl/rk-editor-core';

const editor = new WordEditor({
  element: document.getElementById('editor')!,
  initialContent: '<p>Headless</p>',
});

editor.format.bold();
editor.format.heading(1);
await editor.exportDocx();
editor.printPdf();
```

## API reference

### `WordEditor` options

```ts
new WordEditor({
  element,                 // HTMLElement to mount the editor into
  initialContent,          // string (HTML) or JSON object
  placeholder,             // string
  editable,                // default true; set false for read-only
  autofocus,               // 'start' | 'end' | 'all' | number | boolean
  pageLayout,              // { pageSize, orientation, margins }
  trackAuthor,             // string — used when track changes is on
  imageUploadHandler,      // (file: File) => Promise<string>
  slashCommands,           // SlashCommand[] — override defaults
  dragHandles,             // default true; show ⠿ block drag handles
  onUpdate,                // (json, editor) => void
  onSelectionChange,       // (editor) => void
  onWordCount,             // (stats) => void
});
```

`WordEditor` exposes a friendly façade over the underlying Tiptap chain:

```ts
editor.getHTML();
editor.getJSON();
editor.getText();
editor.setDocument(htmlOrJson);
editor.clear();
editor.focus('end');
editor.setEditable(false);

// Formatting (also available as editor.commands)
editor.format.bold();
editor.format.heading(2);
editor.format.bulletList();
editor.format.align('center');
editor.format.fontSize('14pt');
editor.format.setColor('#1d4ed8');
editor.format.setHighlight('#fff59d');
editor.format.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
editor.format.insertLink('https://example.com');
editor.format.startFormatPaint();

// Stats
editor.getWordCount();
editor.getTableOfContents();
```

### Exports &amp; imports

```ts
await editor.exportDocx('my-document.docx'); // Real DOCX with images, marks, lists, tables
await editor.exportMarkdown();
editor.exportHtml();
editor.exportJson();

editor.printPdf({
  title: 'Report',
  pageLayout: { pageSize: 'Letter', orientation: 'portrait' },
  pageNumbers: true,
});

await editor.importDocx(file);          // Uses mammoth.js
await editor.importMarkdown(text);       // marked.js
await editor.importFromFile(file);       // .docx | .md | .html | .json | .txt
```

### Page layout

```ts
editor.setPageLayout({
  pageSize: 'A4',         // 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom'
  orientation: 'portrait',
  margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
});
editor.getPageLayout();
```

The default UI ships a *Page layout* dialog (File menu) for end users.

### Find &amp; replace

```ts
const matchCount = editor.find('hello', { caseSensitive: false, regex: false });
editor.commands.findNext();
editor.commands.findPrev();
editor.replace('foo', 'bar', /* all? */ true);
editor.clearSearch();
```

The default UI binds `Ctrl/⌘+F` to find and `Ctrl/⌘+H` to find &amp; replace.

### Track changes

```ts
editor.toggleTrackChanges();
editor.isTrackingChanges();

const changes = (editor.instance.commands as any).getChanges();
(editor.instance.commands as any).acceptAllChanges();
(editor.instance.commands as any).rejectAllChanges();
```

### Auto-save

```ts
const stop = editor.enableAutoSave('my-doc-key', /* debounceMs */ 500);
editor.loadAutoSave('my-doc-key');
editor.clearAutoSave('my-doc-key');
stop(); // remove the listener later
```

## Recipes

### Custom slash commands

```ts
import { EditorShell, type SlashCommand } from '@raazkhnl/rk-editor-ui';

const slashCommands: SlashCommand[] = [
  {
    title: 'Insert today',
    description: "Insert today's date",
    icon: '📅',
    command: (e) => e.chain().focus().insertContent(new Date().toLocaleDateString()).run(),
  },
];

new EditorShell({ container, initialContent: '', slashCommands });
```

### Custom image upload (e.g. S3)

```ts
new EditorShell({
  container,
  imageUploadHandler: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const { url } = await res.json();
    return url;
  },
});
```

### Persist edits to a backend

```ts
let timer: any;
new EditorShell({
  container,
  onUpdate: (json) => {
    clearTimeout(timer);
    timer = setTimeout(() => fetch('/api/doc', {
      method: 'PUT',
      body: JSON.stringify(json),
      headers: { 'content-type': 'application/json' },
    }), 500);
  },
});
```

### Render content read-only on a public page

```ts
new EditorShell({
  container,
  initialContent: html,
  editable: false,
  toolbar: false,
  menubar: false,
  statusBar: false,
});
```

## Theming &amp; customisation

The UI is themed via CSS custom properties on `.rk-word-editor`. Override in your stylesheet:

```css
.rk-word-editor {
  --rk-primary: #6d28d9;
  --rk-primary-hover: #5b21b6;
  --rk-primary-soft: #ede9fe;
  --rk-radius: 8px;
}

.rk-word-editor[data-rk-theme='dark'] {
  --rk-bg: #18181b;
  --rk-surface: #27272a;
  --rk-text: #f4f4f5;
}
```

To toggle dark mode at runtime:

```ts
shell.toolbar.applyTheme('dark');
shell.toolbar.toggleTheme();
```

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Bold / Italic / Underline | `Ctrl/⌘+B` &nbsp;/&nbsp; `Ctrl/⌘+I` &nbsp;/&nbsp; `Ctrl/⌘+U` |
| Heading 1 / 2 / 3 | `Ctrl/⌘+Alt+1` / `2` / `3` |
| Bullet list / Numbered list | `Ctrl/⌘+Shift+8` &nbsp;/&nbsp; `Ctrl/⌘+Shift+7` |
| Indent / Outdent | `Tab` &nbsp;/&nbsp; `Shift+Tab` |
| Insert link | `Ctrl/⌘+K` |
| Find / Replace | `Ctrl/⌘+F` &nbsp;/&nbsp; `Ctrl/⌘+H` |
| Page break | `Ctrl/⌘+Enter` |
| Save (export DOCX) | `Ctrl/⌘+S` |
| Print / Save as PDF | `Ctrl/⌘+P` |
| Zoom in / out / reset | `Ctrl/⌘++` / `-` / `0` |
| Undo / Redo | `Ctrl/⌘+Z` &nbsp;/&nbsp; `Ctrl/⌘+Shift+Z` |

## Architecture

```
rk-word-editor/
├── packages/
│   ├── core/      ← Tiptap extensions + WordEditor class + ExportEngine + PrintEngine + ImportEngine
│   ├── ui/        ← Default toolbar, menubar, modals, find bar, outline, status bar, web component
│   └── cli/       ← Project scaffolder
└── apps/demo/     ← Vite playground
```

The **core** package is intentionally framework-free. The **UI** package consumes core and adds DOM components. The **CLI** generates a starter project that imports both.

## Roadmap

- [ ] Real-time collaboration via Y.js
- [ ] Comments / annotations sidebar with author colours
- [ ] Image cropping and alt-text editor
- [ ] Spelling/grammar check (browser native + plugin)
- [ ] Equation editor with rendering (KaTeX/MathJax)
- [ ] Headers &amp; footers (running titles, page numbers per section)
- [ ] Multi-section page layouts (different orientations within one document)
- [ ] Templates gallery (letter, resume, article, invoice)
- [ ] PWA installable demo
- [ ] i18n bundle and a11y audit

Want any of these sooner? Open an issue and tell us — or send a PR.

## Contributing

We welcome PRs! See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

```bash
git clone https://github.com/raazkhnl/rk-word-editor.git
cd rk-word-editor
npm install
npm run dev          # demo at http://localhost:3000
npm run build        # build all packages
npm run test         # run vitest in core
```

## License

MIT © [RaaZ Khanal](https://github.com/raazkhnl)
