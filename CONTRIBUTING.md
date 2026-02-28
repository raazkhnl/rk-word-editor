# Contributing to RK Word Editor

First off, thank you for considering contributing to RK Word Editor! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## How Can I Contribute?

### Reporting Bugs
- Use the **Bug Report** template.
- Describe the bug in detail, including steps to reproduce.
- Include screenshots or videos if possible.

### Suggesting Enhancements
- Use the **Feature Request** template.
- Explain why this enhancement would be useful.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. Install dependencies: `npm install`
3. Make your changes and ensure tests pass: `npm test`
4. Use descriptive commit messages.
5. Submit a PR!

## Coding Standards
- Use TypeScript for all logic.
- Follow the existing code style (formatting is handled by Prettier).
- Write tests for new features.

## Workspace Setup
This is a monorepo using NPM workspaces.
- Root: [package.json](file:///package.json)
- Core: [packages/core](file:///packages/core)
- UI: [packages/ui](file:///packages/ui)
- Demo: [apps/demo](file:///apps/demo)

Run `npm run build` from the root to build everything.
Run `npm test` from the root to run all tests.
