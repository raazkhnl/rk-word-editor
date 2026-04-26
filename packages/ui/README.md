# @raazkhnl/rk-editor-ui

> **Drop-in Word-style UI for the web.** Toolbar, menubar, modals, find-and-replace, document outline, status bar, dark mode, page layout dialog — and a `<rk-word-editor>` web component. Built on top of [`@raazkhnl/rk-editor-core`](https://www.npmjs.com/package/@raazkhnl/rk-editor-core).

[![npm](https://img.shields.io/npm/v/%40raazkhnl%2Frk-editor-ui?label=npm)](https://www.npmjs.com/package/@raazkhnl/rk-editor-ui)
[![npm downloads](https://img.shields.io/npm/dm/%40raazkhnl%2Frk-editor-ui)](https://www.npmjs.com/package/@raazkhnl/rk-editor-ui)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/raazkhnl/rk-word-editor/blob/main/LICENSE)

The polished default UI for **[RK Word Editor](https://github.com/raazkhnl/rk-word-editor)** — a free, fully open-source Microsoft Word / Google Docs alternative for the web. MIT-licensed. No paywall. No telemetry.

## Install

```bash
npm install @raazkhnl/rk-editor-core @raazkhnl/rk-editor-ui
```

## Quick start (one line, any framework)

```ts
import { EditorShell } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

new EditorShell({
  container: document.getElementById('app')!,
  initialContent: '',
  placeholder: 'Start typing here…',
  outline: true,
  theme: 'light',           // 'light' | 'dark' | 'auto'
});
```

That gives you:

- ✅ A4 / Letter / Legal / A3 / A5 / Tabloid page surface
- ✅ Word-style menubar (File / Edit / Insert / Format / View / Help)
- ✅ Two-row formatting toolbar with all the SVG icons
- ✅ Dark mode toggle (auto from system preference)
- ✅ **Find &amp; replace** (`Ctrl/⌘+F`, `Ctrl/⌘+H`) — draggable popup, regex / whole-word / case
- ✅ **Document outline** sidebar with click-to-jump
- ✅ Status bar with page count, word count, reading time, zoom (`Ctrl/⌘++/-/0`)
- ✅ Themed dialogs for table, image, link, math, footnote, citation, page layout
- ✅ Insert: image, table, **draggable text box**, math, footnote, citation, table of contents, page break

## As a Web Component

```html
<script type="module" src="https://unpkg.com/@raazkhnl/rk-editor-ui"></script>
<link rel="stylesheet" href="https://unpkg.com/@raazkhnl/rk-editor-ui/dist/style.css" />

<rk-word-editor placeholder="Type here…" theme="auto" outline></rk-word-editor>
```

## React example

```tsx
import { useEffect, useRef } from 'react';
import { EditorShell } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

export default function MyEditor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const shell = new EditorShell({ container: ref.current, initialContent: '<p>Hello!</p>' });
    return () => shell.destroy();
  }, []);
  return <div ref={ref} style={{ height: '100vh' }} />;
}
```

(Vue, Svelte, Angular and Next.js patterns are in the [main README](https://github.com/raazkhnl/rk-word-editor#readme).)

## Theming

Override CSS variables on `.rk-word-editor`:

```css
.rk-word-editor {
  --rk-primary: #6d28d9;
  --rk-primary-hover: #5b21b6;
  --rk-radius: 8px;
}
.rk-word-editor[data-rk-theme='dark'] {
  --rk-bg: #18181b;
  --rk-surface: #27272a;
}
```

## Exports

- **`EditorShell`** — bundled editor + toolbar in one constructor (recommended)
- **`WordToolbar`** — toolbar/menubar standalone
- **`Modal`**, **`FindReplaceBar`**, **`StatusBar`**, **`Outline`** — individual building blocks
- **`Icons`**, **`icon(name)`** — the SVG icon set used internally
- **Dialog helpers**: `showLinkDialog`, `showImageDialog`, `showTableDialog`, `showMathDialog`, `showFootnoteDialog`, `showCitationDialog`, `showPageLayoutDialog`, `showShortcutsDialog`, `showAboutDialog`
- **`<rk-word-editor>`** custom element (auto-registered on import)

## Documentation

[Full docs, recipes & API reference on GitHub →](https://github.com/raazkhnl/rk-word-editor#readme)

## License

MIT © [RaaZ Khanal](https://github.com/raazkhnl)
