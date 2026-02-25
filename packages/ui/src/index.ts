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
      <div class="rk-toolbar">
        <div class="rk-toolbar-group">
          <button id="undo-btn" title="Undo">↺</button>
          <button id="redo-btn" title="Redo">↻</button>
        </div>
        
        <div class="rk-toolbar-group">
          <select id="heading-style" title="Styles">
            <option value="paragraph">Normal</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
        </div>

        <div class="rk-toolbar-group">
          <button id="bold-btn" title="Bold"><b>B</b></button>
          <button id="italic-btn" title="Italic"><i>I</i></button>
          <button id="underline-btn" title="Underline"><u>U</u></button>
        </div>

        <div class="rk-toolbar-group">
          <button id="bullet-list-btn" title="Bullet List">•</button>
          <button id="ordered-list-btn" title="Ordered List">1.</button>
        </div>

        <div class="rk-toolbar-group">
          <button id="insert-table-btn" title="Insert Table">⊞</button>
          <button id="insert-image-btn" title="Insert Image">🖼</button>
          <button id="page-break-btn" title="Page Break">✂</button>
        </div>

        <div class="rk-toolbar-group">
          <select id="export-format" title="Export">
            <option value="">Export As...</option>
            <option value="html">HTML</option>
            <option value="txt">Text</option>
            <option value="pdf">PDF (BETA)</option>
            <option value="docx">Word (BETA)</option>
          </select>
        </div>

        <div class="rk-toolbar-group">
          <button id="toc-btn" title="Table of Contents">TOC</button>
          <button id="clear-btn" title="Clear Formatting">Clear</button>
        </div>
      </div>
    `;

    this.setupEvents();
  }

  private setupEvents() {
    const editor = this.editor;
    const query = (s: string) => this.container.querySelector(s);

    query('#undo-btn')?.addEventListener('click', () => editor.format.undo());
    query('#redo-btn')?.addEventListener('click', () => editor.format.redo());

    query('#bold-btn')?.addEventListener('click', () => editor.format.bold());
    query('#italic-btn')?.addEventListener('click', () => editor.format.italic());
    query('#underline-btn')?.addEventListener('click', () => editor.format.underline());

    query('#bullet-list-btn')?.addEventListener('click', () => editor.format.bulletList());
    query('#ordered-list-btn')?.addEventListener('click', () => editor.format.orderedList());

    query('#insert-table-btn')?.addEventListener('click', () => {
      const rows = parseInt(prompt('Rows:', '3') || '0');
      const cols = parseInt(prompt('Cols:', '3') || '0');
      if (rows > 0 && cols > 0) editor.format.insertTable({ rows, cols });
    });

    query('#insert-image-btn')?.addEventListener('click', () => {
      const url = prompt('Image URL:', 'https://picsum.photos/400/300');
      if (url) editor.format.insertImage(url);
    });

    query('#page-break-btn')?.addEventListener('click', () => editor.format.pageBreak());

    query('#heading-style')?.addEventListener('change', (e: any) => {
      const val = e.target.value;
      if (val === 'paragraph') editor.format.paragraph();
      else editor.format.heading(parseInt(val) as any);
    });

    query('#export-format')?.addEventListener('change', (e: any) => {
      const format = e.target.value;
      if (format) editor.export(format);
      e.target.value = ''; // Reset
    });

    query('#toc-btn')?.addEventListener('click', () => {
      const toc = editor.getTableOfContents();
      alert('Table of Contents:\n' + toc.map((t: any) => `${'  '.repeat(t.level - 1)}${t.text}`).join('\n'));
    });

    query('#clear-btn')?.addEventListener('click', () => editor.format.clear());

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
  }
}
