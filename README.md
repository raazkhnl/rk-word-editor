# RK Word Editor Monorepo

A modern, high-performance rich-text editor monorepo built with Tiptap, ProseMirror, and TypeScript. Optimized for professional documentation, Microsoft Word-like experience, and customizability.

---

## 📑 Table of Contents
- [✨ Latest Features (v3.5.0)](#-latest-features-v350)
- [🚀 Live Demo](#-live-demo)
- [📦 Project Structure](#-project-structure)
- [🛠️ Installation](#️-installation)
- [📖 API Usage](#-api-usage)
- [🤝 Contributing](#-contributing)
- [🛡️ Code of Conduct](#️-code-of-conduct)
- [📄 License](#-license)

---

## ✨ Latest Features (v3.5.0)
- **Interactive Image Resizing**: Professional drag handles on images.
- **Robust DOCX Export**: Industry-standard Docx generation with multilevel lists.
- **Nepali Numbering**: Native Devanagari numbering support (१. २. ३...).
- **SVG Toolbar Icons**: Clean, premium iconography.
- **Advanced Layout**: Page breaks, margins, and custom typography.
- **Track Changes**: Built-in review system with textual visual insertion/deletion tracking and Accept/Reject APIs.
- **Dual Packaging**: ESM and CJS support for better tool compatibility.
- **A11y Improvements**: Enhanced keyboard navigation and ARIA support.

## 🚀 Live Demo
Check out the editor in action here: [Live Demo Link](https://rk-word-editor.vercel.app) *(Update with your actual link)*

## 📦 Project Structure
- `packages/core`: The main editor engine logic and extensions.
- `packages/ui`: Pre-built toolbar, shell, and premium UI components.
- `apps/demo`: Sample application for testing and integration.

## 🛠️ Installation

To install the complete package in your project:
```bash
npm install @raazkhnl/rk-editor-ui @raazkhnl/rk-editor-core
```

For development (cloning the monorepo):
```bash
git clone https://github.com/raazkhnl/rk-word-editor.git
cd rk-word-editor
npm install
npm run build
```

## 📖 API Usage

### Using the UI Component (React)
The simplest way to get started is by using the `@raazkhnl/rk-editor-ui` package.

```tsx
import React from 'react';
import { EditorShell } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

const MyEditor = () => {
  return (
    <div style={{ height: '500px' }}>
      <EditorShell 
        placeholder="Start typing..."
        onUpdate={(json) => console.log(json)}
      />
    </div>
  );
};
```

### Headless Usage (Core Only)
If you want to build your own UI, use `@raazkhnl/rk-editor-core`.

```ts
import { useEditor } from '@tiptap/react';
import { defaultExtensions } from '@raazkhnl/rk-editor-core';

const editor = useEditor({
  extensions: defaultExtensions,
  content: '<p>Hello World!</p>',
});
```

## 🤝 Contributing
Contributions are welcome! Please read our [CONTRIBUTING.md](file:///CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🛡️ Code of Conduct
We are committed to fostering a welcoming community. Please see our [CODE_OF_CONDUCT.md](file:///CODE_OF_CONDUCT.md).

## 📄 License
MIT © [RaaZ Khanal](https://github.com/raazkhnl)
