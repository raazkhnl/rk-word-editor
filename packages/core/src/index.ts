import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Link } from './extensions/Link';

// Core Extensions
import { FontSize } from './extensions/FontSize';
import { TextTransform } from './extensions/TextTransform';
import { LineHeight } from './extensions/LineHeight';
import { ParagraphSpacing } from './extensions/ParagraphSpacing';
import { Indent } from './extensions/Indent';
import { PageBreak } from './extensions/PageBreak';
import { Footnote } from './extensions/Footnote';
import { PasteHandler } from './extensions/PasteHandler';
import { AdvancedTypography } from './extensions/AdvancedTypography';
import { ParagraphSystem } from './extensions/ParagraphSystem';
import { StylesEngine } from './extensions/StylesEngine';
import { PageLayout, type PageLayoutOptions, DEFAULT_PAGE_LAYOUT } from './extensions/PageLayout';
import { Section } from './extensions/Section';
import { Header, Footer, PageNumber } from './extensions/HeaderFooter';
import { TableStyles } from './extensions/TableStyles';
import { MultilevelList } from './extensions/MultilevelList';
import { Caption } from './extensions/Caption';
import { ImageResize } from './extensions/ImageResize';
import { MathInline, MathBlock } from './extensions/Math';
import { TableOfContents } from './extensions/TableOfContents';
import { Citation, Bibliography } from './extensions/Citation';
import { SlashCommands, defaultSlashCommands, type SlashCommand } from './extensions/SlashCommands';
import { ImageUpload } from './extensions/ImageUpload';
import { FormatPainter } from './extensions/FormatPainter';
import { DragHandle } from './extensions/DragHandle';
import { TrackChanges, TrackInsert, TrackDelete } from './extensions/TrackChanges';
import { LeaderMark } from './extensions/LeaderMark';
import { FindReplace } from './extensions/FindReplace';

import { WordShortcuts } from './extensions/WordShortcuts';
import { TextBox } from './extensions/TextBox';
import { Pagination } from './extensions/Pagination';
import { Title, Subtitle } from './extensions/TitleSubtitle';

// Utilities
import { DocumentValidator } from './DocumentValidator';
import { CommandManager } from './CommandManager';
import { ExportEngine, type ExportFormat, type ExportOptions } from './ExportEngine';
import { ImportEngine } from './ImportEngine';
import { StyleManager } from './StyleManager';
import { PrintEngine, type PrintOptions } from './PrintEngine';
import { createImageResizeView } from './extensions/ImageResizeHandle';

export type { ExportFormat, ExportOptions, SlashCommand, PageLayoutOptions, PrintOptions };
export { defaultSlashCommands, DEFAULT_PAGE_LAYOUT };
export { StyleManager } from './StyleManager';
export { ExportEngine } from './ExportEngine';
export { ImportEngine } from './ImportEngine';
export { PrintEngine } from './PrintEngine';
export { DocumentValidator } from './DocumentValidator';
export { CommandManager } from './CommandManager';
export type { ChangeRecord } from './extensions/TrackChanges';

export interface WordEditorOptions {
  element: HTMLElement;
  /** Initial document — HTML string or Tiptap JSON. */
  initialContent?: string | Record<string, any>;
  /** @deprecated Use `initialContent`. Kept for backwards compatibility. */
  content?: string | Record<string, any>;
  placeholder?: string;
  editable?: boolean;
  autofocus?: boolean | 'start' | 'end' | 'all' | number;
  pageLayout?: Partial<PageLayoutOptions>;
  trackAuthor?: string;
  imageUploadHandler?: (file: File) => Promise<string>;
  slashCommands?: SlashCommand[];
  dragHandles?: boolean;
  onUpdate?: (json: any, editor: Editor) => void;
  onWordCount?: (stats: WordCountStats) => void;
  onSelectionChange?: (editor: Editor) => void;
}

export interface WordCountStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
  pages: number;
  readingTimeMinutes: number;
}

