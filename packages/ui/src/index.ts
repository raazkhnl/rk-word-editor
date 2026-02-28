import { WordEditor } from '@rk-editor/core';
import { Modal } from './Modal';
import './styles.css';
import logoSrc from './assets/logo.png';

const FONT_FAMILIES = [
  // Web-safe
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { label: 'Impact', value: 'Impact, Charcoal, sans-serif' },
  // Modern / Google
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  // Devanagari / South Asian
  { label: 'Noto Sans Devanagari', value: '"Noto Sans Devanagari", sans-serif' },
  { label: 'Kalimati', value: 'Kalimati, sans-serif' },
  { label: 'Mangal', value: 'Mangal, sans-serif' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];

// All commands for the command palette
const ALL_COMMANDS: { label: string; shortcut?: string; action: (editor: any) => void }[] = [
  { label: 'Bold', shortcut: 'Ctrl+B', action: e => e.format.bold() },
  { label: 'Italic', shortcut: 'Ctrl+I', action: e => e.format.italic() },
  { label: 'Underline', shortcut: 'Ctrl+U', action: e => e.format.underline() },
  { label: 'Heading 1', shortcut: 'Ctrl+Alt+1', action: e => e.format.heading(1) },
  { label: 'Heading 2', shortcut: 'Ctrl+Alt+2', action: e => e.format.heading(2) },
  { label: 'Heading 3', shortcut: 'Ctrl+Alt+3', action: e => e.format.heading(3) },
  { label: 'Bullet List', action: e => e.format.bulletList() },
  { label: 'Numbered List', action: e => e.format.orderedList() },
  { label: 'Nepali Numbering', action: e => e.format.setListStyle('nepali') },
  { label: 'Task List', action: e => (e.instance.commands as any).toggleTaskList() },
  { label: 'Insert Table (3x3)', action: e => e.format.insertTable({ rows: 3, cols: 3, withHeaderRow: true }) },
  { label: 'Insert Image from PC', action: e => e.format.openImageUpload() },
  { label: 'Insert Math', action: e => { const l = prompt('LaTeX:'); if (l) e.format.insertMathInline(l); } },
  { label: 'Insert Table of Contents', action: e => e.format.insertTableOfContents() },
  { label: 'Insert Page Break', action: e => e.format.pageBreak() },
  { label: 'Insert Blockquote', action: e => e.format.blockquote() },
  { label: 'Insert Horizontal Rule', action: e => e.format.horizontalRule() },
  { label: 'Align Left', action: e => e.format.align('left') },
  { label: 'Align Center', action: e => e.format.align('center') },
  { label: 'Align Right', action: e => e.format.align('right') },
  { label: 'Align Justify', action: e => e.format.align('justify') },
  { label: 'Undo', shortcut: 'Ctrl+Z', action: e => e.format.undo() },
  { label: 'Redo', shortcut: 'Ctrl+Y', action: e => e.format.redo() },
  { label: 'Clear Formatting', action: e => e.format.clearFormatting() },
  { label: 'Format Painter', action: e => e.format.startFormatPaint() },
  { label: 'Toggle Track Changes', action: e => e.toggleTrackChanges() },
  { label: 'Export as DOCX', action: e => e.exportDocx() },
  { label: 'Export as Markdown', action: e => e.exportMarkdown() },
  { label: 'Export as HTML', action: e => e.export('html') },
  { label: 'Export PDF (Print)', action: e => e.format.printDoc() },
  { label: 'Import File (DOCX/MD)...', action: e => (document.getElementById('rk-import-input') as HTMLInputElement)?.click() },
  { label: 'Word Count', action: e => { const s = e.getWordCount(); alert(`Words: ${s.words}\nChars: ${s.characters}\nParagraphs: ${s.paragraphs}`); } },
];

const ICONS = {
  bold: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10.5 6.5h2.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-2.5v-3zm3.5 11h-3.5v-3.5h3.5c.97 0 1.75.78 1.75 1.75s-.78 1.75-1.75 1.75z"/></svg>',
  italic: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>',
  underline: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>',
  strike: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 19h4v-3h-4v3zM5 4v3h5v3H5v3h5v3H5v3h14v-3h-5v-3h5v-3h-5V7h5V4H5z"/></svg>',
  alignLeft: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>',
  alignCenter: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 15v2h10v-2H7zm-4-4v2h18v-2H3zm4-4v2h10V7H7zm-4-4v2h18V3H3zm0 16v2h18v-2H3z"/></svg>',
  alignRight: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 15v2h12v-2H9zm-6-4v2h18v-2H3zM9 7v2h12V7H9zm-6-4v2h18V3H3zm0 16v2h18v-2H3z"/></svg>',
  alignJustify: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V3H3v2z"/></svg>',
  bulletList: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>',
  orderedList: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>',
  nepaliList: '<svg viewBox="0 0 24 24" width="16" height="16"><text x="2" y="18" fill="currentColor" style="font-size:16px; font-weight:bold">१</text><path fill="currentColor" d="M7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>',
  taskList: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
  indent: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 5h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zM3 13h18v-2H3v2z"/></svg>',
  outdent: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 21h18v-2H3v2zm11-9l-4-4v8l4-4zm-3 1h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zM3 13h18v-2H3v2z"/></svg>',
  image: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
  table: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
};

export class WordToolbar {
  private container: HTMLElement;
  private editor: WordEditor;
  private paletteEl: HTMLElement | null = null;
  private paletteQuery = '';

  constructor(editor: WordEditor, container: HTMLElement) {
    this.editor = editor;
    this.container = container;
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <div class="rk-editor-shell">
        <!-- === MENU BAR === -->
        <nav class="rk-menubar" role="menubar" aria-label="Menu Bar">
          <div class="rk-brand-logo" style="display: flex; align-items: center; padding: 0 16px;">
            <img src="${logoSrc}" alt="RK Editor" style="height: 24px; object-fit: contain; margin-right: 8px;">
          </div>
          ${this.buildMenu('File', [
      { label: '📄 New Document', action: 'newDoc' },
      { label: '📂 Open / Import...', action: 'openImport' },
      { sep: true },
      { label: '💾 Export as DOCX', action: 'exportDocx' },
      { label: '📝 Export as Markdown', action: 'exportMd' },
      { label: '🌐 Export as HTML', action: 'exportHtml' },
      { label: '🖨️ Print / PDF', action: 'printDoc' },
    ])}
          ${this.buildMenu('Edit', [
      { label: '↺ Undo', action: 'undo', shortcut: 'Ctrl+Z' },
      { label: '↻ Redo', action: 'redo', shortcut: 'Ctrl+Y' },
      { sep: true },
      { label: '✂️ Cut', action: 'cut', shortcut: 'Ctrl+X' },
      { label: '📋 Copy', action: 'copy', shortcut: 'Ctrl+C' },
      { label: '📌 Paste', action: 'paste', shortcut: 'Ctrl+V' },
      { sep: true },
      { label: '🖌️ Format Painter', action: 'formatPainter' },
      { label: '⊘ Clear Formatting', action: 'clearFormatting' },
      { sep: true },
      { label: '🔴 Track Changes', action: 'trackChanges' },
    ])}
          ${this.buildMenu('Insert', [
      { label: '⊞ Table...', action: 'insertTable' },
      { label: '🏞 Image from PC', action: 'insertImage' },
      { label: '🔗 Link...', action: 'insertLink', shortcut: 'Ctrl+K' },
      { sep: true },
      { label: '∑ Math (LaTeX)...', action: 'insertMath' },
      { label: '✂ Page Break', action: 'pageBreak', shortcut: 'Ctrl+Enter' },
      { label: '— Horizontal Rule', action: 'hr' },
      { label: '" Blockquote', action: 'blockquote' },
      { sep: true },
      { label: 'TOC Table of Contents', action: 'insertToc' },
      { label: '[ref] Citation...', action: 'insertCitation' },
      { label: '† Footnote', action: 'insertFootnote' },
    ])}
          ${this.buildMenu('Format', [
      { label: '𝐁 Bold', action: 'bold', shortcut: 'Ctrl+B' },
      { label: '𝐼 Italic', action: 'italic', shortcut: 'Ctrl+I' },
      { label: 'U Underline', action: 'underline', shortcut: 'Ctrl+U' },
      { label: 'S Strikethrough', action: 'strike' },
      { sep: true },
      { label: 'x² Superscript', action: 'superscript' },
      { label: 'x₂ Subscript', action: 'subscript' },
      { sep: true },
      { label: '↔ Align Left', action: 'alignLeft' },
      { label: '↔ Align Center', action: 'alignCenter' },
      { label: '→ Align Right', action: 'alignRight' },
      { label: '☰ Justify', action: 'alignJustify' },
      { sep: true },
      { label: '• Bullet List', action: 'bulletList' },
      { label: '1. Numbered List', action: 'orderedList' },
      { label: '☑ Task List', action: 'taskList' },
    ])}
          ${this.buildMenu('Help', [
      { label: '⌨️ Keyboard Shortcuts', action: 'showShortcuts' },
      { label: 'ℹ️ About', action: 'showAbout' },
      { sep: true },
      { label: '⭐ GitHub Repository', action: 'openGithub' },
    ])}
          <div class="rk-menubar-spacer"></div>
          <div class="rk-wordcount-display" id="rk-wc-display">0 words</div>
        </nav>

        <!-- === TOOLBAR === -->
        <div class="rk-toolbar" role="toolbar" aria-label="Formatting Toolbar">
          <!-- Row 1: Core Formatting & Typography -->
          <div class="rk-toolbar-row">
            <div class="rk-toolbar-group" data-label="Nav">
              <button id="undo-btn" title="Undo (Ctrl+Z)" aria-label="Undo">↺</button>
              <button id="redo-btn" title="Redo (Ctrl+Y)" aria-label="Redo">↻</button>
            </div>

            <div class="rk-toolbar-group" data-label="Font">
              <select id="font-family" title="Font Family" class="rk-select-wide">
                <option value="">Font...</option>
                ${FONT_FAMILIES.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
              </select>
              <select id="font-size" title="Size" class="rk-select-narrow">
                ${FONT_SIZES.map(s => `<option value="${s}pt" ${s === 12 ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <select id="heading-style" title="Style" class="rk-select-medium">
                <option value="p">Normal</option>
                <option value="1">H1</option>
                <option value="2">H2</option>
                <option value="3">H3</option>
              </select>
            </div>

            <div class="rk-toolbar-group" data-label="Basic">
              <button id="bold-btn" title="Bold (Ctrl+B)" aria-label="Bold"><b>B</b></button>
              <button id="italic-btn" title="Italic (Ctrl+I)" aria-label="Italic"><i>I</i></button>
              <button id="underline-btn" title="Underline (Ctrl+U)" aria-label="Underline"><u>U</u></button>
              <button id="strike-btn" title="Strike" aria-label="Strikethrough">S</button>
            </div>

            <div class="rk-toolbar-group" data-label="Scripts">
              <button id="sup-btn" title="Superscript" aria-label="Superscript">x²</button>
              <button id="sub-btn" title="Subscript" aria-label="Subscript">x₂</button>
            </div>
            
            <div class="rk-toolbar-group" data-label="Para">
              <button id="align-left-btn" title="Left" aria-label="Align Left">${ICONS.alignLeft}</button>
              <button id="align-center-btn" title="Center" aria-label="Align Center">${ICONS.alignCenter}</button>
              <button id="align-right-btn" title="Right" aria-label="Align Right">${ICONS.alignRight}</button>
              <button id="align-justify-btn" title="Justify" aria-label="Align Justify">${ICONS.alignJustify}</button>
            </div>

            <div class="rk-toolbar-group" data-label="Lists">
              <button id="bullet-list-btn" title="Bullets" aria-label="Bullet List">${ICONS.bulletList}</button>
              <button id="ordered-list-btn" title="Numbers" aria-label="Numbered List">${ICONS.orderedList}</button>
              <button id="nepali-list-btn" title="Nepali" aria-label="Nepali Numbered List">${ICONS.nepaliList}</button>
              <button id="task-list-btn" title="Tasks" aria-label="Task List">${ICONS.taskList}</button>
              <button id="indent-btn" title="Indent" aria-label="Increase Indent">${ICONS.indent}</button>
              <button id="outdent-btn" title="Outdent" aria-label="Decrease Indent">${ICONS.outdent}</button>
            </div>
          </div>

          <!-- Row 2: Tables, Colors, Inserts & Exports -->
          <div class="rk-toolbar-row">
            <div class="rk-toolbar-group" data-label="Table">
              <button id="insert-table-btn" title="Insert Table" aria-label="Insert Table">⊞</button>
              ${this.buildToolbarMenu('Props', [
      { label: 'Row Before', action: 'addRowBefore' },
      { label: 'Row After', action: 'addRowAfter' },
      { sep: true },
      { label: 'Col Before', action: 'addColBefore' },
      { label: 'Col After', action: 'addColAfter' },
      { sep: true },
      { label: 'Delete Row', action: 'delRow' },
      { label: 'Delete Col', action: 'delCol' },
      { label: 'Delete Table', action: 'delTable' },
      { sep: true },
      { label: 'Merge Cells', action: 'mergeCells' },
      { label: 'Split Cell', action: 'splitCell' },
      { sep: true },
      { label: 'Toggle Header Row', action: 'toggleHeaderRow' },
      { label: 'Toggle Header Col', action: 'toggleHeaderCol' },
    ])}
            </div>

            <div class="rk-toolbar-group" data-label="Color">
              <input type="color" id="text-color" title="Color">
              <input type="color" id="highlight-color" title="Highlight" value="#ffff00">
            </div>

            <div class="rk-toolbar-group" data-label="Insert">
              <button id="upload-image-btn" title="Image">${ICONS.image}</button>
              <button id="insert-link-btn" title="Link">🔗</button>
              <button id="insert-citation-btn" title="Citation">[ref]</button>
              <button id="insert-math-btn" title="Math">∑</button>
              <button id="insert-footnote-btn" title="Footnote">_🖋</button>
              <button id="toc-btn" title="TOC">☰</button>
              <button id="page-number-btn" title="Page Number">#️⃣</button>
              <button id="page-break-btn" title="Break">✂</button>
            </div>

            <div class="rk-toolbar-group" data-label="Track">
              <button id="track-changes-btn" title="Track Changes">🔴</button>
              <button id="clear-format-btn" title="Clear Formatting">⊘</button>
            </div>

            <div class="rk-toolbar-group" data-label="Export">
              <select id="export-format" class="rk-select-narrow">
                <option value="">Exp.</option>
                <option value="docx">DOCX</option>
                <option value="pdf">PDF</option>
                <option value="markdown">MD</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Hidden file input for import -->
        <input type="file" id="rk-import-input" accept=".docx,.md,.markdown,.html,.htm" style="display:none">

      </div>

      <!-- Command Palette Overlay -->
      <div class="rk-cmd-palette" id="rk-cmd-palette" role="dialog" aria-modal="true" style="display:none">
        <div class="rk-cmd-palette-inner">
          <input type="text" id="rk-cmd-query" placeholder="Type a command..." autocomplete="off">
          <div class="rk-cmd-palette-results" id="rk-cmd-results" role="listbox"></div>
        </div>
      </div>
    `;

    this.setupEvents();
    this.setupKeyboardShortcuts();
    this.setupWordCountDisplay();
  }

  private buildMenu(label: string, items: any[]): string {
    const itemsHtml = items.map(item => {
      if (item.sep) return `<div class="rk-menu-sep"></div>`;
      return `
        <button class="rk-menu-item" data-action="${item.action}">
          <span class="rk-menu-item-label">${item.label}</span>
          ${item.shortcut ? `<span class="rk-menu-item-shortcut">${item.shortcut}</span>` : ''}
        </button>
      `;
    }).join('');

    return `
      <div class="rk-menu" role="menuitem">
        <button class="rk-menu-trigger" aria-haspopup="true" aria-expanded="false">${label}</button>
        <div class="rk-menu-dropdown" role="menu">${itemsHtml}</div>
      </div>
    `;
  }

  private buildToolbarMenu(label: string, items: any[]): string {
    const itemsHtml = items.map(item => {
      if (item.sep) return `<div class="rk-menu-sep"></div>`;
      return `<button class="rk-toolbar-menu-item" data-action="${item.action}" role="menuitem">${item.label}</button>`;
    }).join('');

    return `
      <div class="rk-toolbar-menu">
        <button class="rk-toolbar-menu-trigger" aria-haspopup="true" aria-expanded="false">${label} ▾</button>
        <div class="rk-toolbar-menu-dropdown" role="menu">${itemsHtml}</div>
      </div>
    `;
  }

  private setupEvents() {
    const ed = this.editor;
    const q = (s: string): HTMLElement | null => this.container.querySelector(s) as HTMLElement | null;

    // Menu trigger toggle
    this.container.querySelectorAll('.rk-menu-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e: any) => {
        const expanded = e.currentTarget.getAttribute('aria-expanded') === 'true';
        this.container.querySelectorAll('.rk-menu-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
        e.currentTarget.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        e.stopPropagation();
      });
    });

    this.container.querySelectorAll('.rk-menu-item, .rk-toolbar-menu-item').forEach(btn => {
      btn.addEventListener('click', (e: any) => {
        const action = e.currentTarget.dataset.action;
        this.handleMenuAction(action);
        btn.closest('.rk-menu, .rk-toolbar-menu')?.querySelectorAll('.rk-menu-trigger')?.forEach(t => t.setAttribute('aria-expanded', 'false'));
      });
    });

    document.addEventListener('click', () => {
      this.container.querySelectorAll('.rk-menu-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
    });

    // Toolbar events
    q('#undo-btn')?.addEventListener('click', () => ed.format.undo());
    q('#redo-btn')?.addEventListener('click', () => ed.format.redo());

    q('#font-family')?.addEventListener('change', (e: any) => {
      if (e.target.value) ed.format.fontFamily(e.target.value);
    });

    q('#font-size')?.addEventListener('change', (e: any) => {
      if (e.target.value) ed.format.fontSize(e.target.value);
    });

    q('#heading-style')?.addEventListener('change', (e: any) => {
      const v = e.target.value;
      if (v === 'p') ed.format.paragraph();
      else ed.format.heading(parseInt(v) as any);
    });

    q('#bold-btn')?.addEventListener('click', () => ed.format.bold());
    q('#italic-btn')?.addEventListener('click', () => ed.format.italic());
    q('#underline-btn')?.addEventListener('click', () => ed.format.underline());
    q('#strike-btn')?.addEventListener('click', () => ed.format.strike());
    q('#sup-btn')?.addEventListener('click', () => ed.format.superscript());
    q('#sub-btn')?.addEventListener('click', () => ed.format.subscript());

    q('#align-left-btn')?.addEventListener('click', () => ed.format.align('left'));
    q('#align-center-btn')?.addEventListener('click', () => ed.format.align('center'));
    q('#align-right-btn')?.addEventListener('click', () => ed.format.align('right'));
    q('#align-justify-btn')?.addEventListener('click', () => ed.format.align('justify'));

    q('#bullet-list-btn')?.addEventListener('click', () => ed.format.bulletList());
    q('#ordered-list-btn')?.addEventListener('click', () => ed.format.orderedList());
    q('#nepali-list-btn')?.addEventListener('click', () => ed.format.setListStyle('nepali'));
    q('#task-list-btn')?.addEventListener('click', () => (ed.instance.commands as any).toggleTaskList());
    q('#indent-btn')?.addEventListener('click', () => ed.format.indent());
    q('#outdent-btn')?.addEventListener('click', () => ed.format.outdent());

    q('#text-color')?.addEventListener('input', (e: any) => ed.format.setColor(e.target.value));
    q('#highlight-color')?.addEventListener('input', (e: any) => ed.format.setHighlight(e.target.value));

    q('#insert-table-btn')?.addEventListener('click', () => {
      new Modal({
        title: 'Insert Table',
        fields: [
          { id: 'rows', label: 'Rows', type: 'number', value: 3 },
          { id: 'cols', label: 'Columns', type: 'number', value: 3 },
        ],
        onConfirm: (data) => ed.format.insertTable({ rows: parseInt(data.rows), cols: parseInt(data.cols) }),
      }).show();
    });

    q('#insert-link-btn')?.addEventListener('click', () => {
      new Modal({
        title: 'Insert Link',
        fields: [
          { id: 'url', label: 'URL', type: 'text', value: 'https://' },
          { id: 'text', label: 'Display Text (Optional)', type: 'text' },
        ],
        onConfirm: (data) => {
          if (data.url) {
            (ed.instance.chain().focus() as any).setLink({ href: data.url }).run();
          }
        },
      }).show();
    });

    q('#insert-math-btn')?.addEventListener('click', () => {
      new Modal({
        title: 'Insert Math (LaTeX)',
        fields: [
          { id: 'latex', label: 'LaTeX Expression', type: 'text', value: 'E=mc^2' },
        ],
        onConfirm: (data) => ed.format.insertMathInline(data.latex),
      }).show();
    });

    q('#insert-footnote-btn')?.addEventListener('click', () => {
      new Modal({
        title: 'Insert Footnote',
        fields: [
          { id: 'text', label: 'Footnote Text', type: 'text' },
        ],
        onConfirm: (data) => ed.format.footnote(data.text),
      }).show();
    });

    q('#insert-citation-btn')?.addEventListener('click', () => {
      new Modal({
        title: 'Insert Citation',
        fields: [
          { id: 'key', label: 'Citation Key', type: 'text' },
          { id: 'label', label: 'Label (Optional)', type: 'text' },
        ],
        onConfirm: (data) => ed.format.insertCitation(data.key, data.label || undefined),
      }).show();
    });

    q('#toc-btn')?.addEventListener('click', () => ed.format.insertTableOfContents());
    q('#page-number-btn')?.addEventListener('click', () => ed.format.insertFooter());
    q('#page-break-btn')?.addEventListener('click', () => ed.format.pageBreak());
    q('#clear-format-btn')?.addEventListener('click', () => ed.format.clearFormatting());
    q('#upload-image-btn')?.addEventListener('click', () => ed.format.openImageUpload());

    q('#track-changes-btn')?.addEventListener('click', () => {
      ed.toggleTrackChanges();
      this.updateActiveStates();
    });

    q('#export-format')?.addEventListener('change', (e: any) => {
      const format = e.target.value;
      if (format === 'docx') ed.exportDocx();
      else if (format === 'pdf') ed.format.printDoc();
      else if (format === 'markdown') (ed as any).exportMarkdown();
      e.target.value = '';
    });

    const importInput = this.container.querySelector('#rk-import-input') as HTMLInputElement;
    importInput?.addEventListener('change', async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try { await (ed as any).importFromFile(file); } catch (err: any) { alert(`Import failed: ${err.message}`); }
        importInput.value = '';
      }
    });

    ed.instance.on('transaction', () => this.updateActiveStates());
  }

  private handleMenuAction(action: string) {
    const ed = this.editor;
    const q = (s: string): HTMLElement | null => this.container.querySelector(s) as HTMLElement | null;
    switch (action) {
      case 'newDoc': ed.instance.commands.setContent('<p></p>'); break;
      case 'openImport': (this.container.querySelector('#rk-import-input') as HTMLInputElement)?.click(); break;
      case 'exportDocx': ed.exportDocx(); break;
      case 'exportMd': (ed as any).exportMarkdown(); break;
      case 'exportHtml': (ed as any).export('html'); break;
      case 'printDoc': ed.format.printDoc(); break;
      case 'undo': ed.format.undo(); break;
      case 'redo': ed.format.redo(); break;
      case 'bold': ed.format.bold(); break;
      case 'italic': ed.format.italic(); break;
      case 'underline': ed.format.underline(); break;
      case 'strike': ed.format.strike(); break;
      case 'superscript': ed.format.superscript(); break;
      case 'subscript': ed.format.subscript(); break;
      case 'alignLeft': ed.format.align('left'); break;
      case 'alignCenter': ed.format.align('center'); break;
      case 'alignRight': ed.format.align('right'); break;
      case 'alignJustify': ed.format.align('justify'); break;
      case 'bulletList': ed.format.bulletList(); break;
      case 'orderedList': ed.format.orderedList(); break;
      case 'clearFormatting': ed.format.clearFormatting(); break;
      case 'trackChanges': (ed as any).toggleTrackChanges(); break;
      case 'insertTable': ed.format.insertTable({ rows: 3, cols: 3 }); break;
      case 'insertLink': q('#insert-link-btn')?.click(); break;
      case 'insertToc': ed.format.insertTableOfContents(); break;
      case 'insertMath': q('#insert-math-btn')?.click(); break;
      case 'insertFootnote': q('#insert-footnote-btn')?.click(); break;
      case 'insertCitation': q('#insert-citation-btn')?.click(); break;
      case 'insertImage': ed.format.openImageUpload(); break;
      case 'pageBreak': ed.format.pageBreak(); break;
      case 'hr': ed.format.horizontalRule(); break;
      case 'blockquote': ed.format.blockquote(); break;
      case 'addRowBefore': ed.format.addRowBefore(); break;
      case 'addRowAfter': ed.format.addRowAfter(); break;
      case 'delRow': ed.format.deleteRow(); break;
      case 'addColBefore': ed.format.addColumnBefore(); break;
      case 'addColAfter': ed.format.addColumnAfter(); break;
      case 'delCol': ed.format.deleteColumn(); break;
      case 'delTable': ed.format.deleteTable(); break;
      case 'mergeCells': ed.format.mergeCells(); break;
      case 'splitCell': ed.format.splitCell(); break;
      case 'toggleHeaderRow': ed.format.toggleHeaderRow(); break;
      case 'toggleHeaderCol': ed.format.toggleHeaderColumn(); break;
      case 'showShortcuts':
        new Modal({
          title: 'Keyboard Shortcuts',
          description: `<strong>Ctrl+B</strong>: Bold\n<strong>Ctrl+I</strong>: Italic\n<strong>Ctrl+U</strong>: Underline\n<strong>Ctrl+Z</strong>: Undo\n<strong>Ctrl+Y</strong>: Redo\n<strong>Ctrl+K</strong>: Insert Link\n<strong>Ctrl+Enter</strong>: Insert Page Break`
        }).show();
        break;
      case 'showAbout':
        new Modal({
          title: 'About RK Word Editor',
          description: `A powerful, modern rich-text editor built with Tiptap. Includes DOCX and Markdown integration, print-ready layouts, and track changes.\n\n<strong>Author:</strong> Raaz Khanal (@raazkhnl)\n<strong>Version:</strong> 3.2.1`
        }).show();
        break;
      case 'openGithub':
        window.open('https://github.com/raazkhnl/rk-word-editor', '_blank');
        break;
    }
    this.updateActiveStates();
  }

  private openCommandPalette() {
    const el = document.getElementById('rk-cmd-palette');
    if (el) { el.style.display = 'flex'; document.getElementById('rk-cmd-query')?.focus(); }
  }

  private closeCommandPalette() {
    const el = document.getElementById('rk-cmd-palette');
    if (el) el.style.display = 'none';
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); this.openCommandPalette(); }
      if (e.key === 'Escape') this.closeCommandPalette();
    });
  }

  private setupWordCountDisplay() {
    const updateWc = () => {
      const stats = this.editor.getWordCount();
      const el = document.getElementById('rk-wc-display');
      if (el) el.textContent = `${stats.words} words`;
    };
    this.editor.instance.on('update', updateWc);
    updateWc();
  }

  private updateActiveStates() {
    const ed = this.editor.instance;
    const q = (s: string) => this.container.querySelector(s);
    const toggle = (s: string, active: boolean) => {
      const btn = q(s);
      if (btn) btn.classList.toggle('is-active', active);
    };

    toggle('#bold-btn', ed.isActive('bold'));
    toggle('#italic-btn', ed.isActive('italic'));
    toggle('#underline-btn', ed.isActive('underline'));
    toggle('#strike-btn', ed.isActive('strike'));
    toggle('#sup-btn', ed.isActive('superscript'));
    toggle('#sub-btn', ed.isActive('subscript'));
    toggle('#bullet-list-btn', ed.isActive('bulletList'));
    toggle('#ordered-list-btn', ed.isActive('orderedList'));
    toggle('#align-left-btn', ed.isActive({ textAlign: 'left' }));
    toggle('#align-center-btn', ed.isActive({ textAlign: 'center' }));
    toggle('#align-right-btn', ed.isActive({ textAlign: 'right' }));
    toggle('#align-justify-btn', ed.isActive({ textAlign: 'justify' }));
    toggle('#track-changes-btn', (this.editor as any).isTrackingChanges?.() || false);

    const headingSel = q('#heading-style') as HTMLSelectElement;
    if (headingSel) {
      if (ed.isActive('heading', { level: 1 })) headingSel.value = '1';
      else if (ed.isActive('heading', { level: 2 })) headingSel.value = '2';
      else if (ed.isActive('heading', { level: 3 })) headingSel.value = '3';
      else headingSel.value = 'p';
    }
  }
}

export * from './web-component';
