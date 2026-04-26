import {
    AlignmentType, BorderStyle, Document, ExternalHyperlink, HeadingLevel, ImageRun,
    LevelFormat, Packer, PageOrientation, Paragraph, ShadingType, Table, TableCell,
    TableRow, TextRun, UnderlineType, VerticalAlign, WidthType,
    type IRunOptions, type ILevelsOptions,
} from 'docx';
// `file-saver` is a CJS-only package. Use the default-import shape so we work
// in both bundlers and node-style ESM evaluators.
import fileSaver from 'file-saver';
const saveAs: (blob: Blob, filename?: string) => void =
    (fileSaver as any).saveAs || (fileSaver as any).default?.saveAs || (fileSaver as any);
import type { StyleManager } from './StyleManager';
import type { PageLayoutOptions } from './extensions/PageLayout';

export type ExportFormat = 'docx' | 'pdf' | 'html' | 'json' | 'markdown';

export interface ExportOptions {
    filename?: string;
    pageLayout?: Partial<PageLayoutOptions>;
}

const TWIPS_PER_INCH = 1440;
const TWIPS_PER_CM = 567;
const TWIPS_PER_MM = 56.7;
const TWIPS_PER_PT = 20;

const DOCX_PAGE_SIZES: Record<string, [number, number]> = {
    A3: [16838, 23811],
    A4: [11906, 16838],
    A5: [8419, 11906],
    Letter: [12240, 15840],
    Legal: [12240, 20160],
    Tabloid: [15840, 24480],
};

const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
};

interface InlineFormat {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    subscript?: boolean;
    superscript?: boolean;
    code?: boolean;
    color?: string;
    highlight?: string;
    font?: string;
    size?: number;
    href?: string;
}

interface ListContext {
    reference: 'rk-decimal' | 'rk-bullet' | 'rk-nepali';
    level: number;
}

/**
 * High-fidelity DOCX exporter. Converts Tiptap JSON to a real Word document
 * with embedded images, hyperlinks, all character marks (color, highlight,
 * font, size, strike, sub/sup, track-changes) and proper section properties.
 *
 * Designed to produce documents that open without errors in Microsoft Word,
 * Google Docs, LibreOffice and Pages.
 */
export class ExportEngine {
    private _docHeadings: HeadingInfo[] = [];

    constructor(_styleManager?: StyleManager) {
        // styleManager retained for forward-compatibility (named-style export).
    }

    public async exportToDocx(json: any, options: ExportOptions = {}): Promise<void> {
        const blob = await this.toBlob(json, options);
        saveAs(blob, options.filename || 'document.docx');
    }

    /**
     * Build the docx Blob without triggering a download. Useful for tests,
     * server-side rendering, or piping the document elsewhere.
     */
    public async toBlob(json: any, options: ExportOptions = {}): Promise<Blob> {
        // We need the document headings up front so the TOC export can
        // reference them with real text + an estimated page number.
        this._docHeadings = collectHeadings(json);
        const sectionChildren = await this.convertNodes(json?.content || [], undefined);
        const pageProps = sectionPropertiesFromLayout(options.pageLayout);

        const doc = new Document({
            creator: 'RK Word Editor',
            description: 'Exported from RK Word Editor',
            title: (options.filename || 'document').replace(/\.docx$/i, ''),
            numbering: { config: this.numberingConfig() },
            sections: [
                {
                    properties: pageProps,
                    children: sectionChildren,
                },
            ],
        });

        return Packer.toBlob(doc);
    }

    // ---- Node conversion ---------------------------------------------------

    private async convertNodes(nodes: any[], list?: ListContext): Promise<(Paragraph | Table)[]> {
        const out: (Paragraph | Table)[] = [];
        for (const node of nodes || []) {
            const r = await this.convertNode(node, list);
            if (Array.isArray(r)) out.push(...r);
            else if (r) out.push(r);
        }
        return out;
    }

