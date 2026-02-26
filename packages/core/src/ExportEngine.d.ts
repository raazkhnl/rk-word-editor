import { StyleManager } from './StyleManager';
export type ExportFormat = 'docx' | 'pdf' | 'html';
export interface ExportOptions {
    filename?: string;
    margin?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}
export declare class ExportEngine {
    private styleManager;
    constructor(styleManager: StyleManager);
    /**
     * Main entry point for DOCX export.
     * Converts Tiptap JSON to docx Document.
     */
    exportToDocx(json: any): Promise<void>;
    private convertNodes;
    private convertParagraph;
    private convertHeading;
    private convertTable;
    private convertTableRow;
    private convertTableCell;
    private convertInlines;
    private parseSpacing;
    private parseIndent;
    private parseFontSize;
    private mapAlignment;
}
