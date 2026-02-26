/**
 * ImportEngine - Handles importing external formats into the editor.
 * 
 * DOCX import: Uses mammoth.js for high-fidelity Word document conversion.
 * Markdown import: Uses marked for Markdown → HTML conversion.
 * Markdown export: Uses turndown to convert HTML → Markdown.
 *
 * All libraries are dynamically imported to avoid bundle size impact.
 */
export class ImportEngine {

    /**
     * Import a .docx file and return HTML string.
     * Requires mammoth to be installed: npm install mammoth
     */
    public async importDocx(file: File): Promise<string> {
        let mammoth: any;
        try {
            mammoth = await import('mammoth');
        } catch {
            throw new Error('mammoth is not installed. Run: npm install mammoth');
        }

        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml(
            { arrayBuffer },
            {
                styleMap: [
                    "p[style-name='Heading 1'] => h1:fresh",
                    "p[style-name='Heading 2'] => h2:fresh",
                    "p[style-name='Heading 3'] => h3:fresh",
                    "p[style-name='Heading 4'] => h4:fresh",
                    "p[style-name='Heading 5'] => h5:fresh",
                    "p[style-name='Heading 6'] => h6:fresh",
                    "p[style-name='List Paragraph'] => li:fresh",
                    "b => strong",
                    "i => em",
                    "u => span.underline",
                ],
                includeDefaultStyleMap: true,
            }
        );

        if (result.messages.length > 0) {
            console.warn('[ImportEngine] DOCX import warnings:', result.messages);
        }

        return result.value;
    }

    /**
     * Import a Markdown string and return HTML.
     * Requires marked: npm install marked
     */
    public async importMarkdown(text: string): Promise<string> {
        let marked: any;
        try {
            const mod = await import('marked');
            marked = (mod as any).marked ?? (mod as any).default ?? mod;
        } catch {
            throw new Error('marked is not installed. Run: npm install marked');
        }

        return marked(text, {
            gfm: true,       // GitHub-flavored markdown
            breaks: true,    // Line breaks become <br>
        });
    }

    /**
     * Export HTML to Markdown.
     * Requires turndown: npm install turndown
     */
    public async exportMarkdown(html: string): Promise<string> {
        let TurndownService: any;
        try {
            const mod = await import('turndown');
            TurndownService = mod.default || mod;
        } catch {
            throw new Error('turndown is not installed. Run: npm install turndown');
        }

        const service = new TurndownService({
            headingStyle: 'atx',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced',
        });

        // Handle tables
        try {
            // Using a template literal to avoid Vite static analysis if missing
            const pluginName = 'turndown-plugin-gfm';
            const gfm = await import(pluginName as any);
            service.use(gfm.gfm);
        } catch {
            // GFM plugin optional
        }

        return service.turndown(html);
    }

    /**
     * Download Markdown as a .md file.
     */
    public downloadMarkdown(markdown: string, filename = 'document.md'): void {
        const blob = new Blob([markdown], { type: 'text/markdown; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