    private async convertNode(node: any, list?: ListContext): Promise<Paragraph | Table | (Paragraph | Table)[] | null> {
        if (!node || typeof node !== 'object' || !node.type) return null;
        switch (node.type) {
            case 'paragraph': return this.convertParagraph(node, list);
            case 'heading': return this.convertHeading(node);
            case 'blockquote': return this.convertBlockquote(node);
            case 'codeBlock': return this.convertCodeBlock(node);
            case 'horizontalRule':
                return new Paragraph({
                    children: [new TextRun('')],
                    border: { bottom: { color: '999999', space: 1, style: BorderStyle.SINGLE, size: 6 } },
                });
            case 'pageBreak':
                return new Paragraph({ children: [new TextRun({ text: '', break: 1 })], pageBreakBefore: true });
            case 'image': return await this.convertImage(node);
            case 'bulletList':
                return this.convertList(node, { reference: 'rk-bullet', level: (list?.level ?? -1) + 1 });
            case 'orderedList': {
                const ref: ListContext['reference'] = node.attrs?.listStyle === 'nepali' ? 'rk-nepali' : 'rk-decimal';
                return this.convertList(node, { reference: ref, level: (list?.level ?? -1) + 1 });
            }
            case 'taskList': return this.convertTaskList(node);
            case 'table': return this.convertTable(node);
            case 'caption':
                return new Paragraph({
                    children: this.convertInlines(node.content || []),
                    alignment: AlignmentType.CENTER,
                });
            case 'mathInline':
            case 'mathBlock':
                return new Paragraph({
                    children: [new TextRun({ text: node.attrs?.latex || '', font: 'Cambria Math' })],
                });
            case 'section':
            case 'bibliography':
            case 'textBox':
                return this.convertNodes(node.content || []);
            case 'tableOfContents':
                return this.convertTocPlaceholder(node);
            default:
                if (Array.isArray(node.content) && node.content.length) {
                    return this.convertNodes(node.content, list);
                }
                return null;
        }
    }

    // ---- Paragraphs / inlines ---------------------------------------------

    private convertParagraph(node: any, list?: ListContext): Paragraph {
        let children = this.convertInlines(node.content || []);
        if (children.length === 0) children = [new TextRun('')];
        const opts: any = { children };
        if (list) opts.numbering = { reference: list.reference, level: Math.min(list.level, 8) };
        applyParagraphStyling(node, opts);
        return new Paragraph(opts);
    }

    private convertHeading(node: any): Paragraph {
        const level = clamp(node.attrs?.level || 1, 1, 6);
        let children = this.convertInlines(node.content || []);
        if (children.length === 0) children = [new TextRun('')];
        const opts: any = { children, heading: HEADING_MAP[level] };
        applyParagraphStyling(node, opts);
        return new Paragraph(opts);
    }

    private convertBlockquote(node: any): Paragraph[] {
        const out: Paragraph[] = [];
        for (const child of node.content || []) {
            const inlines = this.convertInlines(child.content || []);
            out.push(new Paragraph({
                children: inlines.length ? inlines : [new TextRun('')],
                indent: { left: 720 },
                border: {
                    left: { color: 'AAAAAA', space: 12, style: BorderStyle.SINGLE, size: 12 },
                },
            }));
        }
        return out.length ? out : [new Paragraph({ children: [new TextRun('')] })];
    }

