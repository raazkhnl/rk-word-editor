# @raazkhnl/rk-editor-core

The high-performance core engine for RK Word Editor, built on top of Tiptap and ProseMirror.

## Features

- **Standard Formatting**: Bold, Italic, Underline, Strikethrough, Subscript, Superscript.
- **Advanced Typography**: Control font family, size, line height, paragraph spacing, and indentation.
- **Table Support**: Create and manage tables with headers, merging/splitting, and resizing.
- **Lists**: Bullet, numbered, and task lists with multi-level support.
- **Devanagari Support**: Built-in support for Nepali numbering system (१, २, ३...).
- **Media**: Image upload with resizing and drag-and-drop support.
- **Export/Import**: Support for DOCX, Markdown, and HTML formats.
- **Productivity**: Track changes, slash commands, and table of contents.

## Installation

```bash
npm install @raazkhnl/rk-editor-core
```

[NPM Package Link](https://www.npmjs.com/package/@raazkhnl/rk-editor-core)

## Usage (Standalone Text Field)

If you want to use the editor as a professional text field in your own project without the pre-built toolbar, use the core engine directly:

```typescript
import { WordEditor } from '@raazkhnl/rk-editor-core';

// Initialize the editor
const editor = new WordEditor({
  element: document.getElementById('editor'),
  initialContent: '<p>Start typing...</p>',
  onUpdate: (json) => {
    // Handle content changes
    console.log(json);
  }
});

// Access the content
const html = editor.getHTML();
const json = editor.getJSON();

// Manually trigger commands
editor.commands.bold();
```

## License

MIT
