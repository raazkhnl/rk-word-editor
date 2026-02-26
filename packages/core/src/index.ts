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
import { Link } from './extensions/Link';

// Core Extensions (Phase 0-2)
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
// Phase 3
import { PageLayout } from './extensions/PageLayout';
import { Section } from './extensions/Section';
import { Header, Footer, PageNumber } from './extensions/HeaderFooter';
// Phase 5
import { TableStyles } from './extensions/TableStyles';
// Phase 6
import { MultilevelList } from './extensions/MultilevelList';
// Phase 7
import { Caption } from './extensions/Caption';
import { ImageResize } from './extensions/ImageResize';
import { MathInline, MathBlock } from './extensions/Math';
// Phase 8
import { TableOfContents } from './extensions/TableOfContents';
import { Citation, Bibliography } from './extensions/Citation';
// Phase 10
import { SlashCommands, SlashCommand } from './extensions/SlashCommands';
// Phase 2 Sprint - New Extensions
import { ImageUpload } from './extensions/ImageUpload';
import { FormatPainter } from './extensions/FormatPainter';
import { DragHandle } from './extensions/DragHandle';
import { TrackChanges } from './extensions/TrackChanges';

// Utilities
import { DocumentValidator } from './DocumentValidator';
import { CommandManager } from './CommandManager';
import { ExportEngine, ExportFormat, ExportOptions } from './ExportEngine';
import { ImportEngine } from './ImportEngine';
import { StyleManager } from './StyleManager';

// Re-export types and utilities for consumers
export type { ExportFormat, ExportOptions, SlashCommand };
export { StyleManager } from './StyleManager';
export { ExportEngine } from './ExportEngine';
export { ImportEngine } from './ImportEngine';
export type { ChangeRecord } from './extensions/TrackChanges';

export interface WordEditorOptions {
  element: HTMLElement;
  initialContent?: string;
  onUpdate?: (json: any) => void;
  onWordCount?: (stats: { words: number; characters: number; paragraphs: number }) => void;
  slashCommands?: SlashCommand[];
  trackAuthor?: string;
  imageUploadHandler?: (file: File) => Promise<string>;
  dragHandles?: boolean;
}

export class WordEditor {
  private editor: Editor;
  public commands: CommandManager;
  private exporter: ExportEngine;
  private importer: ImportEngine;
  private _styleManager: StyleManager;

  constructor(options: WordEditorOptions) {
    this._styleManager = new StyleManager();
    this.importer = new ImportEngine();

    this.editor = new Editor({
      element: options.element,
      extensions: [
        // ---- Foundation ----
        StarterKit,
        Underline,
        TextStyle,
        FontFamily,
        Color,
        Highlight.configure({ multicolor: true }),
        Subscript,
        Superscript,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        // ---- Tables (Phase 5) ----
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        TableStyles,
        // ---- Lists (Phase 6) ----
        TaskList,
        TaskItem.configure({ nested: true }),
        MultilevelList,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'rk-link',
          },
        }),
        // ---- Media (Phase 7) ----
        Image.configure({ HTMLAttributes: { class: 'rk-image' } }),
        ImageResize,
        ImageUpload.configure({
          onUpload: options.imageUploadHandler || null,
        }),
        Caption,
        MathInline,
        MathBlock,
        // ---- Typography (Phase 1) ----
        FontSize,
        TextTransform,
        LineHeight,
        ParagraphSpacing,
        Indent,
        // ---- Layout (Phase 3) ----
        PageBreak,
        Footnote,
        PasteHandler,
        AdvancedTypography,
        ParagraphSystem,
        StylesEngine,
        PageLayout,
        Section,
        Header,
        Footer,
        PageNumber,
        // ---- References (Phase 8) ----
        TableOfContents,
        Citation,
        Bibliography,
        // ---- Commands (Phase 10) ----
        SlashCommands.configure({
          commands: options.slashCommands || undefined,
        }),
        // ---- Phase 2 Sprint ----
        FormatPainter,
        TrackChanges.configure({
          author: options.trackAuthor || 'Author',
        }),
        ...(options.dragHandles !== false ? [DragHandle] : []),
      ],
      content: options.initialContent || '',
      onUpdate: ({ editor }) => {
        if (options.onUpdate) {
          options.onUpdate(editor.getJSON());
        }
        if (options.onWordCount) {
          options.onWordCount(this.getWordCount());
        }
      },
    });

    this.commands = new CommandManager(this.editor);
    this.exporter = new ExportEngine(this._styleManager);

    // Link editor to commands parent for easy access
    (this.editor as any).options.parent = this;
  }

  // ---- Core API ----
  public getHTML(): string { return this.editor.getHTML(); }
  public getJSON(): any { return this.editor.getJSON(); }

  public setDocument(content: string | any): void {
    const validatedContent = typeof content === 'object'
      ? DocumentValidator.validate(content)
      : content;
    this.editor.commands.setContent(validatedContent);
  }

  public focus(): void { this.editor.chain().focus().run(); }
  public destroy(): void { this.editor.destroy(); }

  // ---- Format proxy (legacy compatibility) ----
  public get format() { return this.commands; }

  // ---- Export API ----
  public async exportDocx() {
    return this.exporter.exportToDocx(this.getJSON());
  }

  public async exportMarkdown(): Promise<void> {
    const md = await this.importer.exportMarkdown(this.getHTML());
    this.importer.downloadMarkdown(md);
  }

  public async export(format: ExportFormat | 'markdown', _options: ExportOptions = {}) {
    if (format === 'docx') return this.exportDocx();
    if (format === 'markdown') return this.exportMarkdown();
    if (format === 'html') {
      const blob = new Blob([this.getHTML()], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.html';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    console.warn('Export format not yet implemented:', format);
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
    if (file.name.endsWith('.docx')) {
      return this.importDocx(file);
    } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
      const text = await file.text();
      return this.importMarkdown(text);
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      const html = await file.text();
      this.setDocument(html);
    } else {
      throw new Error(`Unsupported file format: ${file.name}`);
    }
  }

  // ---- Document Tools (Phase 8) ----
  public getTableOfContents() {
    const headings: { level: number; text: string; id: string }[] = [];
    this.editor.state.doc.descendants((node) => {
      if (node.type.name === 'heading') {
        const text = node.textContent;
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        headings.push({ level: node.attrs.level, text, id });
      }
    });
    return headings;
  }

  public getWordCount(): { words: number; characters: number; paragraphs: number } {
    const text = this.editor.state.doc.textContent;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    let paragraphs = 0;
    this.editor.state.doc.descendants(node => {
      if (node.type.name === 'paragraph') paragraphs++;
    });
    return { words, characters, paragraphs };
  }

  // ---- Track Changes API ----
  public toggleTrackChanges(): void {
    (this.editor as any).chain().toggleTrackChanges().run();
  }

  public isTrackingChanges(): boolean {
    return (this.editor.storage.trackChanges as any)?.enabled ?? false;
  }

  // ---- Instance access ----
  public get instance(): Editor { return this.editor; }
  public get styleManager(): StyleManager { return this._styleManager; }

  // Upgrade: Auto-save functionality
  public enableAutoSave(key: string = 'rk-editor-content'): void {
    this.editor.on('update', () => {
      localStorage.setItem(key, JSON.stringify(this.getJSON()));
    });
  }

  public loadAutoSave(key: string = 'rk-editor-content'): boolean {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        this.setDocument(JSON.parse(saved));
        return true;
      } catch (e) {
        console.error('Failed to load autosave:', e);
      }
    }
    return false;
  }
}