    private convertTocPlaceholder(node: any): Paragraph[] {
        const title = node.attrs?.title || 'Table of contents';
        const minLevel = node.attrs?.minLevel ?? 1;
        const maxLevel = node.attrs?.maxLevel ?? 3;
        const showLeader = node.attrs?.showLeader !== false;
        const showPageNumbers = node.attrs?.showPageNumbers !== false;

        const out: Paragraph[] = [];
        // Title row.
        out.push(new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 28 })],
            spacing: { before: 240, after: 120 },
            border: { bottom: { color: 'CCCCCC', space: 6, style: BorderStyle.SINGLE, size: 6 } },
        }));

        const items = this._docHeadings.filter(h => h.level >= minLevel && h.level <= maxLevel);
        if (items.length === 0) {
            out.push(new Paragraph({
                children: [new TextRun({ text: '(No headings found.)', italics: true, color: '888888' })],
                spacing: { after: 240 },
            }));
            return out;
        }

        for (const item of items) {
            const indent = (item.level - minLevel) * 360;
            const isTopLevel = item.level === minLevel;
            const runs: any[] = [
                new TextRun({ text: item.text, bold: isTopLevel }),
            ];
            if (showLeader) {
                // Leader dots — a long string is the simplest cross-Word-version approach.
                runs.push(new TextRun({ text: ' ' + '.'.repeat(60) + ' ', color: '999999' }));
            } else if (showPageNumbers) {
                runs.push(new TextRun({ text: '  ' }));
            }
            if (showPageNumbers) {
                runs.push(new TextRun({ text: String(item.estimatedPage), color: '666666' }));
            }
            out.push(new Paragraph({
                children: runs,
                spacing: { after: 60 },
                indent: indent ? { left: indent } : undefined,
                tabStops: showLeader
                    ? [{ type: 'right' as any, position: 9000, leader: 'dot' as any }]
                    : undefined,
            }));
        }

        // Close with a blank line so the next block doesn't crowd the TOC.
        out.push(new Paragraph({ children: [new TextRun('')], spacing: { before: 120, after: 240 } }));
        return out;
    }

    private convertCodeBlock(node: any): Paragraph {
        const text = (node.content || []).map((c: any) => c.text || '').join('') || ' ';
        return new Paragraph({
            children: [new TextRun({ text, font: 'Consolas', size: 20 })],
            shading: { type: ShadingType.CLEAR, fill: 'F4F4F4', color: 'auto' },
            spacing: { before: 120, after: 120 },
            border: {
                top:    { color: 'DDDDDD', space: 6, style: BorderStyle.SINGLE, size: 4 },
                bottom: { color: 'DDDDDD', space: 6, style: BorderStyle.SINGLE, size: 4 },
                left:   { color: 'DDDDDD', space: 6, style: BorderStyle.SINGLE, size: 4 },
                right:  { color: 'DDDDDD', space: 6, style: BorderStyle.SINGLE, size: 4 },
            },
        });
    }

    private async convertImage(node: any): Promise<Paragraph> {
        const src: string | undefined = node.attrs?.src;
        const alignment = mapAlignment(node.attrs?.textAlign) || AlignmentType.CENTER;
        if (!src) return new Paragraph({ children: [new TextRun('')] });

        const data = await fetchImageData(src);
        if (!data) {
            // Fall back to a textual placeholder so Word doesn't choke on missing media.
            return new Paragraph({
                children: [new TextRun({ text: `[Image: ${node.attrs?.alt || src}]`, italics: true, color: '888888' })],
                alignment,
            });
        }
        const dim = parseImageSize(node.attrs);
        try {
            const imageRun = new ImageRun({
                type: data.type,
                data: data.bytes,
                transformation: dim,
            } as any);
            return new Paragraph({ children: [imageRun], alignment });
        } catch (e) {
            console.warn('[ExportEngine] ImageRun failed', e);
            return new Paragraph({
                children: [new TextRun({ text: `[Image: ${node.attrs?.alt || ''}]`, italics: true, color: '888888' })],
                alignment,
            });
        }
    }

    // ---- Lists -------------------------------------------------------------

    private async convertList(node: any, list: ListContext): Promise<Paragraph[]> {
        const out: Paragraph[] = [];
        for (const item of node.content || []) {
            if (item?.type !== 'listItem') continue;
            for (const child of item.content || []) {
                if (child.type === 'paragraph') {
                    out.push(this.convertParagraph(child, list));
                } else if (child.type === 'bulletList' || child.type === 'orderedList') {
                    const childList: ListContext = {
                        reference: child.attrs?.listStyle === 'nepali'
                            ? 'rk-nepali'
                            : (child.type === 'bulletList' ? 'rk-bullet' : 'rk-decimal'),
                        level: list.level + 1,
                    };
                    const nested = await this.convertList(child, childList);
                    out.push(...nested);
                }
            }
        }
        return out;
    }

    private convertTaskList(node: any): Paragraph[] {
        const out: Paragraph[] = [];
        for (const item of node.content || []) {
            if (item?.type !== 'taskItem') continue;
            const checked = !!item.attrs?.checked;
            const marker = checked ? '☑ ' : '☐ ';
            for (const child of item.content || []) {
                if (child.type === 'paragraph') {
                    const inlines = this.convertInlines(child.content || []);
                    out.push(new Paragraph({ children: [new TextRun(marker), ...inlines] }));
                }
            }
        }
        return out.length ? out : [new Paragraph({ children: [new TextRun('')] })];
    }

    // ---- Tables ------------------------------------------------------------

    private async convertTable(node: any): Promise<Table> {
        const rows: TableRow[] = [];
        for (const row of node.content || []) {
            if (row?.type !== 'tableRow') continue;
            rows.push(await this.convertTableRow(row));
        }
        if (rows.length === 0) {
            // Word requires non-empty tables.
            rows.push(new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun('')] })] })] }));
        }
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
        });
    }

    private async convertTableRow(node: any): Promise<TableRow> {
        const cells: TableCell[] = [];
        for (const cell of node.content || []) {
            cells.push(await this.convertTableCell(cell));
        }
        if (cells.length === 0) {
            cells.push(new TableCell({ children: [new Paragraph({ children: [new TextRun('')] })] }));
        }
        return new TableRow({ children: cells });
    }

    private async convertTableCell(node: any): Promise<TableCell> {
        const attrs = node.attrs || {};
        const isHeader = node.type === 'tableHeader';
        const childContent = await this.convertNodes(node.content || []);
        // Table cells must contain at least one Paragraph at the start and end.
        const children: (Paragraph | Table)[] = [];
        for (const c of childContent) children.push(c);
        if (children.length === 0 || !(children[0] instanceof Paragraph)) {
            children.unshift(new Paragraph({ children: [new TextRun('')] }));
        }
        if (!(children[children.length - 1] instanceof Paragraph)) {
            children.push(new Paragraph({ children: [new TextRun('')] }));
        }

        let fill: string | undefined;
        const bg = attrs.background || attrs.backgroundColor;
        if (bg) fill = colorToHex(bg);
        if (isHeader && !fill) fill = 'F3F4F6';

        return new TableCell({
            children: children as any,
            columnSpan: attrs.colspan || 1,
            rowSpan: attrs.rowspan || 1,
            verticalAlign: VerticalAlign.CENTER,
            shading: fill ? { fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
        });
    }

    // ---- Inline conversion -------------------------------------------------

    private convertInlines(inlines: any[]): any[] {
        const out: any[] = [];
        for (const inline of inlines || []) {
            if (!inline || typeof inline !== 'object') continue;
            if (inline.type === 'hardBreak') {
                out.push(new TextRun({ text: '', break: 1 }));
                continue;
            }
            if (inline.type === 'mathInline') {
                out.push(new TextRun({ text: inline.attrs?.latex || '', font: 'Cambria Math' }));
                continue;
            }
            if (inline.type === 'citation') {
                const label = inline.attrs?.label || inline.attrs?.key || '?';
                out.push(new TextRun({ text: `[${label}]`, superScript: true }));
                continue;
            }
            if (inline.type === 'footnote') {
                // Render footnote inline as italic superscript so the file remains valid.
                const text = inline.content?.map((c: any) => c.text || '').join('') || '*';
                out.push(new TextRun({ text, italics: true, superScript: true }));
                continue;
            }
            if (inline.type !== 'text') {
                if (Array.isArray(inline.content)) out.push(...this.convertInlines(inline.content));
                continue;
            }

            const fmt = this.collectFormat(inline.marks || []);
            if (fmt.href) {
                out.push(new ExternalHyperlink({
                    link: fmt.href,
                    children: [new TextRun({ text: inline.text || '', ...formatToRun(fmt), color: fmt.color || '0563C1', underline: { type: UnderlineType.SINGLE } })],
                }));
            } else {
                out.push(new TextRun({ text: inline.text || '', ...formatToRun(fmt) }));
            }
        }
        return out;
    }

    private collectFormat(marks: any[]): InlineFormat {
        const fmt: InlineFormat = {};
        for (const mark of marks || []) {
            switch (mark.type) {
                case 'bold': fmt.bold = true; break;
                case 'italic': fmt.italic = true; break;
                case 'underline': fmt.underline = true; break;
                case 'strike': fmt.strike = true; break;
                case 'subscript': fmt.subscript = true; break;
                case 'superscript': fmt.superscript = true; break;
                case 'code': fmt.code = true; break;
                case 'link': fmt.href = mark.attrs?.href || undefined; break;
                case 'highlight': {
                    const hex = colorToHex(mark.attrs?.color);
                    if (hex) fmt.highlight = hex;
                    break;
                }
                case 'textStyle': {
                    const a = mark.attrs || {};
                    if (a.color) {
                        const hex = colorToHex(a.color);
                        if (hex) fmt.color = hex;
                    }
                    if (a.fontFamily) {
                        fmt.font = String(a.fontFamily).replace(/['"]/g, '').split(',')[0].trim() || undefined;
                    }
                    if (a.fontSize) {
                        const size = parseFontSize(a.fontSize);
                        if (size) fmt.size = size;
                    }
                    break;
                }
                case 'trackInsert': fmt.color = '0A7C2F'; fmt.underline = true; break;
                case 'trackDelete': fmt.color = 'B3261E'; fmt.strike = true; break;
            }
        }
        return fmt;
    }

    // ---- Numbering definitions --------------------------------------------

    private numberingConfig(): { reference: string; levels: ILevelsOptions[] }[] {
        const decimal: ILevelsOptions[] = Array.from({ length: 9 }, (_, level) => ({
            level,
            format: LevelFormat.DECIMAL,
            text: `%${level + 1}.`,
            alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: (level + 1) * 720, hanging: 360 } } },
        }));
        const bullets = ['•', '◦', '▪', '•', '◦', '▪', '•', '◦', '▪'];
        const bullet: ILevelsOptions[] = bullets.map((b, level) => ({
            level,
            format: LevelFormat.BULLET,
            text: b,
            alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: (level + 1) * 720, hanging: 360 } } },
        }));
        const nepali: ILevelsOptions[] = Array.from({ length: 9 }, (_, level) => ({
            level,
            format: LevelFormat.DECIMAL,
            text: `%${level + 1}.`,
            alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: (level + 1) * 720, hanging: 360 } } },
        }));
        return [
            { reference: 'rk-decimal', levels: decimal },
            { reference: 'rk-bullet', levels: bullet },
            { reference: 'rk-nepali', levels: nepali },
        ];
    }
}

