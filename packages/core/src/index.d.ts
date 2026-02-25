import { Editor } from '@tiptap/core';
import { ExportFormat, ExportOptions } from './ExportEngine';
export interface WordEditorOptions {
    element: HTMLElement;
    content?: string;
    onUpdate?: (props: {
        editor: Editor;
    }) => void;
}
export declare class WordEditor {
    private editor;
    constructor(options: WordEditorOptions);
    getHTML(): string;
    getJSON(): any;
    setDocument(content: string | any): void;
    focus(): void;
    destroy(): void;
    format: {
        bold: () => boolean;
        italic: () => boolean;
        underline: () => boolean;
        strike: () => boolean;
        subscript: () => boolean;
        superscript: () => boolean;
        fontFamily: (font: string) => boolean;
        fontSize: (size: string) => boolean;
        color: (color: string) => boolean;
        highlight: (color: string) => boolean;
        transform: (type: any) => boolean;
        align: (alignment: any) => boolean;
        lineHeight: (height: string) => boolean;
        spacing: (top: string, bottom: string) => boolean;
        indent: () => boolean;
        outdent: () => boolean;
        heading: (level: any) => boolean;
        paragraph: () => boolean;
        bulletList: () => boolean;
        orderedList: () => boolean;
        taskList: () => any;
        insertTable: (options: any) => boolean;
        insertImage: (src: string) => boolean;
        pageBreak: () => any;
        footnote: () => any;
        clear: () => boolean;
        undo: () => boolean;
        redo: () => boolean;
    };
    export(format: ExportFormat, options?: ExportOptions): Promise<void>;
    getTableOfContents(): any[];
    get instance(): Editor;
}
