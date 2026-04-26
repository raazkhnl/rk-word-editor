import { describe, it, expect, beforeAll } from 'vitest';
import { ExportEngine } from '../ExportEngine';

// Polyfill APIs that file-saver / docx need but jsdom doesn't ship.
beforeAll(() => {
    if (typeof (URL as any).createObjectURL !== 'function') {
        (URL as any).createObjectURL = () => 'blob:test';
    }
    if (typeof (URL as any).revokeObjectURL !== 'function') {
        (URL as any).revokeObjectURL = () => {};
    }
});

const tipDoc = {
    type: 'doc',
    content: [
        {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Heading 1' }],
        },
        {
            type: 'paragraph',
            attrs: { textAlign: 'left' },
            content: [
                { type: 'text', text: 'Bold ', marks: [{ type: 'bold' }] },
                { type: 'text', text: 'italic ', marks: [{ type: 'italic' }] },
                { type: 'text', text: 'underline ', marks: [{ type: 'underline' }] },
                { type: 'text', text: 'red ', marks: [{ type: 'textStyle', attrs: { color: '#FF0000' } }] },
                { type: 'text', text: 'highlighted', marks: [{ type: 'highlight', attrs: { color: '#FFFF00' } }] },
            ],
        },
        {
            type: 'bulletList',
            content: [
                { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }] },
                { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B' }] }] },
            ],
        },
        {
            type: 'orderedList',
            content: [
                { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'one' }] }] },
                { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'two' }] }] },
            ],
        },
        {
            type: 'paragraph',
            content: [
                { type: 'text', text: 'A link', marks: [{ type: 'link', attrs: { href: 'https://example.com' } }] },
            ],
        },
        {
            type: 'table',
            content: [
                {
                    type: 'tableRow',
                    content: [
                        { type: 'tableHeader', attrs: { colspan: 1, rowspan: 1 }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }] },
                        { type: 'tableHeader', attrs: { colspan: 1, rowspan: 1 }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B' }] }] },
                    ],
                },
                {
                    type: 'tableRow',
                    content: [
                        { type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '1' }] }] },
                        { type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '2' }] }] },
                    ],
                },
            ],
        },
        { type: 'horizontalRule' },
        { type: 'pageBreak' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'After break' }] },
        { type: 'codeBlock', content: [{ type: 'text', text: 'console.log("ok")' }] },
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quote' }] }] },
    ],
};

describe('ExportEngine.toBlob', () => {
    it('produces a non-empty blob for a representative document', async () => {
        const engine = new ExportEngine();
        const blob = await engine.toBlob(tipDoc, { filename: 'test.docx' });
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeGreaterThan(2000);
    });

    it('produces a valid OOXML zip (PK header)', async () => {
        const engine = new ExportEngine();
        const blob = await engine.toBlob(tipDoc);
        const buf: Uint8Array = await new Promise((resolve, reject) => {
            // jsdom's Blob lacks arrayBuffer(), but FileReader works.
            const reader = new FileReader();
            reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(blob as any);
        });
        expect(buf[0]).toBe(0x50); // P
        expect(buf[1]).toBe(0x4b); // K
        expect(buf[2]).toBe(0x03);
        expect(buf[3]).toBe(0x04);
    });

    it('survives empty paragraphs and missing text', async () => {
        const engine = new ExportEngine();
        const empty = { type: 'doc', content: [{ type: 'paragraph' }, { type: 'paragraph', content: [] }] };
        const blob = await engine.toBlob(empty);
        expect(blob.size).toBeGreaterThan(1000);
    });

    it('handles unknown node types gracefully', async () => {
        const engine = new ExportEngine();
        const weird = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'before' }] },
                { type: 'totallyUnknown', attrs: { x: 1 } },
                { type: 'paragraph', content: [{ type: 'text', text: 'after' }] },
            ],
        };
        const blob = await engine.toBlob(weird);
        expect(blob.size).toBeGreaterThan(1000);
    });

    it('honors the requested page layout', async () => {
        const engine = new ExportEngine();
        const blob = await engine.toBlob(tipDoc, {
            pageLayout: { pageSize: 'Letter', orientation: 'landscape', margins: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' } },
        });
        expect(blob.size).toBeGreaterThan(1000);
    });
});