// =====================================================================
// Helpers (kept module-private)
// =====================================================================

function formatToRun(fmt: InlineFormat): IRunOptions {
    // IRunOptions has readonly fields, so we build a plain object then cast.
    const opts: Record<string, any> = {};
    if (fmt.bold) opts.bold = true;
    if (fmt.italic) opts.italics = true;
    if (fmt.strike) opts.strike = true;
    if (fmt.underline) opts.underline = { type: UnderlineType.SINGLE };
    if (fmt.subscript) opts.subScript = true;
    if (fmt.superscript) opts.superScript = true;
    if (fmt.color) opts.color = fmt.color;
    if (fmt.font) opts.font = fmt.font;
    if (fmt.size) opts.size = fmt.size;
    if (fmt.code) {
        opts.font = opts.font || 'Consolas';
        if (!opts.size) opts.size = 20;
    }
    if (fmt.highlight) {
        // Use shading for arbitrary hex highlighting (HighlightColor only takes
        // a fixed enum of named colors).
        opts.shading = { type: ShadingType.CLEAR, fill: fmt.highlight, color: 'auto' };
    }
    return opts as IRunOptions;
}

function applyParagraphStyling(node: any, opts: any) {
    const attrs = node.attrs || {};
    const spacing: any = {};
    const before = parseSpacingTwips(attrs.spacingBefore || attrs.marginTop);
    const after = parseSpacingTwips(attrs.spacingAfter || attrs.marginBottom);
    const line = attrs.lineHeight ? Math.round(parseFloat(attrs.lineHeight) * 240) : undefined;
    if (before !== undefined) spacing.before = before;
    if (after !== undefined) spacing.after = after;
    if (line !== undefined && !isNaN(line)) { spacing.line = line; spacing.lineRule = 'auto'; }
    if (Object.keys(spacing).length) opts.spacing = spacing;

    const indent: any = {};
    const left = parseIndentTwips(attrs.indent);
    const firstLine = parseIndentTwips(attrs.firstLineIndent);
    if (left !== undefined) indent.left = left;
    if (firstLine !== undefined) indent.firstLine = firstLine;
    if (Object.keys(indent).length) opts.indent = indent;

    const align = mapAlignment(attrs.textAlign);
    if (align) opts.alignment = align;
}

