import { describe, it, expect } from 'vitest';
import { DocumentValidator } from '../DocumentValidator';

describe('DocumentValidator', () => {
    it('returns a basic document for a string input (it only validates objects)', () => {
        const html = '<p>Hello world</p>';
        expect(DocumentValidator.validate(html)).toEqual({ type: 'doc', content: [] });
    });

    it('returns a valid Tiptap JSON document unchanged', () => {
        const doc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hi' }] }] };
        expect(DocumentValidator.validate(doc)).toEqual(doc);
    });

    it('handles null/undefined gracefully', () => {
        expect(DocumentValidator.validate(null as any)).toEqual({ type: 'doc', content: [] });
        expect(DocumentValidator.validate(undefined as any)).toEqual({ type: 'doc', content: [] });
    });
});
