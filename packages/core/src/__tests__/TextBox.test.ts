import { describe, it, expect, beforeAll } from 'vitest';
import { WordEditor } from '../index';

beforeAll(() => {
    if (typeof (URL as any).createObjectURL !== 'function') {
        (URL as any).createObjectURL = () => 'blob:test';
    }
});

function makeEditor() {
    const el = document.createElement('div');
    document.body.appendChild(el);
    return new WordEditor({ element: el, dragHandles: false });
}

describe('TextBox extension', () => {
    it('inserts a text box with default attrs', () => {
        const editor = makeEditor();
        editor.format.insertTextBox();
        const json = editor.getJSON();
        const box = json.content.find((n: any) => n.type === 'textBox');
        expect(box).toBeTruthy();
        expect(box.attrs.width).toBe(320);
        expect(box.attrs.height).toBe(160);
        expect(Array.isArray(box.content) && box.content.length).toBeTruthy();
        editor.destroy();
    });

    it('inserts a text box with custom attrs', () => {
        const editor = makeEditor();
        editor.format.insertTextBox({ width: 500, height: 200, backgroundColor: '#fef3c7' });
        const box = editor.getJSON().content.find((n: any) => n.type === 'textBox');
        expect(box.attrs.width).toBe(500);
        expect(box.attrs.height).toBe(200);
        expect(box.attrs.backgroundColor).toBe('#fef3c7');
        editor.destroy();
    });

    it('survives export to docx (no throw)', async () => {
        const editor = makeEditor();
        editor.format.insertTextBox();
        const { ExportEngine } = await import('../ExportEngine');
        const engine = new ExportEngine();
        const blob = await engine.toBlob(editor.getJSON());
        expect(blob.size).toBeGreaterThan(1000);
        editor.destroy();
    });
});