function mapAlignment(align?: string): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
    switch (align) {
        case 'center': return AlignmentType.CENTER;
        case 'right': return AlignmentType.RIGHT;
        case 'justify': return AlignmentType.JUSTIFIED;
        case 'left': return AlignmentType.LEFT;
        default: return undefined;
    }
}

function parseSpacingTwips(value: any): number | undefined {
    if (value == null || value === '') return undefined;
    if (typeof value === 'number') return Math.round(value * TWIPS_PER_PT);
    const s = String(value).trim();
    const num = parseFloat(s);
    if (isNaN(num)) return undefined;
    if (s.endsWith('in')) return Math.round(num * TWIPS_PER_INCH);
    if (s.endsWith('cm')) return Math.round(num * TWIPS_PER_CM);
    if (s.endsWith('mm')) return Math.round(num * TWIPS_PER_MM);
    if (s.endsWith('pt')) return Math.round(num * TWIPS_PER_PT);
    if (s.endsWith('px')) return Math.round(num * 15);
    if (s.endsWith('em') || s.endsWith('rem')) return Math.round(num * 240);
    return Math.round(num * TWIPS_PER_PT);
}

function parseIndentTwips(value: any): number | undefined {
    if (value == null || value === '') return undefined;
    if (typeof value === 'number') return Math.round(value * 720);
    const s = String(value).trim();
    const num = parseFloat(s);
    if (isNaN(num)) return undefined;
    if (s.endsWith('in')) return Math.round(num * TWIPS_PER_INCH);
    if (s.endsWith('cm')) return Math.round(num * TWIPS_PER_CM);
    if (s.endsWith('mm')) return Math.round(num * TWIPS_PER_MM);
    if (s.endsWith('pt')) return Math.round(num * TWIPS_PER_PT);
    if (s.endsWith('px')) return Math.round(num * 15);
    return Math.round(num * 720);
}

