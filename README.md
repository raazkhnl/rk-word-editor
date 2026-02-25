# RK-Word-Editor

A high-performance, modern, and extensible rich-text editor built on Tiptap and ProseMirror. Designed for speed, flexibility, and beautiful typography.

## ✨ Features

- **Modern Core**: Built on Tiptap 2 and ProseMirror for industry-leading reliability.
- **Modular Architecture**: Monorepo design with separated `@rk-editor/core` and `@rk-editor/ui`.
- **Advanced Layouts**: Native support for page breaks, margins, and flexible page structures.
- **Rich Table System**: Cell merging, row/column management, and advanced styling.
- **Media Support**: Seamlessly integrate images and other media types.
- **Extensible**: Easily add custom Tiptap extensions and UI components.
- **Developer First**: Fully typed with TypeScript, ESM ready, and zero-config builds.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

```bash
git clone https://github.com/your-username/rk-word-editor.git
cd rk-word-editor
npm install
```

### Usage

To start the demo application in development mode:
```bash
npm run dev
```

To build all packages (`core`, `ui`, `demo`):
```bash
npm run build
```

The demo application will be available at `http://localhost:3000`.

## 📦 Project Structure

- `packages/core`: The core editor engine and Tiptap extensions.
- `packages/ui`: Reusable UI components and the editor toolbar.
- `apps/demo`: A sample application showcasing the editor's capabilities.

## 🛠️ Built With

- [Tiptap](https://tiptap.dev/) - The headless editor framework.
- [ProseMirror](https://prosemirror.net/) - The toolkit for building rich-text editors.
- [Vite](https://vitejs.dev/) - Next generation frontend tooling.
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information. All features are free and open-source.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