export class WordEditor {
  private editor: Editor;
  public commands: CommandManager;
  private exporter: ExportEngine;
  private importer: ImportEngine;
  private printer: PrintEngine;
  private _styleManager: StyleManager;
  private _pageLayout: PageLayoutOptions;
  private _zoom = 1;

  constructor(options: WordEditorOptions) {
    this._styleManager = new StyleManager();
    this.importer = new ImportEngine();
    this._pageLayout = { ...DEFAULT_PAGE_LAYOUT, ...(options.pageLayout || {}) };

    const initial = options.initialContent ?? options.content ?? '';

    this.editor = new Editor({
      element: options.element,
      editable: options.editable !== false,
      autofocus: options.autofocus,
      extensions: [
        StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'rk-code-block' } } }),
        Placeholder.configure({
          // Only show the placeholder when the editor is completely empty —
          // not on every blank paragraph created by Enter.
          placeholder: options.placeholder ?? 'Start typing here…',
          showOnlyWhenEditable: true,
          showOnlyCurrent: true,
          includeChildren: false,
          emptyEditorClass: 'is-editor-empty',
          emptyNodeClass: 'is-empty',
        }),
        Underline,
        TextStyle,
        FontFamily,
        Color,
        Highlight.configure({ multicolor: true }),
        Subscript,
        Superscript,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Table.configure({ resizable: true, lastColumnResizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        TableStyles,
        TaskList,
        TaskItem.configure({ nested: true }),
        MultilevelList,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: 'rk-link' },
        }),
        Image.configure({ inline: false, HTMLAttributes: { class: 'rk-image' } }).extend({
          addNodeView() {
            return (props) => createImageResizeView(props.node, props.view, props.getPos);
          },
        }),
        ImageResize,
        ImageUpload.configure({ onUpload: options.imageUploadHandler ?? null }),
        Caption,
        MathInline,
        MathBlock,
        FontSize,
        TextTransform,
        LineHeight,
        ParagraphSpacing,
        Indent,
        PageBreak,
        Footnote,
        PasteHandler,
        AdvancedTypography,
        ParagraphSystem,
        StylesEngine,
        PageLayout.configure(this._pageLayout),
        Section,
        Header,
        Footer,
        PageNumber,
        TableOfContents,
        Citation,
        Bibliography,
        SlashCommands.configure({ commands: options.slashCommands ?? defaultSlashCommands }),
        FormatPainter,
        TrackChanges.configure({ author: options.trackAuthor || 'Author' }),
        TrackInsert,
        TrackDelete,
        LeaderMark,
        FindReplace,
        WordShortcuts,
        TextBox,
        Title,
        Subtitle,
        Pagination,
        ...(options.dragHandles !== false ? [DragHandle] : []),
      ],
      content: initial,
      onUpdate: ({ editor }) => {
        options.onUpdate?.(editor.getJSON(), editor);
        if (options.onWordCount) options.onWordCount(this.getWordCount());
      },
      onSelectionUpdate: ({ editor }) => options.onSelectionChange?.(editor),
    });

    this.commands = new CommandManager(this.editor);
    this.exporter = new ExportEngine(this._styleManager);
    this.printer = new PrintEngine();

    (this.editor as any).options.parent = this;
    this.applyPageLayoutToDOM(options.element);
    this.syncPaginationLayout();
  }

  /** Push the current page-content height (in CSS pixels) into the Pagination
   *  extension so the on-screen page boundary indicators reflect the layout. */
  private syncPaginationLayout(): void {
    const layoutPx = pageContentHeightPx(this._pageLayout);
    const storage: any = (this.editor.storage as any).pagination;
    if (storage) storage.contentHeightPx = layoutPx;
    // Force a re-paint of the boundaries.
    try {
      const view = this.editor.view;
      view.dispatch(view.state.tr.setMeta({ key: 'rkPagination' } as any, true));
    } catch { /* noop */ }
  }

  // ---- Core API ----
  public getHTML(): string { return this.editor.getHTML(); }
  public getJSON(): any { return this.editor.getJSON(); }
  public getText(): string { return this.editor.state.doc.textContent; }
  public isEmpty(): boolean { return this.editor.isEmpty; }
  public isEditable(): boolean { return this.editor.isEditable; }

  public setDocument(content: string | any): void {
    const validated = typeof content === 'object' ? DocumentValidator.validate(content) : content;
    this.editor.commands.setContent(validated);
  }

  public clear(): void { this.editor.commands.clearContent(true); }
  public focus(pos: 'start' | 'end' | 'all' | number = 'end'): void { this.editor.commands.focus(pos as any); }
  public blur(): void { this.editor.commands.blur(); }
  public destroy(): void { this.editor.destroy(); }

  /** Toggle the editor between editable and read-only mode. */
  public setEditable(editable: boolean): void {
    this.editor.setEditable(editable);
  }

  // ---- Format proxy (legacy compatibility) ----
  public get format() { return this.commands; }

  // ---- Export API ----
  public async exportDocx(filename = 'document.docx') {
    return this.exporter.exportToDocx(this.getJSON(), { filename, pageLayout: this._pageLayout });
  }

  public async exportMarkdown(filename = 'document.md'): Promise<void> {
    const md = await this.importer.exportMarkdown(this.getHTML());
    this.importer.downloadMarkdown(md, filename);
  }

  public exportHtml(filename = 'document.html'): void {
    const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Document</title></head>
<body>${this.getHTML()}</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  public exportJson(filename = 'document.json'): void {
    const blob = new Blob([JSON.stringify(this.getJSON(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  public async export(format: ExportFormat | 'markdown' | 'json', options: ExportOptions = {}) {
    switch (format) {
      case 'docx': return this.exportDocx(options.filename);
      case 'pdf': return this.printPdf(options as any);
      case 'html': return this.exportHtml(options.filename);
      case 'markdown': return this.exportMarkdown(options.filename);
      case 'json': return this.exportJson(options.filename);
      default: console.warn(`Unsupported export format: ${format}`);
    }
  }

  // ---- Print / PDF ----
  /**
   * Print only the editor content in an isolated iframe with A4 portrait
   * defaults. Use the browser's "Save as PDF" option to export PDF.
   */
  public printPdf(options: PrintOptions = {}): void {
    const html = this.getPrintableHTML();
    this.printer.print(html, {
      pageLayout: this._pageLayout,
      title: 'Document',
      ...options,
    });
  }

  /**
   * Build print-ready HTML by cloning the live editor DOM. This preserves
   * NodeView-rendered content (Table of Contents, image resize wrappers,
   * text boxes) that `editor.getHTML()` cannot serialize, then strips
   * editor-only chrome (drag handles, resize handles, pagination spacers,
   * contenteditable attrs).
   */
  public getPrintableHTML(): string {
    const editorEl = this.editor.options.element as HTMLElement | undefined;
    const proseMirror = editorEl?.querySelector('.ProseMirror') as HTMLElement | null;
    if (!proseMirror) return this.getHTML();

    const clone = proseMirror.cloneNode(true) as HTMLElement;

    const dropSelectors = [
      '.rk-page-spacer',
      '.rk-resize-handle',
      '.rk-textbox-handle',
      '.rk-textbox-drag',
      '.rk-drag-handle',
      '.rk-toc-refresh',
      '.ProseMirror-widget',
      '.ProseMirror-gapcursor',
      '.ProseMirror-separator',
    ];
    clone.querySelectorAll(dropSelectors.join(',')).forEach(el => el.remove());

    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    clone.querySelectorAll('.ProseMirror-selectednode').forEach(el => el.classList.remove('ProseMirror-selectednode'));

    return clone.innerHTML;
  }

  // ---- Import API ----
  public async importDocx(file: File): Promise<void> {
    const html = await this.importer.importDocx(file);
    this.setDocument(html);
  }

  public async importMarkdown(text: string): Promise<void> {
    const html = await this.importer.importMarkdown(text);
    this.setDocument(html);
  }

  public async importFromFile(file: File): Promise<void> {
    const name = file.name.toLowerCase();
    if (name.endsWith('.docx')) return this.importDocx(file);
    if (name.endsWith('.md') || name.endsWith('.markdown')) {
      const text = await file.text();
      return this.importMarkdown(text);
    }
    if (name.endsWith('.html') || name.endsWith('.htm')) {
      const html = await file.text();
      this.setDocument(html);
      return;
    }
    if (name.endsWith('.json')) {
      const text = await file.text();
      this.setDocument(JSON.parse(text));
      return;
    }
    if (name.endsWith('.txt')) {
      const text = await file.text();
      const html = text.split(/\r?\n/).map(l => `<p>${escapeHtml(l) || '<br>'}</p>`).join('');
      this.setDocument(html);
      return;
    }
    throw new Error(`Unsupported file format: ${file.name}`);
  }

  // ---- Document Tools ----
  public getTableOfContents(): { level: number; text: string; id: string }[] {
    const headings: { level: number; text: string; id: string }[] = [];
    this.editor.state.doc.descendants((node) => {
      if (node.type.name === 'heading') {
        const text = node.textContent;
        const id = slugify(text);
        headings.push({ level: node.attrs.level, text, id });
      }
    });
    return headings;
  }

  public getWordCount(): WordCountStats {
    // `doc.textContent` concatenates with no block separators, so adjacent
    // blocks ('apple', 'ball') would be counted as one word. Use textBetween
    // with a newline separator to get correct word boundaries across blocks.
    const doc = this.editor.state.doc;
    const text = doc.textBetween(0, doc.content.size, '\n', ' ');
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/[\s ]+/).filter(Boolean).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    let paragraphs = 0;
    doc.descendants(node => {
      if (node.type.name === 'paragraph' && node.textContent.length) paragraphs++;
    });
    const sentences = trimmed
      ? (trimmed.match(/[^.!?\n]+[.!?]+/g) || [trimmed]).length
      : 0;
    const pages = Math.max(1, Math.ceil(words / 250));
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, characters, charactersNoSpaces, paragraphs, sentences, pages, readingTimeMinutes };
  }

  // ---- Track Changes API ----
  public toggleTrackChanges(): void {
    (this.editor as any).chain().toggleTrackChanges().run();
  }

  public isTrackingChanges(): boolean {
    return (this.editor.storage.trackChanges as any)?.enabled ?? false;
  }

  // ---- Find & Replace ----
  public find(query: string, options: { caseSensitive?: boolean; regex?: boolean } = {}): number {
    return (this.editor.commands as any).findText(query, options);
  }

  public replace(query: string, replacement: string, all = false, options: { caseSensitive?: boolean; regex?: boolean } = {}): number {
    return (this.editor.commands as any)[all ? 'replaceAllText' : 'replaceText'](query, replacement, options);
  }

  public clearSearch(): void {
    (this.editor.commands as any).clearSearch();
  }

  // ---- Pagination ----
  /** Current measured page count from the Pagination extension. */
  public getPageCount(): number {
    return (this.editor.storage as any)?.pagination?.pageCount || 1;
  }

  /** Inside-page area in CSS pixels (page height minus top/bottom margins). */
  public getPageContentHeightPx(): number {
    return pageContentHeightPx(this._pageLayout);
  }

  // ---- Page Layout ----
  public getPageLayout(): PageLayoutOptions { return { ...this._pageLayout }; }

  public setPageLayout(layout: Partial<PageLayoutOptions>): void {
    this._pageLayout = { ...this._pageLayout, ...layout };
    if (layout.margins) this._pageLayout.margins = { ...this._pageLayout.margins, ...layout.margins };
    this.applyPageLayoutToDOM(this.editor.options.element as HTMLElement);
    this.syncPaginationLayout();
  }

  private applyPageLayoutToDOM(host: HTMLElement) {
    const { width, height } = resolvePageDimensions(this._pageLayout);
    const contentPx = pageContentHeightPx(this._pageLayout);
    const editorEl = host.querySelector('.ProseMirror') as HTMLElement | null;
    if (!editorEl) return;
    editorEl.style.setProperty('--rk-page-width', width);
    editorEl.style.setProperty('--rk-page-height', height);
    editorEl.style.setProperty('--rk-page-content-height', `${contentPx}px`);
    editorEl.style.setProperty('--rk-page-margin-top', this._pageLayout.margins.top);
    editorEl.style.setProperty('--rk-page-margin-bottom', this._pageLayout.margins.bottom);
    editorEl.style.setProperty('--rk-page-margin-left', this._pageLayout.margins.left);
    editorEl.style.setProperty('--rk-page-margin-right', this._pageLayout.margins.right);
    editorEl.dataset.pageOrientation = this._pageLayout.orientation;
  }

  // ---- Zoom ----
  public getZoom(): number { return this._zoom; }

  public setZoom(zoom: number): void {
    const z = Math.min(3, Math.max(0.25, zoom));
    this._zoom = z;
    const editorEl = this.editor.options.element as HTMLElement;
    const surface = editorEl.querySelector('.ProseMirror') as HTMLElement | null;
    if (surface) {
      surface.style.transform = `scale(${z})`;
      surface.style.transformOrigin = 'top center';
    }
  }

  // ---- Auto-save ----
  public enableAutoSave(key = 'rk-editor-content', debounceMs = 500): () => void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handler = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify(this.getJSON()));
        } catch (e) {
          console.warn('[WordEditor] Auto-save failed', e);
        }
      }, debounceMs);
    };
    this.editor.on('update', handler);
    return () => this.editor.off('update', handler);
  }

  public loadAutoSave(key = 'rk-editor-content'): boolean {
    const saved = localStorage.getItem(key);
    if (!saved) return false;
    try {
      this.setDocument(JSON.parse(saved));
      return true;
    } catch (e) {
      console.error('Failed to load autosave:', e);
      return false;
    }
  }

  public clearAutoSave(key = 'rk-editor-content'): void {
    localStorage.removeItem(key);
  }

  // ---- Instance access ----
  public get instance(): Editor { return this.editor; }
  public get styleManager(): StyleManager { return this._styleManager; }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

