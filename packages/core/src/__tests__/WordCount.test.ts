import { describe, it, expect, beforeAll } from 'vitest';
import { WordEditor } from '../index';

beforeAll(() => {
    if (typeof (URL as any).createObjectURL !== 'function') {
        (URL as any).createObjectURL = () => 'blob:test';
    }
});

function makeEditor(html: string) {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const editor = new WordEditor({ element: el, initialContent: html, dragHandles: false });
    return editor;
}

describe('WordEditor.getWordCount', () => {
    it('counts words across separate paragraphs (regression)', () => {
        const editor = makeEditor('<p>apple</p><p>ball</p>');
        expect(editor.getWordCount().words).toBe(2);
        editor.destroy();
    });

    it('counts a sentence correctly', () => {
        const editor = makeEditor('<p>hello world this is a test</p>');
        expect(editor.getWordCount().words).toBe(6);
        editor.destroy();
    });

    it('returns 0 for empty content', () => {
        const editor = makeEditor('');
        expect(editor.getWordCount().words).toBe(0);
        editor.destroy();
    });

    it('counts across headings, lists, tables', () => {
        const editor = makeEditor(`
            <h1>title here</h1>
            <p>paragraph one</p>
            <ul><li><p>bullet point</p></li></ul>
        `);
        // "title here" + "paragraph one" + "bullet point" = 6 words
        expect(editor.getWordCount().words).toBe(6);
        editor.destroy();
    });

    it('counts characters with and without spaces', () => {
        const editor = makeEditor('<p>ab cd</p>');
        const wc = editor.getWordCount();
        expect(wc.charactersNoSpaces).toBe(4);
        expect(wc.characters).toBeGreaterThanOrEqual(4);
        editor.destroy();
    });
});
