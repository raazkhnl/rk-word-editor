import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, SectionType, IParagraphOptions, Table, TableRow, TableCell, WidthType, VerticalAlign, ShadingType, LevelFormat } from 'docx';
import { saveAs } from 'file-saver';
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

export class ExportEngine {
    private styleManager: StyleManager;

    constructor(styleManager: StyleManager) {
        this.styleManager = styleManager;
    }

    /**
     * Main entry point for DOCX export.
     * Converts Tiptap JSON to docx Document.
     */
    public async exportToDocx(json: any): Promise<void> {
        const doc = new Document({
            sections: [
                {
                    children: this.convertNodes(json.content) as any[],
                },
            ],
        });

        const buffer = await Packer.toBlob(doc);
        saveAs(buffer, 'document.docx');
    }

    private convertNodes(nodes: any[]): any[] {
        if (!nodes) return [];

        let result: any[] = [];
        nodes.forEach(node => {
            switch (node.type) {
                case 'paragraph':
                    result.push(this.convertParagraph(node));
                    break;
                case 'heading':
                    result.push(this.convertHeading(node));
                    break;
                case 'table':
                    result.push(this.convertTable(node));
                    break;
                case 'bulletList':
                case 'orderedList':
                    result.push(...this.convertList(node));
                    break;
                case 'pageBreak':
                    result.push(new Paragraph({ children: [], pageBreakBefore: true }));
                    break;
                case 'horizontalRule':
                    result.push(new Paragraph({ thematicBreak: true }));
                    break;
                case 'image':
                    result.push(this.convertImage(node));
                    break;
                case 'footnote':
                    // Docx footnotes are complex, adding as a paragraph for now or ignoring if not supported
                    result.push(new Paragraph({ children: [new TextRun({ text: '[Footnote]', italics: true })] }));
                    break;
                default:
                    result.push(new Paragraph({ children: [new TextRun({ text: `[Unsupported Node: ${node.type}]` })] }));
            }
        });
        return result.filter(Boolean);
    }

    private convertImage(node: any): Paragraph {
        // This requires the 'ImageRun' from docx and potentially fetching the image data
        // For now, we'll placeholder it as images in docx export usually require base64/buffer
        return new Paragraph({
            children: [
                new TextRun({ text: `[Image: ${node.attrs?.src || 'unnamed'}]`, color: '0000FF' })
            ],
            alignment: AlignmentType.CENTER
        });
    }

    private convertList(node: any, level: number = 0): Paragraph[] {
        const paragraphs: Paragraph[] = [];
        const isOrdered = node.type === 'orderedList';

        (node.content || []).forEach((listItem: any) => {
            if (listItem.type === 'listItem') {
                (listItem.content || []).forEach((child: any) => {
                    if (child.type === 'paragraph') {
                        const p = this.convertParagraph(child, {
                            numbering: {
                                reference: isOrdered ? 'default-numbering' : 'bullet-numbering',
                                level,
                            },
                        });
                        paragraphs.push(p);
                    } else if (child.type === 'bulletList' || child.type === 'orderedList') {
                        paragraphs.push(...this.convertList(child, level + 1));
                    }
                });
            }
        });
        return paragraphs;
    }

    private convertParagraph(node: any, listOptions?: any): Paragraph {
        let children = this.convertInlines(node.content);

        // Safety: Docx Paragraphs shouldn't be entirely empty
        if (children.length === 0) {
            children = [new TextRun("")];
        }

        const options: any = {
            children,
            spacing: {
                before: this.parseSpacing(node.attrs?.spacingBefore),
                after: this.parseSpacing(node.attrs?.spacingAfter),
                line: node.attrs?.lineHeight ? Math.round(parseFloat(node.attrs.lineHeight) * 240) : undefined,
                lineRule: node.attrs?.lineHeight ? 'auto' : undefined,
            },
            indent: {
                left: this.parseIndent(node.attrs?.indent),
                firstLine: this.parseIndent(node.attrs?.firstLineIndent),
            },
            ...listOptions,
        };

        const align = this.mapAlignment(node.attrs?.textAlign);
        if (align) {
            options.alignment = align;
        }

        return new Paragraph(options as IParagraphOptions);
    }