function parseFontSize(size: any): number | undefined {
    if (size == null || size === '') return undefined;
    const s = String(size).trim();
    const num = parseFloat(s);
    if (isNaN(num) || num <= 0) return undefined;
    if (s.endsWith('px')) return Math.max(2, Math.round((num * 0.75) * 2));
    if (s.endsWith('em') || s.endsWith('rem')) return Math.max(2, Math.round(num * 12 * 2));
    return Math.max(2, Math.round(num * 2));
}

function colorToHex(input: any): string | undefined {
    if (!input) return undefined;
    const s = String(input).trim();
    if (!s) return undefined;
    if (s.startsWith('#')) {
        let hex = s.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (/^[0-9A-Fa-f]{6}$/.test(hex)) return hex.toUpperCase();
    }
    if (s.startsWith('rgb')) {
        const parts = s.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const [r, g, b] = parts.slice(0, 3).map(n => Math.min(255, Math.max(0, parseInt(n, 10))));
            return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
        }
    }
    const named: Record<string, string> = {
        black: '000000', white: 'FFFFFF', red: 'FF0000', green: '008000', blue: '0000FF',
        yellow: 'FFFF00', orange: 'FFA500', purple: '800080', gray: '808080', grey: '808080',
    };
    return named[s.toLowerCase()];
}

function clamp(n: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, n));
}

function sectionPropertiesFromLayout(layout?: Partial<PageLayoutOptions>): any {
    const orientation = layout?.orientation === 'landscape'
        ? PageOrientation.LANDSCAPE
        : PageOrientation.PORTRAIT;
    const sizeKey = layout?.pageSize || 'A4';
    const dims = DOCX_PAGE_SIZES[sizeKey] || DOCX_PAGE_SIZES.A4;
    const [w, h] = orientation === PageOrientation.LANDSCAPE ? [dims[1], dims[0]] : dims;

    const margins = layout?.margins || { top: '1in', bottom: '1in', left: '1in', right: '1in' };
    return {
        page: {
            size: { width: w, height: h, orientation },
            margin: {
                top: parseSpacingTwips(margins.top) ?? TWIPS_PER_INCH,
                bottom: parseSpacingTwips(margins.bottom) ?? TWIPS_PER_INCH,
                left: parseSpacingTwips(margins.left) ?? TWIPS_PER_INCH,
                right: parseSpacingTwips(margins.right) ?? TWIPS_PER_INCH,
            },
        },
    };
}

