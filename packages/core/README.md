# @raazkhnl/rk-editor-core

> **Headless, framework-agnostic rich-text Word editor engine for the web.** Built on [Tiptap](https://tiptap.dev) and [ProseMirror](https://prosemirror.net) — fully MIT-licensed, no paywalled features, no telemetry.

[![npm](https://img.shields.io/npm/v/%40raazkhnl%2Frk-editor-core?label=npm)](https://www.npmjs.com/package/@raazkhnl/rk-editor-core)
[![npm downloads](https://img.shields.io/npm/dm/%40raazkhnl%2Frk-editor-core)](https://www.npmjs.com/package/@raazkhnl/rk-editor-core)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/raazkhnl/rk-word-editor/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

The headless engine for [**RK Word Editor**](https://github.com/raazkhnl/rk-word-editor) — a free, open-source Microsoft Word / Google Docs alternative for the web that you can drop into any application: Vanilla JS, React, Vue, Svelte, Angular, Next.js or Web Component.

---

## Why RK Word Editor?

| | RK Word Editor | TinyMCE / Froala | Quill | Lexical |
| --- | :---: | :---: | :---: | :---: |
| MIT, no paid tier | ✅ | ❌ | ✅ | ✅ |
| Real DOCX export with images, tables, lists | ✅ | 💲 paid | ❌ | ❌ |
| True isolated PDF / print pipeline | ✅ | 💲 paid | ❌ | ❌ |
| Page layout (A4/Letter, margins, orientation) | ✅ | 💲 paid | ❌ | ❌ |
| Find & replace with regex | ✅ | 💲 paid | ❌ | ❌ |
| Track changes | ✅ | 💲 paid | ❌ | ❌ |
| Draggable, resizable text boxes | ✅ | ❌ | ❌ | ❌ |
| Image resize handles + drag-and-drop upload | ✅ | ✅ | ❌ | ❌ |
| Headless / framework-agnostic | ✅ | ✅ | ✅ | ✅ |
| Slash commands `/heading`, `/table` … | ✅ | ❌ | ❌ | ✅ |

## Install

```bash
npm install @raazkhnl/rk-editor-core
```

If you also want the included Word-style toolbar / menubar / dialogs, install [`@raazkhnl/rk-editor-ui`](https://www.npmjs.com/package/@raazkhnl/rk-editor-ui).

## Quick start

```ts
import { WordEditor } from '@raazkhnl/rk-editor-core';

const editor = new WordEditor({
  element: document.getElementById('editor')!,
  initialContent: '<p>Hello, world!</p>',
  placeholder: 'Start typing here…',
});

// Format API
editor.format.bold();
editor.format.heading(1);
editor.format.bulletList();
editor.format.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
editor.format.insertTextBox();          // floating, draggable text box
editor.format.setColor('#1d4ed8');

// I/O
await editor.exportDocx('report.docx');     // ✅ Real .docx, opens in Word
editor.printPdf({ pageLayout: { pageSize: 'A4', orientation: 'portrait' }});
editor.exportMarkdown();
editor.exportHtml();
await editor.importFromFile(file);          // .docx | .md | .html | .json | .txt

// Collaboration helpers
editor.toggleTrackChanges();
const stop = editor.enableAutoSave('my-doc');

// Stats
editor.getWordCount();        // { words, characters, paragraphs, sentences, pages, readingTimeMinutes }
editor.getTableOfContents();  // [{ level, text, id }]
```

## What ships in this package

- **`WordEditor`** class — the main façade.
- **`CommandManager`** — high-level format API (`bold()`, `heading()`, `align()`, …).
- **`ExportEngine`** — produces real DOCX with embedded images, hyperlinks, tables, lists (incl. Nepali numbering), task lists, footnotes. `toBlob()` API for piping the document elsewhere.
- **`ImportEngine`** — DOCX (via `mammoth`), Markdown (via `marked`), HTML, JSON, plain text.
- **`PrintEngine`** — isolated-iframe print → properly paginated PDF via the browser's native dialog. Defaults to A4 portrait.
- **`StyleManager`**, **`DocumentValidator`**.
- 30+ Tiptap extensions: tables, images with resize handles, multilevel lists, Nepali numbering, footnotes, citations, bibliography, table of contents, math (LaTeX), captions, page breaks, page layout, header/footer, line height, indent, font size, font family, text transform, advanced typography, slash commands (`/heading`, `/table`, …), drag handles, format painter, track changes, find &amp; replace, **draggable & resizable text boxes**, paste handler, Word keyboard shortcuts, and more.

## Framework integrations

```ts
// Vanilla
import { WordEditor } from '@raazkhnl/rk-editor-core';

// React
useEffect(() => { const e = new WordEditor({ element: ref.current! }); return () => e.destroy(); }, []);

// Vue
onMounted(() => { editor = new WordEditor({ element: el.value! }); });

// Svelte / Angular / Solid — same pattern: ref → new WordEditor()
```

For a fully-featured drop-in (toolbar + menubar + status bar + outline + dialogs) use [`@raazkhnl/rk-editor-ui`](https://www.npmjs.com/package/@raazkhnl/rk-editor-ui)'s `EditorShell` or `<rk-word-editor>` web component.

## Documentation

- [Full README on GitHub](https://github.com/raazkhnl/rk-word-editor#readme) — examples, theming, API reference
- [CHANGELOG](https://github.com/raazkhnl/rk-word-editor/blob/main/CHANGELOG.md)
- [Issues / Roadmap](https://github.com/raazkhnl/rk-word-editor/issues)

## License

MIT © [RaaZ Khanal](https://github.com/raazkhnl). Use it commercially, fork it, vendor it — all without restriction.
