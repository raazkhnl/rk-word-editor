import { WordEditor } from '@rk-editor/core';
import { Modal } from './Modal';
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
      { label: '🏞 Image from PC', action: 'insertImage' },
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
          <div class="rk-menubar-spacer"></div>
          <div class="rk-wordcount-display" id="rk-wc-display">0 words</div>
        </nav>

        <!-- === TOOLBAR === -->
        <div class="rk-toolbar" role="toolbar" aria-label="Formatting Toolbar">
          <!-- Row 1: Core Formatting & Typography -->
          <div class="rk-toolbar-row">
            <div class="rk-toolbar-group" data-label="Nav">
              <button id="undo-btn" title="Undo (Ctrl+Z)">↺</button>
              <button id="redo-btn" title="Redo (Ctrl+Y)">↻</button>
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
              <button id="bold-btn" title="Bold (Ctrl+B)"><b>B</b></button>
              <button id="italic-btn" title="Italic (Ctrl+I)"><i>I</i></button>
              <button id="underline-btn" title="Underline (Ctrl+U)"><u>U</u></button>
              <button id="strike-btn" title="Strike">S</button>
            </div>

            <div class="rk-toolbar-group" data-label="Scripts">
              <button id="sup-btn" title="Superscript">x²</button>
              <button id="sub-btn" title="Subscript">x₂</button>
            </div>
            
            <div class="rk-toolbar-group" data-label="Para">
              <button id="align-left-btn" title="Left">L</button>
              <button id="align-center-btn" title="Center">C</button>
              <button id="align-right-btn" title="Right">R</button>
              <button id="align-justify-btn" title="Justify">J</button>
            </div>

            <div class="rk-toolbar-group" data-label="Lists">
              <button id="bullet-list-btn" title="Bullets">•</button>
              <button id="ordered-list-btn" title="Numbers">1.</button>
              <button id="indent-btn" title="Indent">⇥</button>
              <button id="outdent-btn" title="Outdent">⇤</button>
            </div>
          </div>

          <!-- Row 2: Tables, Colors, Inserts & Exports -->
          <div class="rk-toolbar-row">
            <div class="rk-toolbar-group" data-label="Table">
              <button id="insert-table-btn" title="Insert Table">⊞</button>
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
              <button id="upload-image-btn" title="Image">🏞</button>
              <button id="insert-link-btn" title="Link">🔗</button>
              <button id="insert-math-btn" title="Math">∑</button>
              <button id="insert-footnote-btn" title="Footnote">_🖋</button>
              <button id="toc-btn" title="TOC">☰</button>
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
      return `<button class="rk-toolbar-menu-item" data-action="${item.action}">${item.label}</button>`;
    }).join('');

    return `
      <div class="rk-toolbar-menu">
        <button class="rk-toolbar-menu-trigger">${label} ▾</button>
        <div class="rk-toolbar-menu-dropdown">${itemsHtml}</div>
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
    q('#indent-btn')?.addEventListener('click', () => ed.format.indent());
    q('#outdent-btn')?.addEventListener('click', () => ed.format.outdent());

    q('#text-color')?.addEventListener('input', (e: any) => ed.format.setColor(e.target.value));
    q('#highlight-color')?.addEventListener('input', (e: any) => ed.format.setHighlight(e.target.value));

    q('#insert-table-btn')?.addEventListener('click', () => ed.format.insertTable({ rows: 3, cols: 3 }));
    q('#upload-image-btn')?.addEventListener('click', () => (q('#rk-import-input') as HTMLInputElement)?.click());

    q('#insert-link-btn')?.addEventListener('click', () => {
      const u = prompt('Enter URL:');
      if (u) (ed.instance.chain().focus() as any).setLink({ href: u }).run();
    });

    q('#insert-math-btn')?.addEventListener('click', () => {
      const l = prompt('Enter LaTeX:');
      if (l) ed.format.insertMathInline(l);
    });

    q('#insert-footnote-btn')?.addEventListener('click', () => ed.format.footnote());
    q('#toc-btn')?.addEventListener('click', () => (ed as any).insertTableOfContents?.());
    q('#page-break-btn')?.addEventListener('click', () => ed.format.pageBreak());
    q('#clear-format-btn')?.addEventListener('click', () => ed.format.clearFormatting());

    q('#track-changes-btn')?.addEventListener('click', () => {
      (ed as any).toggleTrackChanges();
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
      case 'insertToc': (ed as any).insertTableOfContents(); break;
      case 'insertImage': (q('#rk-import-input') as HTMLInputElement)?.click(); break;
      case 'pageBreak': ed.format.pageBreak(); break;
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