async function fetchImageData(src: string): Promise<{ bytes: Uint8Array; type: 'png' | 'jpg' | 'gif' | 'bmp' } | null> {
    try {
        if (src.startsWith('data:')) {
            const match = src.match(/^data:([^;]+);base64,(.+)$/);
            if (!match) return null;
            const mime = match[1];
            // SVG can't be embedded as a raster image — skip rather than corrupt.
            if (mime.includes('svg')) return null;
            const bin = atob(match[2]);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            const type = mimeToDocxType(mime);
            return type ? { bytes, type } : null;
        }
        const res = await fetch(src);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        const mime = res.headers.get('content-type') || guessMimeFromUrl(src);
        if (mime.includes('svg')) return null;
        const type = mimeToDocxType(mime);
        return type ? { bytes: new Uint8Array(buf), type } : null;
    } catch (e) {
        console.warn('[ExportEngine] image fetch failed', src, e);
        return null;
    }
}

function mimeToDocxType(mime: string): 'png' | 'jpg' | 'gif' | 'bmp' | null {
    if (mime.includes('png')) return 'png';
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
    if (mime.includes('gif')) return 'gif';
    if (mime.includes('bmp')) return 'bmp';
    return null;
}

function guessMimeFromUrl(src: string): string {
    const m = src.split('?')[0].toLowerCase();
    if (m.endsWith('.png')) return 'image/png';
    if (m.endsWith('.jpg') || m.endsWith('.jpeg')) return 'image/jpeg';
    if (m.endsWith('.gif')) return 'image/gif';
    if (m.endsWith('.bmp')) return 'image/bmp';
    if (m.endsWith('.svg')) return 'image/svg+xml';
    return 'application/octet-stream';
}

function parseImageSize(attrs: any): { width: number; height: number } {
    const w = parseDimensionPx(attrs?.width);
    const h = parseDimensionPx(attrs?.height);
    const width = w && w > 0 ? w : 480;
    const height = h && h > 0 ? h : Math.round(width * 0.66);
    return { width, height };
}

interface HeadingInfo { level: number; text: string; estimatedPage: number }

function collectHeadings(doc: any): HeadingInfo[] {
    const out: HeadingInfo[] = [];
    let charCount = 0;
    const CHARS_PER_PAGE = 1500;
    const visit = (node: any) => {
        if (!node) return;
        if (node.type === 'text' && typeof node.text === 'string') {
            charCount += node.text.length;
        }
        if (node.type === 'heading' && Array.isArray(node.content)) {
            const text = textOf(node.content);
            if (text.trim()) {
                out.push({
                    level: node.attrs?.level || 1,
                    text,
                    estimatedPage: Math.max(1, Math.ceil(charCount / CHARS_PER_PAGE)),
                });
            }
        }
        if (Array.isArray(node.content)) {
            for (const child of node.content) visit(child);
        }
    };
    visit(doc);
    return out;
}

function textOf(content: any[]): string {
    return content.map((c: any) => {
        if (c?.type === 'text') return c.text || '';
        if (Array.isArray(c?.content)) return textOf(c.content);
        return '';
    }).join('');
}

function parseDimensionPx(v: any): number | null {
    if (v == null) return null;
    if (typeof v === 'number') return v;
    const s = String(v).trim();
    const num = parseFloat(s);
    if (isNaN(num) || num <= 0) return null;
    if (s.endsWith('%')) return null;
    if (s.endsWith('in')) return Math.round(num * 96);
    if (s.endsWith('cm')) return Math.round(num * 37.795);
    if (s.endsWith('mm')) return Math.round(num * 3.7795);
    if (s.endsWith('pt')) return Math.round(num * 1.333);
    return Math.round(num);
}
