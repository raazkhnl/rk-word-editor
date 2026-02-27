# RK Word Editor Monorepo
A modern, high-performance rich-text editor monorepo built with Tiptap, ProseMirror, and TypeScript. Optimized for professional documentation, Microsoft Word-like experience, and customizability.

## ✨ Latest Features (v3.2.1)
- **Interactive Image Resizing**: Professional drag handles on images.
- **Robust DOCX Export**: Industry-standard Docx generation with multilevel lists.
- **Nepali Numbering**: Native Devanagari numbering support (१. २. ३...).
- **SVG Toolbar Icons**: Clean, premium iconography.
- **Advanced Layout**: Page breaks, margins, and custom typography.
- **Track Changes**: Built-in review system with textual visual insertion/deletion tracking and Accept/Reject APIs.

## 📦 Project Structure
- `packages/core`: The main editor engine logic and extensions.
- `packages/ui`: Pre-built toolbar, shell, and premium UI components.
- `apps/demo`: Sample application for testing and integration.

## 🚀 Getting Started
### Installation
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

### Development
```bash
npm run dev
```

## 📦 Packages
### [@raazkhnl/rk-editor-core](https://www.npmjs.com/package/@raazkhnl/rk-editor-core)
The high-performance core engine. Use this for a headless editor or a custom UI.
```bash
npm install @raazkhnl/rk-editor-core
```

### [@raazkhnl/rk-editor-ui](https://www.npmjs.com/package/@raazkhnl/rk-editor-ui)
The full Word-like interface including the premium toolbar and shell.
```bash
npm install @raazkhnl/rk-editor-ui
```

## 🛠️ Build & CI/CD
This monorepo uses Vite for building and GitHub Actions for automated publishing.
- `npm run build`: Build all packages.
- `npm publish:packages`: Publish workspaces to NPM.

## 📄 License
MIT
