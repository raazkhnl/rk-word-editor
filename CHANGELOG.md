# Changelog

All notable changes to **RK Word Editor** will be documented here. This project follows [Semantic Versioning](https://semver.org/).

## [4.6.0] — 2026-05-08

Major polish, responsiveness, and accessibility release. Adds a command palette, auto-save status indicator, image alt-text editor, and a hosted demo on GitHub Pages.

### Added
- **Command palette** ([Ctrl/⌘ + /]) — fuzzy-search every editor command (insert image, export DOCX, toggle outline, switch theme, …) without hunting through menus.
- **Auto-save status pill** in the status bar — shows `Saving…`, `Saved`, or `Save failed`, plus a relative timestamp (`Saved 12s ago`). The host app drives it via `shell.setSaveState('saving' | 'saved' | 'error')`.
- **Image alt-text + title editor** in the right-side properties panel. Both are read by screen readers and round-trip through DOCX/HTML export.
- **Image dialog** now collects alt text and tooltip title up front, and rejects `javascript:` / `data:` URLs.
- **Insert menu** now exposes Page number, Bibliography, and direct Math (LaTeX) insertion — previously these existed in core but were not reachable from the UI.
- **Toast notifications** (`toast(message, { variant })`) — tiny, theme-aware, dismissible; used by the demo to surface storage-quota errors.
- **PWA-installable demo** with a web manifest, theme-color, SVG favicon, and a stale-while-revalidate service worker (production builds only).
- **Hosted demo on GitHub Pages** — `.github/workflows/publish.yml` now ships every push to `main` to `https://raazkhnl.github.io/rk-word-editor/` via the official `actions/deploy-pages` flow. SPA fallback (`404.html`) and `.nojekyll` are written automatically.
- **Web component events** — `<rk-word-editor>` now dispatches `rk-ready`, `rk-change`, and `rk-selection` CustomEvents and exposes `getValue(format)` / `setValue(content)` methods. New `properties` attribute toggles the right-side panel; `theme` and `readonly` react to attribute changes.
- **CLI scaffolder** rewritten — `npx @raazkhnl/rk-editor-cli init` now generates a working Vite project (Vanilla, React, Vue, or Svelte template) with `index.html`, `vite.config.ts`, `tsconfig.json`, and a starter `main.{ts,tsx}` that imports `EditorShell` and the styles.

### Fixed
- **Hard-coded colours** scoped through new CSS tokens (`--rk-doc-bg`, `--rk-doc-text`, `--rk-table-border`, `--rk-table-header-bg`, `--rk-table-header-text`, `--rk-code-inline-bg`, `--rk-code-inline-text`, `--rk-code-block-bg`, `--rk-blockquote-text`, `--rk-blockquote-border`). Dark-mode tables, inline code, and blockquotes now meet WCAG AA contrast against the dark surface.
- **Inline `<code>` was unreadable in dark mode** — light tint applied, foreground colour follows the theme.
- **Blockquote text** in dark mode bumped from `--rk-text-muted` (≈3.5:1) to a dedicated lighter shade (≈4.7:1).
- **`--rk-text-muted` lifted** in dark mode so all secondary labels (status bar, outline, footnotes) hit AA contrast.
- **`console.log` debug noise removed** from the `ImageUpload` extension; oversized drops/pastes still warn once.
- **CLI version mismatch** — was reporting `3.5.0` and pinning legacy deps. Now reports `4.6.0` and points at `^4.6.0`.

### Improved — UI uniformity
- New spacing tokens (`--rk-space-1`…`--rk-space-7`) and control-height tokens (`--rk-control-h`, `--rk-control-h-sm`) keep toolbar buttons, inputs, selects, and modal fields visually aligned across components.
- Modal fields now consistently match the toolbar control sizing.
- Image properties panel split into `Accessibility / Size / Layout` sections for better scanning.
- A11y: more `aria-label` and `title` on icon buttons, `aria-live` on status indicators, focus-visible outline on keyboard interaction.

### Improved — Mobile & responsiveness
- **First-class responsive layout** with `@media` breakpoints at 1024 / 860 / 640 / 420 px:
  - Outline & properties panels become overlay drawers below 860 px instead of squeezing the editor.
  - Toolbar wraps and shrinks; on very narrow viewports the secondary toolbar row is hidden by default with a *View → Show secondary toolbar* toggle to bring it back.
  - The editor surface fits the viewport on phones (instead of a fixed 210 mm A4 box that overflowed).
  - Modals fill the screen on phones; the find bar auto-fills the available width.
  - Status bar wraps; least-important pieces (reading time) are hidden under 420 px.
- **Coarse-pointer media query** — image-resize and text-box handles enlarge to 14 px so they're tappable on touch devices.
- **`prefers-reduced-motion`** honoured everywhere (animations and transitions reduced to ~0).

### Demo
- First-time visitors are seeded with a guided sample document showing every major feature (TOC, headings, table, code block, task list, math, blockquote).
- "Reset demo" pill (bottom-left) restores the sample at any time.
- Loading splash so the page paints something immediately.
- `localStorage` quota errors now surface a toast instead of silently swallowing.
- SEO meta + Open Graph tags; PWA manifest; SVG favicon.
- `vite.config.ts` now resolves the right `base` automatically when built under `GITHUB_ACTIONS` (so GH Pages deploys to `/rk-word-editor/` without manual config).



### Fixed
- **Table of Contents missing in PDF / Print export.** The TOC node renders its populated content via a NodeView, which `editor.getHTML()` cannot serialize, so prints were emitting an empty fallback. `printPdf()` now uses a new `getPrintableHTML()` that clones the live `.ProseMirror` DOM (so the populated TOC, image-resize wrappers, and text boxes all carry over), then strips editor-only chrome (drag handles, resize handles, pagination spacers, refresh buttons, gap cursors, `contenteditable` attrs, selected-node markers) before sending to the print iframe.
- **Print stylesheet for TOC, text boxes, and image wrappers.** Added proper `@media print` styles for `.rk-toc*`, `.rk-textbox*`, and `.rk-image-resize-wrapper` so the printed output matches the on-screen rendering — leader dots, level indents, page-number alignment, text-box borders, and image sizing all render correctly in the PDF.

## [4.1.2] — 2026-04-26

Major rewrite of the page rendering after user reports that tables/text were appearing in the visual gap between page sheets, and that the right-side property panel for headings/TOC still wasn't elegant.

### Fixed
- **Content appearing in the gap between pages.** Removed the multi-sheet page background entirely. The editor surface is now a **single continuous white canvas** with a soft shadow; page boundaries are drawn as **subtle dashed horizontal lines** via a CSS repeating-linear-gradient (zero DOM, zero measurements, zero flicker). Content always lives inside the white canvas, and never lands in a gap because there is no gap.
- **Hard page break + auto-pagination.** Pagination spacers no longer add a gap height — they simply fill the rest of the current page so the next block lands at the top of the next page. A subtle "Page break" pill is centred in the spacer for hard breaks. Blocks taller than a single page are allowed to span; smaller blocks are pushed to the next page so they don't straddle the boundary line.
- **Heading + Paragraph property panel.** Replaced the dropdowns with a 2×3 grid of **clickable heading chips** (each shows H#, label like "Title / Section / Subsection", and a live size preview). Alignment + line-height become segmented control rows.
- **TOC property panel.** Top of the panel is now a prominent "↻ Refresh table of contents" button. Levels are picked through a *From → To* pill-style row. *Dotted leader* and *Page numbers* are rendered as proper toggle switches (with the on/off animation).

### Removed
- `PageBackground` component (no longer needed).

### Changed
- Page-content height is now exposed as a CSS variable (`--rk-page-content-height`) on the ProseMirror surface so the boundary line in the background gradient lines up with the spacer-aware Pagination math automatically.

## [4.1.1] — 2026-04-26

Polish &amp; fixes on top of 4.1.0. Major changes to how pages render and how the side panels feel.

### Added
- **Title** and **Subtitle** text-block nodes — Word- / Google-Docs-style top-of-document styles, distinct from headings (so they don't appear in the TOC). Available via the toolbar style dropdown and `editor.format.title()` / `editor.format.subtitle()`.
- **Style dropdown reorganised** into Title → Subtitle → Heading 1–6 → Normal text.
- **Reopen tab** for both side panels: when collapsed, a small rounded tab pokes out of the editor edge so you can re-open the panel without diving into the View menu.

### Fixed
- **Dark theme: invisible table header text.** `<th>` background was hard-coded `#f3f4f6` (light); in dark mode the inherited light text was unreadable. Now uses CSS variables (`--rk-table-header-bg` / `--rk-table-header-text`) with explicit dark-mode overrides.
- **TOC was missing in DOCX export.** Previously only the title placeholder shipped; now the export walks the document for headings (respecting the TOC's `minLevel`/`maxLevel` filter), emits each as an indented paragraph with leader dots and an estimated page number — so the TOC actually appears in `.docx` files.
- **Page break did not visually push content to the next page.** Fixed: every hard `pageBreak` node now generates a tall spacer (decoration) sized to fill the rest of the current page + the gap between page sheets, so the next block lands on the next page sheet exactly like Word.
- **Auto-pagination similarly uses spacers** that align across-page blocks with the next page sheet — no more "— Page N —" overlay markers / hatched stripes.
- **Pages now render as actual sheets**, not a single canvas with overlay markers. The new `PageBackground` layer renders one white sheet per page (with shadow + page number) behind a transparent ProseMirror surface, so the editor looks like Word / Google Docs.
- **TOC auto-refresh removed.** It was firing on every keystroke, contributing to flicker. The TOC now only refreshes when you press the Refresh button on it (or call `editor.format.refreshTableOfContents()`) — matching Word's behaviour.
- **UI flicker** during typing or layout changes. The Pagination plugin's `apply` was recomputing on every doc change; combined with the `ResizeObserver` watching `view.dom`, decoration updates fed back as fake resize events. Recompute is now triggered explicitly via `view.update` (only on real doc changes) and width-changed-only ResizeObserver events, all rAF-debounced and rate-limited (≥200ms between recomputes). Pagination state.apply only recomputes when explicitly requested via meta — selection changes never re-render boundaries.
- **Properties panel UX**: redesigned with card-style sections, grid label/value layout, primary-soft hint cards, and a smooth collapse animation. Same treatment for the Outline.
- **EditorShell allowed `container` OR `element`** (previously TS complained about missing `element`).

## [4.1.0] — 2026-04-26

Big feature release. Adds a configurable, refreshable Table of Contents, visual page boundaries, and a context-aware right-side properties panel.

### Added
- **Refreshable, hierarchical Table of Contents.** [`TableOfContents`](packages/core/src/extensions/TableOfContents.ts) is now a real `tableOfContents` node (not just an inserted-once paragraph) with attributes:
  - `title` — heading shown above the list (default *"Table of contents"*).
  - `minLevel` / `maxLevel` — heading levels to include (1–6, default 1–3).
  - `showLeader` — dotted leader between text and page number.
  - `showPageNumbers` — toggle estimated page numbers (computed from a chars-per-page heuristic).
  - Built-in **Refresh** button + new `editor.format.refreshTableOfContents()` command. Auto-refreshes on doc changes too.
  - Elegant tiered styling: H1 bold + larger, H2 normal, H3+ smaller and indented.
  - Click any item → smooth-scrolls to the heading via `view.nodeDOM(pos)`.
- **TOC insert dialog** — pick title, level range, leader, page numbers from a modal (`showTocDialog(editor)`).
- **Visual page boundaries** in the editor. New [`Pagination`](packages/core/src/extensions/Pagination.ts) extension measures rendered block heights against the configured page area (auto-derived from `pageLayout`) and inserts a "— Page N —" indicator wherever the next page would start. Decorations only — no model changes, no impact on cursor / selection / undo / export. Hard `page-break` nodes reset the running height. Recomputes on doc change, layout change, and resize (via `ResizeObserver` + `window.resize`).
- **Right-side context-aware Property Panel.** [`PropertyPanel`](packages/ui/src/PropertyPanel.ts) is enabled by default. It detects what's selected and renders the appropriate form:
  - **Image** → width, height, wrap (none / left / right), alignment.
  - **Table** → insert/delete row & column, merge/split, toggle header row/column, cell colour, delete table.
  - **Text box** → width, height, background, border colour.
  - **Table of contents** → title, level range, dotted leader, page numbers, and a Refresh button.
  - **Heading** → level switcher + alignment.
  - **Paragraph** → alignment + line height.
- **`PropertyPanel`** + **`Outline`** can be toggled from `View → Toggle outline / Toggle properties panel` in the menubar.
- New `WordToolbarOptions.propertyPanel` flag (default `true`).
- New `editor.format.setTocLevels(min, max)` and `editor.format.refreshTableOfContents()` commands on `CommandManager`.

### Fixed
- **`EditorShell` required `element` even though it builds its own surface.** `EditorShellOptions` now accepts either `container` or `element`, both optional individually but one must be present. Cleared the IDE diagnostic users were hitting.
- **Pagination crashed in jsdom** because `ResizeObserver` isn't defined. Wrapped construction in a guard so tests pass.

### Changed
- The TOC export to DOCX now writes a styled "Table of contents" heading paragraph rather than the per-item list. Word users typically regenerate the TOC inside Word (References → Table of Contents) — this leaves a clean anchor for them.
- Default demo turns the `propertyPanel` on so users see all of this immediately.

## [4.0.2] — 2026-04-26

Polish &amp; feature release. Adds draggable text boxes, fixes the IDE/TS errors users hit, and tightens the UI in several places.

### Added
- **TextBox extension** ([packages/core/src/extensions/TextBox.ts](packages/core/src/extensions/TextBox.ts)) — Word-style floating text frames you can insert anywhere. Drag the `⠿` handle to move, eight corner/edge handles to resize, content reflows inside. Available via `editor.format.insertTextBox()`, the *Insert → Text box* menu, and the toolbar. Persists size + position via `data-width`/`data-height`/`data-x`/`data-y`.
- **Better SEO across all three npm packages** — richer descriptions, ~50 search-relevant keywords (rich-text editor, Word editor, Tiptap UI, DOCX export, framework names, etc.), `funding`, `engines`, and substantially expanded per-package READMEs so npm search and the npm package page surface real content.
- **TextBox tests** — three more cases (default attrs, custom attrs, survives DOCX round-trip).

### Fixed
- **TypeScript: "Cannot find module declarations for '@raazkhnl/rk-editor-ui/styles.css'"** — added [`vite-env.d.ts`](apps/demo/src/vite-env.d.ts) with `*.css` declaration so editors stop complaining about the side-effect import.
- **TypeScript 7 deprecation: `baseUrl`** — removed `baseUrl` from every tsconfig and switched `paths` to use repo-relative paths. The deprecation warning is gone.
- **Placeholder appeared on every new line.** The Tiptap `Placeholder` extension was set with `showOnlyCurrent: false`, which adds the `data-placeholder` attribute to *every* empty paragraph. Tightened to `showOnlyCurrent: true` and scoped the CSS strictly to `.ProseMirror.is-editor-empty > .is-empty:first-child::before` — the hint now only shows when the entire document is empty.
- **Document outline was congested and clicking a heading didn't scroll.** Rewrote with proper hierarchical indentation, monospace `H1/H2/H3` markers, ellipsis truncation, and most importantly: clicking now resolves the heading's actual DOM node via `view.nodeDOM(pos)` and calls `scrollIntoView({ behavior: 'smooth', block: 'start' })` on it, so it works regardless of which scroll container the editor lives in.
- **Subscript / superscript icons** were generic abstract glyphs. Now drawn as a proper "X with a small 2 above/below" so they read at a glance.
- **Table column resize was broken in the UI.** Added `table-layout: fixed`, kept `position: relative` on cells (required for the resize handle), and bumped the handle's `z-index` so it isn't covered by selection overlays. Tables now resize columns reliably.
- **Cell content overflowed in the editor but rendered fine in PDF.** Added `word-break: break-word; overflow-wrap: break-word; white-space: normal` so long words wrap on screen the same way they do in the printed/exported document.
- **Modal stayed transparent if no editor was on the page.** The modal class now also carries `rk-word-editor` so the CSS variables resolve even when the modal opens before the editor renders (e.g. on `DOMContentLoaded`).

### Removed
- **Dead `ImageResizeHandle` Node export** — only the `createImageResizeView` function was used by the rest of the codebase. The empty `Node.create({ name: 'imageResizeHandle' })` wrapper was removed; the file now only exports the function.

## [4.0.1] — 2026-04-26

Quality &amp; bug-fix release. Major focus on the things integrators hit on day 1.

### Fixed
- **Modals were transparent.** The overlay was appended to `<body>` but the CSS variables were scoped to `.rk-word-editor`, so `--rk-surface` and friends never resolved. The overlay now also carries the `rk-word-editor` class (and inherits the active theme), so modals are properly opaque, themed, and accessible.
- **Word count miscounted across blocks.** `<p>apple</p><p>ball</p>` was being counted as **1 word** (`appleball`) because Tiptap's `doc.textContent` joins block text without separators. Now uses `doc.textBetween(0, size, '\n')` so adjacent block contents are treated as separate words.
- **DOCX export refusing to open in Word.** Rewrote `ExportEngine` from the ground up:
  - Strict `IRunOptions`, `ILevelsOptions` types from `docx@9.6` — no more `as any` covering type errors.
  - SVG image bytes are no longer mis-typed as PNG (Word would corrupt). They're now skipped cleanly.
  - Hyperlinks are real `ExternalHyperlink` runs with proper underline + color.
  - Highlights use `shading` for arbitrary hex colors (the `highlight` field only accepts named enum values).
  - Numbering definitions for decimal, bullet, and Nepali lists generate every level (0–8) so nested lists never reference an undefined level.
  - Tables always have at least one row + cell with at least one paragraph (Word's strict requirement).
  - The library import for `file-saver` uses default-import interop so it works in both bundlers and Node ESM.
  - New `ExportEngine.toBlob()` exposes the underlying conversion so consumers can pipe the document elsewhere (server upload, signed URLs, postMessage to a worker).
  - Added a real test suite (`ExportEngine.test.ts`) that produces representative documents and validates the OOXML zip header.
- **Find &amp; replace bar didn't work and wasn't draggable.** Rewrote as a floating popup with a drag handle. Pre-fills with the current selection. `Enter`/`Shift+Enter` cycle matches. Live counter shows `current / total` matches.
- **Format painter only copied marks.** It now also captures **block attributes** (alignment, line-height, indent, paragraph spacing) and applies them to the target — matching Word's behaviour. `Esc` cancels.
- **Empty editor was blank.** Added the official `@tiptap/extension-placeholder` so the canvas now shows `Start typing here…` (configurable via `placeholder`) when empty, plus per-heading hints (`Heading 1`, etc.).
- **Six duplicate `document.click` listeners.** The menubar registered a global click listener inside every menu — fixed to register once and clean up on `destroy()`.
- **`javascript:` / `vbscript:` / `data:` URLs in link dialog.** Sanitised in `showLinkDialog` to prevent XSS via the link insert flow.

### Added
- **WordShortcuts extension** with the keyboard map most Word/Google-Docs users expect:
  - `Ctrl/⌘+1..6` and `Ctrl/⌘+Alt+1..6` → Headings 1–6
  - `Ctrl/⌘+0` → Normal paragraph
  - `Ctrl/⌘+L / E / R / J` → Align left / center / right / justify
  - `Ctrl/⌘+Shift+L / O` → Bullet / Numbered list
  - `Ctrl/⌘+Shift+X` → Strikethrough
  - `Ctrl/⌘+. / ,` → Super- / Subscript
  - `Ctrl/⌘+Shift+H` → Highlight (yellow)
  - `Ctrl/⌘+Enter` → Page break
- **Click-to-select for images** so the resize handles appear on first click instead of requiring keyboard nav.
- **New icons** for text colour, highlight, format painter — closer to Word's visual language with a coloured bar under the icon that previews the current colour.
- **Better word/character/page stats**: paragraphs, sentences, reading time and pages all derived from the corrected text walk.

### Changed
- Default demo loads with an empty canvas so first-run integrators see the placeholder UX immediately. Past content is restored from `localStorage` only when it actually has content.
- `EditorShell` now mounts the editor surface as a child element of the container (rather than the container itself) so toolbars, status bar, outline, and the find-bar can be siblings without competing for layout.

## [4.0.0] — 2026-04-26

This is a major release. Most consumer APIs are backwards-compatible (the legacy `content` option still works), but the published packages are reorganised, the build pipeline is rewritten, and large feature work has landed across the board.

### Added
- **`PrintEngine`** — true PDF / print pipeline rendered in an isolated iframe. The browser print dialog now sees only the document, with proper `@page` size, margins, page numbers, and pagination. Default is **A4 portrait**.
- **`ExportEngine` rewrite** — full DOCX coverage: embedded images (with base64 + remote fetch), hyperlinks, all character marks (color, highlight, font family, size, strike, sub/sup, code, track-changes), task lists, code blocks, blockquotes, multilevel lists, Nepali numbering, captions, citations, footnotes, and section page properties from the editor's page layout.
- **Find & Replace** (`@raazkhnl/rk-editor-core`'s `FindReplace` extension) — case-sensitive, whole-word and regex options, with decoration-based match highlighting.
- **Page layout API** — `editor.getPageLayout()` / `editor.setPageLayout(...)`. Supports A3, A4, A5, Letter, Legal, Tabloid; portrait/landscape; per-side margins. New *File → Page layout* dialog in the UI.
- **Document outline sidebar** (`Outline` component) — lists headings and jumps to them on click.
- **Status bar** with page count, word/character count, reading time and a zoom control.
- **Dark mode** (`Toolbar.applyTheme('dark')` and a header toggle), plus theme tokens exposed as CSS variables.
- **Read-only mode** toggle (`editor.setEditable(false)`).
- **Zoom** controls (`editor.setZoom(0.25 – 3.0)`).
- **`EditorShell`** — one-call helper that mounts editor + toolbar + outline + status bar.
- **Web component** (`<rk-word-editor>`) with attributes for theme/outline/readonly/menubar/toolbar/statusbar.
- **Find &amp; Replace bar UI** with regex / whole-word / case toggles and live match counter.
- **Modal v2** — supports text, number, select, color, textarea, checkbox fields; ESC and click-out close; custom action buttons.
- **Auto-save helper** (`enableAutoSave(key, debounceMs)`) returns a disposer.
- **More import formats** — `.docx`, `.md`, `.markdown`, `.html`, `.htm`, `.txt`, `.json`.
- **More export formats** — `.docx`, `.md`, `.html`, `.json`, plus `print → save as PDF`.
- **Comprehensive `WordCountStats`** — words, characters, characters w/o spaces, paragraphs, sentences, estimated pages, reading-time minutes.
- Unified, elegant **SVG icon set** (~70 icons) used across menubar, toolbar, dialogs, status bar, find bar.

### Changed
- **All packages bumped to `4.0.0`** and re-aligned (peer dependencies use `^4.0.0`).
- Tiptap deps moved out of the root `package.json` into `@raazkhnl/rk-editor-core`.
- Build pipeline split: `tsconfig.json` for typechecking, `tsconfig.build.json` for `.d.ts` emit.
- `vite.config.*` rewritten — proper externals, named exports, sourcemaps, ES2020 target.
- Demo `vite.config.js` (CommonJS) → `vite.config.ts` (ESM).
- UI no longer ships emoji icons in the menus; everything is SVG.
- Toolbar layout reorganised into two clean rows with logical grouping.
- `WordEditorOptions.content` → `WordEditorOptions.initialContent` (legacy `content` still accepted).
- `CommandManager.exportDocx` / `printDoc` now route through the parent `WordEditor` instance.

### Fixed
- DOCX export no longer produces files Word refuses to open. Empty paragraphs, missing inline marks, and missing list/numbering definitions all fixed.
- Print no longer prints the entire web page — only the editor surface goes to the printer.
- Print now respects A4 portrait (and any other size you set) instead of relying on the browser's `auto` page size.
- Image resize handles no longer disappear when content scrolls.
- Tab/Shift-Tab no longer break out of nested lists.
- `enableAutoSave` debounces correctly and returns a disposer to remove the listener.

### Removed
- Stray log files, `.tgz` artifacts and orphan `.d.ts` files committed to the repo.
- `EditorShell` import path that didn't exist.
- The outdated `EditorShell` / React example from the old README.

## [3.5.0] — earlier

Last release of the 3.x line. See git history for details.
