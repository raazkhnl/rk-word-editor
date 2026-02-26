/**
 * ImportEngine - Handles importing external formats into the editor.
 *
 * DOCX import: Uses mammoth.js for high-fidelity Word document conversion.
 * Markdown import: Uses marked for Markdown → HTML conversion.
 * Markdown export: Uses turndown to convert HTML → Markdown.
 *
 * All libraries are dynamically imported to avoid bundle size impact.
 */
export declare class ImportEngine {
    /**
     * Import a .docx file and return HTML string.
     * Requires mammoth to be installed: npm install mammoth
     */
    importDocx(file: File): Promise<string>;
    /**
     * Import a Markdown string and return HTML.
     * Requires marked: npm install marked
     */
    importMarkdown(text: string): Promise<string>;
    /**
     * Export HTML to Markdown.
     * Requires turndown: npm install turndown
     */
    exportMarkdown(html: string): Promise<string>;
    /**
     * Download Markdown as a .md file.
     */
    downloadMarkdown(markdown: string, filename?: string): void;
}
