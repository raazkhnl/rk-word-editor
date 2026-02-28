# @raazkhnl/rk-editor-ui

A feature-rich, Microsoft Word-inspired User Interface for the RK Word Editor.

## Features

- **Menu Bar**: Comprehensive File, Edit, Insert, and Format menus.
- **Dynamic Toolbar**: Real-time formatting controls for text, paragraphs, and tables.
- **Command Palette**: Quickly search and access all commands via `Ctrl+K`.
- **Professional Shell**: A complete editor environment with word count, print styles, and dark mode support.
- **Web Component**: Framework-agnostic usage via `<rk-word-editor>` element.
- **A11y**: Screen reader friendly with full ARIA support.

## Installation

To get the complete experience, we recommend installing both the core engine and the UI package:

```bash
npm install @raazkhnl/rk-editor-ui @raazkhnl/rk-editor-core
```

[NPM Package Link](https://www.npmjs.com/package/@raazkhnl/rk-editor-ui)

## Usage

To use the full editor with the toolbar and shell:

```typescript
import { WordEditor } from '@raazkhnl/rk-editor-core';
import { WordToolbar } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

// 1. Initialize the Core Editor
const editor = new WordEditor({
  element: document.getElementById('editor-area'),
});

// 2. Attach the UI Toolbar/Shell
const toolbar = new WordToolbar(editor, document.getElementById('toolbar-container'));

// OR use as a Web Component
import '@raazkhnl/rk-editor-ui';
// In your HTML: <rk-word-editor></rk-word-editor>
```

## Styling

Ensure you import the core styles for the toolbar and editor area:

```typescript
import '@raazkhnl/rk-editor-ui/styles.css';
```

## License

MIT
