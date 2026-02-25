import { WordEditor } from '@rk-editor/core';
import './styles.css';

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
  { label: 'Task List', action: e => e.format.taskList() },
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
      { label: '🖼 Image from PC', action: 'insertImage' },
      { label: '🔗 Link...', action: 'insertLink' },
      { sep: true },
      { label: '∑ Math (LaTeX)...', action: 'insertMath' },
      { label: '✂ Page Break', action: 'pageBreak' },
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
          ${this.buildMenu('References', [
      { label: 'TOC Insert Table of Contents', action: 'insertToc' },
      { label: '[ref] Citation...', action: 'insertCitation' },
      { label: '📚 Bibliography', action: 'insertBibliography' },
      { label: '† Footnote', action: 'insertFootnote' },
    ])}
          ${this.buildMenu('View', [
      { label: '📊 Word Count', action: 'wordCount' },
      { label: '🔍 Command Palette', action: 'cmdPalette', shortcut: 'Ctrl+K' },
    ])}

          <div class="rk-menubar-spacer"></div>
          <div class="rk-wordcount-display" id="rk-wc-display">0 words</div>
        </nav>

        <!-- === TOOLBAR === -->
        <div class="rk-toolbar" role="toolbar" aria-label="Formatting Toolbar">

          <!-- Undo/Redo -->
          <div class="rk-tb-group">
            <button id="undo-btn" title="Undo (Ctrl+Z)" aria-label="Undo">↺</button>
            <button id="redo-btn" title="Redo (Ctrl+Y)" aria-label="Redo">↻</button>
          </div>

          <!-- Font Family -->
          <div class="rk-tb-group">
            <select id="font-family" title="Font Family" aria-label="Font Family" class="rk-select-wide">
              <option value="">Font...</option>
              ${FONT_FAMILIES.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
            </select>
          </div>

          <!-- Font Size -->
          <div class="rk-tb-group">
            <select id="font-size" title="Font Size" aria-label="Font Size" class="rk-select-narrow">
              ${FONT_SIZES.map(s => `<option value="${s}pt" ${s === 12 ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>

          <!-- Heading Style -->
          <div class="rk-tb-group">
            <select id="heading-style" title="Paragraph Style" aria-label="Paragraph Style" class="rk-select-medium">
              <option value="p">Normal</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
              <option value="5">Heading 5</option>
              <option value="6">Heading 6</option>
            </select>
          </div>

          <!-- Character Formatting -->
          <div class="rk-tb-group">
            <button id="bold-btn" title="Bold (Ctrl+B)" aria-label="Bold"><b>B</b></button>
            <button id="italic-btn" title="Italic (Ctrl+I)" aria-label="Italic"><i>I</i></button>
            <button id="underline-btn" title="Underline (Ctrl+U)" aria-label="Underline" style="text-decoration:underline">U</button>
            <button id="strike-btn" title="Strikethrough" aria-label="Strikethrough" style="text-decoration:line-through">S</button>
            <button id="super-btn" title="Superscript" aria-label="Superscript">x²</button>
            <button id="sub-btn" title="Subscript" aria-label="Subscript">x₂</button>
          </div>

          <!-- Color Pickers -->
          <div class="rk-tb-group">
            <label class="rk-color-btn" title="Text Color" aria-label="Text Color">
              <span>A</span>
              <input type="color" id="text-color" value="#000000">
            </label>
            <label class="rk-color-btn rk-highlight-btn" title="Highlight Color" aria-label="Highlight Color">
              <span>H</span>
              <input type="color" id="highlight-color" value="#ffff00">
            </label>
          </div>

          <!-- Alignment -->
          <div class="rk-tb-group">
            <button id="align-left-btn" title="Align Left" aria-label="Align Left">⬅</button>
            <button id="align-center-btn" title="Align Center" aria-label="Align Center">↔</button>
            <button id="align-right-btn" title="Align Right" aria-label="Align Right">➡</button>
            <button id="align-justify-btn" title="Justify" aria-label="Justify">☰</button>
          </div>

          <!-- Lists -->
          <div class="rk-tb-group">
            <button id="bullet-list-btn" title="Bullet List" aria-label="Bullet List">•≡</button>
            <button id="ordered-list-btn" title="Numbered List" aria-label="Ordered List">1.≡</button>
            <button id="task-list-btn" title="Task List" aria-label="Task List">☑</button>
          </div>

          <!-- Indent -->
          <div class="rk-tb-group">
            <button id="indent-btn" title="Increase Indent" aria-label="Indent">→|</button>
            <button id="outdent-btn" title="Decrease Indent" aria-label="Outdent">|←</button>
          </div>

          <!-- Tables -->
          <div class="rk-tb-group">
            <button id="insert-table-btn" title="Insert Table" aria-label="Insert Table">⊞</button>
            <select id="table-actions" title="Table Actions" aria-label="Table Actions">
              <option value="">Table ▾</option>
              <option value="mergeOrSplit">Merge/Split</option>
              <option value="toggleHeaderRow">Header Row</option>
              <option value="addRowBefore">Row Above</option>
              <option value="addRowAfter">Row Below</option>
              <option value="deleteRow">Delete Row</option>
              <option value="addColumnBefore">Col Before</option>
              <option value="addColumnAfter">Col After</option>
              <option value="deleteColumn">Delete Col</option>
              <option value="deleteTable">Delete Table</option>
            </select>
          </div>

          <!-- Media -->
          <div class="rk-tb-group">
            <button id="upload-image-btn" title="Upload Image from PC" aria-label="Upload Image">🖼</button>
            <button id="insert-math-btn" title="Insert Math (LaTeX)" aria-label="Insert Math">∑</button>
          </div>

          <!-- Format Painter -->
          <div class="rk-tb-group">
            <button id="format-painter-btn" title="Format Painter" aria-label="Format Painter">🖌️</button>
          </div>

          <!-- Insert blocks -->
          <div class="rk-tb-group">
            <button id="page-break-btn" title="Page Break" aria-label="Page Break">✂</button>
            <button id="blockquote-btn" title="Blockquote" aria-label="Blockquote">"</button>
            <button id="hr-btn" title="Horizontal Rule" aria-label="Horizontal Rule">—</button>
          </div>

          <!-- References -->
          <div class="rk-tb-group">
            <button id="toc-btn" title="Table of Contents" aria-label="TOC">TOC</button>
            <button id="citation-btn" title="Insert Citation" aria-label="Citation">[ref]</button>
          </div>

          <!-- Track Changes -->
          <div class="rk-tb-group">
            <button id="track-changes-btn" title="Toggle Track Changes" aria-label="Track Changes">🔴 Track</button>
          </div>

          <!-- Export/Import -->
          <div class="rk-tb-group">
            <select id="export-format" title="Export" aria-label="Export Format">
              <option value="">Export ▾</option>
              <option value="docx">Word (.docx)</option>
              <option value="markdown">Markdown (.md)</option>
              <option value="html">HTML</option>
              <option value="pdf">PDF (Print)</option>
            </select>
          </div>

          <!-- Utilities -->
          <div class="rk-tb-group">
            <button id="wordcount-btn" title="Word Count" aria-label="Word Count">📊</button>
            <button id="clear-btn" title="Clear Formatting" aria-label="Clear Formatting">⊘</button>
            <button id="cmd-palette-btn" title="Command Palette (Ctrl+K)" aria-label="Command Palette">⌘</button>
          </div>
        </div>

        <!-- Hidden file input for import -->
        <input type="file" id="rk-import-input" accept=".docx,.md,.markdown,.html,.htm" style="display:none">

      </div>

      <!-- Command Palette Overlay -->
      <div class="rk-cmd-palette" id="rk-cmd-palette" role="dialog" aria-label="Command Palette" aria-modal="true" style="display:none">
        <div class="rk-cmd-palette-inner">
          <input type="text" id="rk-cmd-query" placeholder="Type a command..." aria-label="Command search" autocomplete="off">
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

  private setupEvents() {
    const ed = this.editor;
    const q = (s: string): HTMLElement | null => this.container.querySelector(s);

    // ---- Menu action dispatcher ----
    this.container.querySelectorAll('.rk-menu-item').forEach(btn => {
      btn.addEventListener('click', (e: any) => {
        const action = e.currentTarget.dataset.action;
        this.handleMenuAction(action);
        // Close menu
        btn.closest('.rk-menu')?.querySelector('.rk-menu-trigger')?.setAttribute('aria-expanded', 'false');
      });
    });

    // Menu trigger toggle
    this.container.querySelectorAll('.rk-menu-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e: any) => {
        const expanded = e.currentTarget.getAttribute('aria-expanded') === 'true';
        // Close all menus first
        this.container.querySelectorAll('.rk-menu-trigger').forEach(t =>
          t.setAttribute('aria-expanded', 'false')
        );
        e.currentTarget.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        e.stopPropagation();
      });
    });
    document.addEventListener('click', () => {
      this.container.querySelectorAll('.rk-menu-trigger').forEach(t =>
        t.setAttribute('aria-expanded', 'false')
      );
    });

    // ---- Toolbar events ----
    q('#undo-btn')?.addEventListener('click', () => ed.format.undo());
    q('#redo-btn')?.addEventListener('click', () => ed.format.redo());

    // Font family
    q('#font-family')?.addEventListener('change', (e: any) => {
      if (e.target.value) ed.format.fontFamily(e.target.value);
    });

    // Font size
    q('#font-size')?.addEventListener('change', (e: any) => {
      if (e.target.value) ed.format.fontSize(e.target.value);
    });

    // Heading style
    q('#heading-style')?.addEventListener('change', (e: any) => {
      const v = e.target.value;
      if (v === 'p') ed.format.paragraph();
      else ed.format.heading(parseInt(v) as any);
    });

    // Character formatting
    q('#bold-btn')?.addEventListener('click', () => ed.format.bold());
    q('#italic-btn')?.addEventListener('click', () => ed.format.italic());
    q('#underline-btn')?.addEventListener('click', () => ed.format.underline());
    q('#strike-btn')?.addEventListener('click', () => ed.format.strike());
    q('#super-btn')?.addEventListener('click', () => ed.format.superscript());
    q('#sub-btn')?.addEventListener('click', () => ed.format.subscript());

    // Colors
    q('#text-color')?.addEventListener('input', (e: any) => ed.format.setColor(e.target.value));
    q('#highlight-color')?.addEventListener('input', (e: any) => ed.format.highlight(e.target.value));

    // Alignment
    q('#align-left-btn')?.addEventListener('click', () => ed.format.align('left'));
    q('#align-center-btn')?.addEventListener('click', () => ed.format.align('center'));
    q('#align-right-btn')?.addEventListener('click', () => ed.format.align('right'));
    q('#align-justify-btn')?.addEventListener('click', () => ed.format.align('justify'));

    // Lists
    q('#bullet-list-btn')?.addEventListener('click', () => ed.format.bulletList());
    q('#ordered-list-btn')?.addEventListener('click', () => ed.format.orderedList());
    q('#task-list-btn')?.addEventListener('click', () => ed.format.taskList());

    // Indent
    q('#indent-btn')?.addEventListener('click', () => ed.format.indent());
    q('#outdent-btn')?.addEventListener('click', () => ed.format.outdent());

    // Tables
    q('#insert-table-btn')?.addEventListener('click', () => {
      const r = parseInt(prompt('Rows:', '3') || '3');
      const c = parseInt(prompt('Cols:', '3') || '3');
      if (r > 0 && c > 0) ed.format.insertTable({ rows: r, cols: c, withHeaderRow: true });
    });
    q('#table-actions')?.addEventListener('change', (e: any) => {
      const action = e.target.value;
      if (action && (ed.format as any)[action]) (ed.format as any)[action]();
      e.target.value = '';
    });

    // Media
    q('#upload-image-btn')?.addEventListener('click', () => {
      (ed.format as any).openImageUpload?.();
    });
    q('#insert-math-btn')?.addEventListener('click', () => {
      const latex = prompt('LaTeX expression:', 'E = mc^2');
      if (latex) (ed.format as any).insertMathInline(latex);
    });

    // Format painter
    q('#format-painter-btn')?.addEventListener('click', () => {
      (ed.format as any).startFormatPaint?.();
      q('#format-painter-btn')?.classList.toggle('is-active');
    });

    // Insert blocks
    q('#page-break-btn')?.addEventListener('click', () => ed.format.pageBreak());
    q('#blockquote-btn')?.addEventListener('click', () => ed.format.blockquote());
    q('#hr-btn')?.addEventListener('click', () => ed.format.horizontalRule());

    // References
    q('#toc-btn')?.addEventListener('click', () => (ed.format as any).insertTableOfContents?.());
    q('#citation-btn')?.addEventListener('click', () => {
      const key = prompt('Citation key:');
      if (key) (ed.format as any).insertCitation?.(key);
    });

    // Track changes
    q('#track-changes-btn')?.addEventListener('click', () => {
      ed.toggleTrackChanges();
      q('#track-changes-btn')?.classList.toggle('is-active', ed.isTrackingChanges());
    });

    // Export
    q('#export-format')?.addEventListener('change', (e: any) => {
      const format = e.target.value;
      if (format === 'docx') ed.exportDocx();
      else if (format === 'markdown') ed.exportMarkdown();
      else if (format === 'pdf') ed.format.printDoc();
      else if (format) ed.export(format as any);
      e.target.value = '';
    });

    // Import
    const importInput = this.container.querySelector('#rk-import-input') as HTMLInputElement;
    importInput?.addEventListener('change', async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          await ed.importFromFile(file);
        } catch (err: any) {
          alert(`Import failed: ${err.message}`);
        }
        importInput.value = '';
      }
    });

    // Word count
    q('#wordcount-btn')?.addEventListener('click', () => {
      const s = ed.getWordCount();
      alert(`Words: ${s.words}\nCharacters: ${s.characters}\nParagraphs: ${s.paragraphs}`);
    });

    // Clear formatting
    q('#clear-btn')?.addEventListener('click', () => ed.format.clearFormatting());

    // Command palette
    q('#cmd-palette-btn')?.addEventListener('click', () => this.openCommandPalette());

    // Command palette search
    const cmdQuery = document.getElementById('rk-cmd-query') as HTMLInputElement;
    cmdQuery?.addEventListener('input', (e: any) => {
      this.paletteQuery = e.target.value;
      this.renderPaletteResults();
    });
    cmdQuery?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.closeCommandPalette();
    });

    // Active state tracking
    ed.instance.on('transaction', () => this.updateActiveStates());
  }

  private handleMenuAction(action: string) {
    const ed = this.editor;
    const fmt = ed.format as any;
    const actions: Record<string, () => void> = {
      newDoc: () => { if (confirm('Clear document?')) ed.setDocument(''); },
      openImport: () => (document.getElementById('rk-import-input') as HTMLInputElement)?.click(),
      exportDocx: () => ed.exportDocx(),
      exportMd: () => ed.exportMarkdown(),
      exportHtml: () => ed.export('html'),
      printDoc: () => window.print(),
      undo: () => fmt.undo(),
      redo: () => fmt.redo(),
      cut: () => document.execCommand('cut'),
      copy: () => document.execCommand('copy'),
      paste: () => document.execCommand('paste'),
      formatPainter: () => fmt.startFormatPaint?.(),
      clearFormatting: () => fmt.clearFormatting(),
      trackChanges: () => { ed.toggleTrackChanges(); },
      insertTable: () => fmt.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
      insertImage: () => fmt.openImageUpload?.(),
      insertLink: () => { const u = prompt('URL:'); if (u) ed.instance.chain().focus().setLink({ href: u }).run(); },
      insertMath: () => { const l = prompt('LaTeX:'); if (l) fmt.insertMathInline(l); },
      pageBreak: () => fmt.pageBreak(),
      hr: () => fmt.horizontalRule(),
      blockquote: () => fmt.blockquote(),
      insertToc: () => fmt.insertTableOfContents?.(),
      insertCitation: () => { const k = prompt('Citation key:'); if (k) fmt.insertCitation?.(k); },
      insertFootnote: () => fmt.footnote?.(),
      insertBibliography: () => fmt.insertBibliography?.(),
      bold: () => fmt.bold(),
      italic: () => fmt.italic(),
      underline: () => fmt.underline(),
      strike: () => fmt.strike(),
      superscript: () => fmt.superscript(),
      subscript: () => fmt.subscript(),
      alignLeft: () => fmt.align('left'),
      alignCenter: () => fmt.align('center'),
      alignRight: () => fmt.align('right'),
      alignJustify: () => fmt.align('justify'),
      bulletList: () => fmt.bulletList(),
      orderedList: () => fmt.orderedList(),
      taskList: () => fmt.taskList(),
      wordCount: () => { const s = ed.getWordCount(); alert(`Words: ${s.words}\nChars: ${s.characters}\nParagraphs: ${s.paragraphs}`); },
      cmdPalette: () => this.openCommandPalette(),
    };
    actions[action]?.();
  }

  private openCommandPalette() {
    const palette = document.getElementById('rk-cmd-palette');
    if (!palette) return;
    palette.style.display = 'flex';
    this.paletteQuery = '';
    const input = document.getElementById('rk-cmd-query') as HTMLInputElement;
    input.value = '';
    this.renderPaletteResults();
    setTimeout(() => input.focus(), 10);
  }

  private closeCommandPalette() {
    const palette = document.getElementById('rk-cmd-palette');
    if (palette) palette.style.display = 'none';
  }

  private renderPaletteResults() {
    const results = document.getElementById('rk-cmd-results');
    if (!results) return;
    const q = this.paletteQuery.toLowerCase();
    const filtered = ALL_COMMANDS.filter(c => c.label.toLowerCase().includes(q));
    results.innerHTML = filtered.slice(0, 12).map((cmd, i) => `
      <div class="rk-cmd-item" role="option" data-index="${i}" tabindex="0">
        <span class="rk-cmd-item-label">${cmd.label}</span>
        ${cmd.shortcut ? `<span class="rk-cmd-item-shortcut">${cmd.shortcut}</span>` : ''}
      </div>
    `).join('') || `<div class="rk-cmd-empty">No commands found</div>`;

    results.querySelectorAll('.rk-cmd-item').forEach((el, i) => {
      el.addEventListener('click', () => {
        filtered[i]?.action(this.editor);
        this.closeCommandPalette();
      });
    });
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K = command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }
      // Escape = close palette
      if (e.key === 'Escape') {
        this.closeCommandPalette();
      }
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
    toggle('#super-btn', ed.isActive('superscript'));
    toggle('#sub-btn', ed.isActive('subscript'));
    toggle('#bullet-list-btn', ed.isActive('bulletList'));
    toggle('#ordered-list-btn', ed.isActive('orderedList'));
    toggle('#task-list-btn', ed.isActive('taskList'));
    toggle('#blockquote-btn', ed.isActive('blockquote'));
    toggle('#align-left-btn', ed.isActive({ textAlign: 'left' }));
    toggle('#align-center-btn', ed.isActive({ textAlign: 'center' }));
    toggle('#align-right-btn', ed.isActive({ textAlign: 'right' }));
    toggle('#align-justify-btn', ed.isActive({ textAlign: 'justify' }));
    toggle('#track-changes-btn', this.editor.isTrackingChanges());

    // Update heading select
    const headingSel = q('#heading-style') as HTMLSelectElement;
    if (headingSel) {
      if (ed.isActive('heading', { level: 1 })) headingSel.value = '1';
      else if (ed.isActive('heading', { level: 2 })) headingSel.value = '2';
      else if (ed.isActive('heading', { level: 3 })) headingSel.value = '3';
      else if (ed.isActive('heading', { level: 4 })) headingSel.value = '4';
      else if (ed.isActive('heading', { level: 5 })) headingSel.value = '5';
      else if (ed.isActive('heading', { level: 6 })) headingSel.value = '6';
      else headingSel.value = 'p';
    }
  }
}
