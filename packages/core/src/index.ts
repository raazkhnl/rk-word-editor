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

// Custom Extensions
import { FontSize } from './extensions/FontSize';
import { TextTransform } from './extensions/TextTransform';
import { LineHeight } from './extensions/LineHeight';
import { ParagraphSpacing } from './extensions/ParagraphSpacing';
import { Indent } from './extensions/Indent';
import { PageBreak } from './extensions/PageBreak';
import { Footnote } from './extensions/Footnote';

// Export
import { ExportEngine, ExportFormat, ExportOptions } from './ExportEngine';

export interface WordEditorOptions {
  element: HTMLElement;
  content?: string;
  onUpdate?: (props: { editor: Editor }) => void;
}

export class WordEditor {
  private editor: Editor;

  constructor(options: WordEditorOptions) {
    this.editor = new Editor({
      element: options.element,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5, 6] },
        }),
        Underline,
        Subscript,
        Superscript,
        TextStyle,
        FontFamily,
        Color,
        Highlight.configure({ multicolor: true }),
        FontSize,
        TextTransform,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        LineHeight,
        ParagraphSpacing,
        Indent,
        TaskList,
        TaskItem.configure({ nested: true }),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        PageBreak,
        Footnote,
        Image.configure({
          HTMLAttributes: {
            class: 'rk-image',
          },
        }),
      ],
      content: options.content || '',
      onUpdate: ({ editor }) => {
        if (options.onUpdate) options.onUpdate({ editor });
      },
    });
  }

  public getHTML(): string { return this.editor.getHTML(); }
  public getJSON(): any { return this.editor.getJSON(); }
  public setDocument(content: string | any): void { this.editor.commands.setContent(content); }
  public focus(): void { this.editor.chain().focus().run(); }
  public destroy(): void { this.editor.destroy(); }

  // Formatting Shortcuts
  public format = {
    bold: () => this.editor.chain().focus().toggleBold().run(),
    italic: () => this.editor.chain().focus().toggleItalic().run(),
    underline: () => this.editor.chain().focus().toggleUnderline().run(),
    strike: () => this.editor.chain().focus().toggleStrike().run(),
    subscript: () => this.editor.chain().focus().toggleSubscript().run(),
    superscript: () => this.editor.chain().focus().toggleSuperscript().run(),

    fontFamily: (font: string) => this.editor.chain().focus().setFontFamily(font).run(),
    fontSize: (size: string) => this.editor.chain().focus().setFontSize(size).run(),
    color: (color: string) => this.editor.chain().focus().setColor(color).run(),
    highlight: (color: string) => this.editor.chain().focus().setHighlight({ color }).run(),
    transform: (type: any) => this.editor.chain().focus().setTextTransform(type).run(),

    align: (alignment: any) => this.editor.chain().focus().setTextAlign(alignment).run(),
    lineHeight: (height: string) => this.editor.chain().focus().setLineHeight(height).run(),
    spacing: (top: string, bottom: string) => this.editor.chain().focus().setParagraphSpacing({ top, bottom }).run(),
    indent: () => this.editor.chain().focus().indent().run(),
    outdent: () => this.editor.chain().focus().outdent().run(),

    heading: (level: any) => this.editor.chain().focus().toggleHeading({ level }).run(),
    paragraph: () => this.editor.chain().focus().setParagraph().run(),

    bulletList: () => this.editor.chain().focus().toggleBulletList().run(),
    orderedList: () => this.editor.chain().focus().toggleOrderedList().run(),
    taskList: () => (this.editor.chain().focus() as any).toggleTaskList().run(),

    insertTable: (options: any) => this.editor.chain().focus().insertTable(options).run(),
    insertImage: (src: string) => this.editor.chain().focus().setImage({ src }).run(),

    pageBreak: () => (this.editor.commands as any).setPageBreak(),
    footnote: () => (this.editor.commands as any).setFootnote(),

    clear: () => this.editor.chain().focus().unsetAllMarks().run(),
    undo: () => this.editor.chain().focus().undo().run(),
    redo: () => this.editor.chain().focus().redo().run(),
  };

  public async export(format: ExportFormat, options: ExportOptions = {}) {
    return ExportEngine.export(this.getHTML(), format, options);
  }

  public getTableOfContents() {
    const headings: any[] = [];
    this.editor.state.doc.descendants((node) => {
      if (node.type.name === 'heading') {
        headings.push({ level: node.attrs.level, text: node.textContent });
      }
    });
    return headings;
  }

  public get instance(): Editor { return this.editor; }
}