function resolvePageDimensions(layout: PageLayoutOptions): { width: string; height: string } {
  const portraitSizes: Record<string, [string, string]> = {
    A4: ['210mm', '297mm'],
    A3: ['297mm', '420mm'],
    A5: ['148mm', '210mm'],
    Letter: ['8.5in', '11in'],
    Legal: ['8.5in', '14in'],
    Tabloid: ['11in', '17in'],
  };
  const [w, h] = portraitSizes[layout.pageSize] || portraitSizes.A4;
  if (layout.orientation === 'landscape') return { width: h, height: w };
  return { width: w, height: h };
}

/** Return the editable content area height (page height minus top/bottom margins) in CSS pixels. */
function pageContentHeightPx(layout: PageLayoutOptions): number {
  const { height } = resolvePageDimensions(layout);
  const totalPx = cssLengthToPx(height);
  const topPx = cssLengthToPx(layout.margins.top);
  const botPx = cssLengthToPx(layout.margins.bottom);
  return Math.max(200, Math.round(totalPx - topPx - botPx));
}

function cssLengthToPx(value: string): number {
  if (!value) return 0;
  const s = String(value).trim();
  const num = parseFloat(s);
  if (isNaN(num)) return 0;
  if (s.endsWith('in')) return num * 96;
  if (s.endsWith('cm')) return num * 37.795;
  if (s.endsWith('mm')) return num * 3.7795;
  if (s.endsWith('pt')) return num * 1.333;
  if (s.endsWith('pc')) return num * 16;
  if (s.endsWith('px')) return num;
  return num;
}
