import { WordEditor } from '@rk-editor/core';
import './styles.css';

export class WordToolbar {
  private container: HTMLElement;
  private editor: WordEditor;

  constructor(editor: WordEditor, container: HTMLElement) {
    this.editor = editor;
    this.container = container;
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <div class="rk-toolbar" role="toolbar" aria-label="Editor Toolbar">

        <!-- Undo/Redo -->
        <div class="rk-toolbar-group">
          <button id="undo-btn" title="Undo (Ctrl+Z)" aria-label="Undo">↺</button>
          <button id="redo-btn" title="Redo (Ctrl+Y)" aria-label="Redo">↻</button>
        </div>

        <!-- Paragraph Style -->
        <div class="rk-toolbar-group">
          <select id="heading-style" title="Paragraph Style" aria-label="Paragraph Style">
            <option value="paragraph">Normal</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>
        </div>

        <!-- Character Formatting -->
        <div class="rk-toolbar-group">
          <button id="bold-btn" title="Bold (Ctrl+B)" aria-label="Bold"><b>B</b></button>
          <button id="italic-btn" title="Italic (Ctrl+I)" aria-label="Italic"><i>I</i></button>
          <button id="underline-btn" title="Underline (Ctrl+U)" aria-label="Underline"><u>U</u></button>
          <button id="strike-btn" title="Strikethrough" aria-label="Strikethrough"><s>S</s></button>
          <button id="code-btn" title="Inline Code" aria-label="Code">&lt;/&gt;</button>
        </div>

        <!-- Alignment -->
        <div class="rk-toolbar-group">
          <button id="align-left-btn" title="Align Left" aria-label="Align Left">⬅</button>
          <button id="align-center-btn" title="Align Center" aria-label="Align Center">↔</button>
          <button id="align-right-btn" title="Align Right" aria-label="Align Right">➡</button>
          <button id="align-justify-btn" title="Justify" aria-label="Justify">☰</button>
        </div>

        <!-- Lists -->
        <div class="rk-toolbar-group">
          <button id="bullet-list-btn" title="Bullet List" aria-label="Bullet List">•</button>
          <button id="ordered-list-btn" title="Numbered List" aria-label="Ordered List">1.</button>
          <button id="task-list-btn" title="Task List (Checkboxes)" aria-label="Task List">☑</button>
          <select id="list-style" title="List Style" aria-label="List Style">
            <option value="">List Style...</option>
            <option value="disc">Disc</option>
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="decimal">Decimal (1.1.1)</option>
            <option value="lower-alpha">Alpha (a, b, c)</option>
            <option value="upper-roman">Roman (I, II, III)</option>
          </select>
        </div>

        <!-- Indentation -->
        <div class="rk-toolbar-group">
          <button id="indent-btn" title="Increase Indent" aria-label="Indent">→</button>
          <button id="outdent-btn" title="Decrease Indent" aria-label="Outdent">←</button>
        </div>

        <!-- Tables (Phase 5) -->
        <div class="rk-toolbar-group">
          <button id="insert-table-btn" title="Insert Table" aria-label="Insert Table">⊞</button>
          <select id="table-actions" title="Table Actions" aria-label="Table Actions">
            <option value="">Table Actions...</option>
            <option value="mergeOrSplit">Merge / Split Cells</option>
            <option value="toggleHeaderRow">Toggle Header Row</option>
            <option value="addRowBefore">Add Row Above</option>
            <option value="addRowAfter">Add Row Below</option>
            <option value="deleteRow">Delete Row</option>
            <option value="addColumnBefore">Add Column Before</option>
            <option value="addColumnAfter">Add Column After</option>
            <option value="deleteColumn">Delete Column</option>
            <option value="deleteTable">Delete Table</option>
          </select>
        </div>

        <!-- Media (Phase 7) -->
        <div class="rk-toolbar-group">
          <button id="insert-image-btn" title="Insert Image" aria-label="Insert Image">🖼</button>
          <button id="insert-math-btn" title="Insert Math (LaTeX)" aria-label="Insert Math">∑</button>
        </div>

        <!-- Insert -->
        <div class="rk-toolbar-group">
          <button id="page-break-btn" title="Page Break" aria-label="Page Break">✂</button>
          <button id="blockquote-btn" title="Blockquote" aria-label="Blockquote">"</button>
          <button id="hr-btn" title="Horizontal Rule" aria-label="Horizontal Rule">—</button>
        </div>

        <!-- References (Phase 8) -->
        <div class="rk-toolbar-group">
          <button id="toc-btn" title="Insert Table of Contents" aria-label="Table of Contents">TOC</button>
          <button id="citation-btn" title="Insert Citation" aria-label="Citation">[ref]</button>
        </div>

        <!-- Export -->
        <div class="rk-toolbar-group">
          <select id="export-format" title="Export Document" aria-label="Export Format">
            <option value="">Export As...</option>
            <option value="html">HTML</option>
            <option value="pdf">PDF (Print)</option>
            <option value="docx">Word (.docx)</option>
          </select>
        </div>

        <!-- Utilities -->
        <div class="rk-toolbar-group">
          <button id="wordcount-btn" title="Word Count" aria-label="Word Count">📊</button>
          <button id="clear-btn" title="Clear Formatting" aria-label="Clear Formatting">⊘</button>
        </div>

      </div>
    `;

    this.setupEvents();
  }

  private setupEvents() {
    const editor = this.editor;
    const query = (s: string) => this.container.querySelector(s);

    // Undo / Redo
    query('#undo-btn')?.addEventListener('click', () => editor.format.undo());
    query('#redo-btn')?.addEventListener('click', () => editor.format.redo());

    // Character formatting
    query('#bold-btn')?.addEventListener('click', () => editor.format.bold());
    query('#italic-btn')?.addEventListener('click', () => editor.format.italic());
    query('#underline-btn')?.addEventListener('click', () => editor.format.underline());
    query('#strike-btn')?.addEventListener('click', () => editor.format.strike());
    query('#code-btn')?.addEventListener('click', () => editor.format.code());

    // Alignment
    query('#align-left-btn')?.addEventListener('click', () => editor.format.align('left'));
    query('#align-center-btn')?.addEventListener('click', () => editor.format.align('center'));
    query('#align-right-btn')?.addEventListener('click', () => editor.format.align('right'));
    query('#align-justify-btn')?.addEventListener('click', () => editor.format.align('justify'));

    // Lists
    query('#bullet-list-btn')?.addEventListener('click', () => editor.format.bulletList());
    query('#ordered-list-btn')?.addEventListener('click', () => editor.format.orderedList());
    query('#task-list-btn')?.addEventListener('click', () => editor.format.taskList());
    query('#list-style')?.addEventListener('change', (e: any) => {
      const style = e.target.value;
      if (style) editor.format.setListStyle(style);
      e.target.value = '';
    });

    // Indentation
    query('#indent-btn')?.addEventListener('click', () => editor.format.indent());
    query('#outdent-btn')?.addEventListener('click', () => editor.format.outdent());

    // Paragraph style
    query('#heading-style')?.addEventListener('change', (e: any) => {
      const val = e.target.value;
      if (val === 'paragraph') editor.format.paragraph();
      else editor.format.heading(parseInt(val) as any);
    });

    // Tables
    query('#insert-table-btn')?.addEventListener('click', () => {
      const rows = parseInt(prompt('Rows:', '3') || '0');
      const cols = parseInt(prompt('Cols:', '3') || '0');
      if (rows > 0 && cols > 0) editor.format.insertTable({ rows, cols, withHeaderRow: true });
    });

    query('#table-actions')?.addEventListener('change', (e: any) => {
      const action = e.target.value;
      if (action && (editor.format as any)[action]) {
        (editor.format as any)[action]();
      }
      e.target.value = '';
    });

    // Media
    query('#insert-image-btn')?.addEventListener('click', () => {
      const url = prompt('Image URL:', 'https://picsum.photos/400/300');
      if (url) editor.format.insertImage(url);
    });

    query('#insert-math-btn')?.addEventListener('click', () => {
      const latex = prompt('LaTeX expression:', 'E = mc^2');
      if (latex) editor.format.insertMathInline(latex);
    });

    // Insert blocks
    query('#page-break-btn')?.addEventListener('click', () => editor.format.pageBreak());
    query('#blockquote-btn')?.addEventListener('click', () => editor.format.blockquote());
    query('#hr-btn')?.addEventListener('click', () => editor.format.horizontalRule());

    // References
    query('#toc-btn')?.addEventListener('click', () => {
      editor.format.insertTableOfContents();
    });

    query('#citation-btn')?.addEventListener('click', () => {
      const key = prompt('Citation key (e.g. Smith2020):');
      if (key) editor.format.insertCitation(key);
    });

    // Export
    query('#export-format')?.addEventListener('change', (e: any) => {
      const format = e.target.value;
      if (format === 'docx') editor.exportDocx();
      else if (format === 'pdf') editor.format.printDoc();
      else if (format) editor.export(format as any);
      e.target.value = '';
    });

    // Word count
    query('#wordcount-btn')?.addEventListener('click', () => {
      const stats = editor.getWordCount();
      alert(`Words: ${stats.words}\nCharacters: ${stats.characters}\nParagraphs: ${stats.paragraphs}`);
    });

    // Clear formatting
    query('#clear-btn')?.addEventListener('click', () => editor.format.clearFormatting());

    // Active state tracking
    editor.instance.on('transaction', () => {
      this.updateActiveStates();
    });
  }

  private updateActiveStates() {
    const editor = this.editor.instance;
    const query = (s: string) => this.container.querySelector(s);
    const toggle = (s: string, active: boolean) => {
      const btn = query(s);
      if (btn) active ? btn.classList.add('is-active') : btn.classList.remove('is-active');
    };

    toggle('#bold-btn', editor.isActive('bold'));
    toggle('#italic-btn', editor.isActive('italic'));
    toggle('#underline-btn', editor.isActive('underline'));
    toggle('#strike-btn', editor.isActive('strike'));
    toggle('#code-btn', editor.isActive('code'));
    toggle('#bullet-list-btn', editor.isActive('bulletList'));
    toggle('#ordered-list-btn', editor.isActive('orderedList'));
    toggle('#task-list-btn', editor.isActive('taskList'));
    toggle('#blockquote-btn', editor.isActive('blockquote'));
    toggle('#align-left-btn', editor.isActive({ textAlign: 'left' }));
    toggle('#align-center-btn', editor.isActive({ textAlign: 'center' }));
    toggle('#align-right-btn', editor.isActive({ textAlign: 'right' }));
    toggle('#align-justify-btn', editor.isActive({ textAlign: 'justify' }));
  }
}
