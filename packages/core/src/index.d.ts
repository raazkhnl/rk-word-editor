import { Editor } from '@tiptap/core';
import { SlashCommand } from './extensions/SlashCommands';
import { CommandManager } from './CommandManager';
import { ExportFormat, ExportOptions } from './ExportEngine';
import { StyleManager } from './StyleManager';
export type { ExportFormat, ExportOptions, SlashCommand };
export { StyleManager } from './StyleManager';
export { ExportEngine } from './ExportEngine';
export { ImportEngine } from './ImportEngine';
export type { ChangeRecord } from './extensions/TrackChanges';
export interface WordEditorOptions {
    element: HTMLElement;
    initialContent?: string;
    onUpdate?: (json: any) => void;
    onWordCount?: (stats: {
        words: number;
        characters: number;
        paragraphs: number;
    }) => void;
    slashCommands?: SlashCommand[];
    trackAuthor?: string;
    imageUploadHandler?: (file: File) => Promise<string>;
    dragHandles?: boolean;
}
export declare class WordEditor {
    private editor;
    commands: CommandManager;
    private exporter;
    private importer;
    private _styleManager;
    constructor(options: WordEditorOptions);
    getHTML(): string;
    getJSON(): any;
    setDocument(content: string | any): void;
    focus(): void;
    destroy(): void;
    get format(): CommandManager;
    exportDocx(): Promise<void>;
    exportMarkdown(): Promise<void>;
    export(format: ExportFormat | 'markdown', _options?: ExportOptions): Promise<void>;
    importDocx(file: File): Promise<void>;
    importMarkdown(text: string): Promise<void>;
    importFromFile(file: File): Promise<void>;
    getTableOfContents(): {
        level: number;
        text: string;
        id: string;
    }[];
    getWordCount(): {
        words: number;
        characters: number;
        paragraphs: number;
    };
    toggleTrackChanges(): void;
    isTrackingChanges(): boolean;
    get instance(): Editor;
    get styleManager(): StyleManager;
    enableAutoSave(key?: string): void;
    loadAutoSave(key?: string): boolean;
}