    private convertHeading(node: any): Paragraph {
        const level = node.attrs?.level || 1;
        const headingLevels: any = {
            1: HeadingLevel.HEADING_1,
            2: HeadingLevel.HEADING_2,
            3: HeadingLevel.HEADING_3,
            4: HeadingLevel.HEADING_4,
            5: HeadingLevel.HEADING_5,
            6: HeadingLevel.HEADING_6,
        };

        const options: any = {
            children: this.convertInlines(node.content),
            heading: headingLevels[level] || HeadingLevel.HEADING_1,
            spacing: {
                before: this.parseSpacing(node.attrs?.spacingBefore),
                after: this.parseSpacing(node.attrs?.spacingAfter),
            },
        };

        const align = this.mapAlignment(node.attrs?.textAlign);
        if (align) {
            options.alignment = align;
        }

        return new Paragraph(options as IParagraphOptions);
    }

    private convertTable(node: any): Table {
        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
            rows: (node.content || []).map((row: any) => this.convertTableRow(row)),
        });
    }

    private convertTableRow(node: any): TableRow {
        return new TableRow({
            children: (node.content || []).map((cell: any) => this.convertTableCell(cell)),
        });
    }

    private convertTableCell(node: any): TableCell {
        const attrs = node.attrs || {};
        return new TableCell({
            children: this.convertNodes(node.content),
            columnSpan: attrs.colspan || 1,
            rowSpan: attrs.rowspan || 1,
            verticalAlign: VerticalAlign.CENTER,
            shading: attrs.background ? {
                fill: attrs.background.replace('#', ''),
                type: ShadingType.CLEAR,
            } : undefined,
        });
    }

    private convertInlines(inlines: any[]): TextRun[] {
        if (!inlines) return [];
        return inlines.map(inline => {
            if (inline.type === 'text') {
                const marks = inline.marks || [];
                const isBold = marks.some((m: any) => m.type === 'bold');
                const isItalic = marks.some((m: any) => m.type === 'italic');
                const isUnderline = marks.some((m: any) => m.type === 'underline');

                const styleMark = marks.find((m: any) => m.type === 'textStyle') as any;
                const fontSize = styleMark?.attrs?.fontSize;

                return new TextRun({
                    text: inline.text || '',
                    bold: isBold,
                    italics: isItalic,
                    underline: isUnderline ? {} : undefined,
                    size: fontSize ? this.parseFontSize(fontSize) as any : undefined,
                });
            }
            return null;
        }).filter(Boolean) as TextRun[];
    }

    private parseSpacing(spacing: any): number | undefined {
        if (!spacing) return undefined;
        const value = typeof spacing === 'string' ? parseFloat(spacing) : spacing;
        if (isNaN(value)) return undefined;

        // Convert to twips (1/20 of a point)
        if (typeof spacing === 'string' && spacing.endsWith('px')) {
            return Math.round(value * 15);
        }
        return Math.round(value * 20);
    }

    private parseIndent(indent: any): number | undefined {
        if (typeof indent === 'number') return Math.round(indent * 720);
        if (typeof indent === 'string') {
            const value = parseFloat(indent);
            if (isNaN(value)) return undefined;
            if (indent.endsWith('in')) return Math.round(value * 1440);
            if (indent.endsWith('pt')) return Math.round(value * 20);
            return Math.round(value * 15);
        }
        return undefined;
    }

    private parseFontSize(size: any): number | undefined {
        if (!size) return undefined;
        const value = typeof size === 'string' ? parseFloat(size) : size;
        if (isNaN(value)) return undefined;
        return Math.round(value * 2); // Docx uses half-points
    }

    private mapAlignment(align?: string): any {
        switch (align) {
            case 'center': return AlignmentType.CENTER;
            case 'right': return AlignmentType.RIGHT;
            case 'justify': return AlignmentType.JUSTIFIED;
            case 'left': return AlignmentType.LEFT;
            default: return undefined;
        }
    }
}
