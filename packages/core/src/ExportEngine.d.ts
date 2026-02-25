export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'html';
export interface ExportOptions {
    filename?: string;
}
export declare class ExportEngine {
    static export(htmlContent: string, format: ExportFormat, options?: ExportOptions): Promise<void>;
    private static stripHtml;
    private static downloadFile;
}
