import { Node, mergeAttributes } from '@tiptap/core';

export const MathInline = Node.create({
    name: 'mathInline',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            latex: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-latex') || element.textContent,
                renderHTML: (attributes: any) => ({ 'data-latex': attributes.latex }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-type="math-inline"]' }];
    },

    renderHTML({ HTMLAttributes, node }: { HTMLAttributes: any; node: any }) {
        return [
            'span',
            mergeAttributes({ 'data-type': 'math-inline', class: 'rk-math-inline' }, HTMLAttributes),
            node.attrs.latex || '',
        ];
    },

    addCommands() {
        return {
            insertMathInline: (latex: string) => ({ commands }: { commands: any }) => {
                return commands.insertContent({
                    type: 'mathInline',
                    attrs: { latex },
                });
            },
        } as any;
    },
});

export const MathBlock = Node.create({
    name: 'mathBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            latex: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-latex') || element.textContent,
                renderHTML: (attributes: any) => ({ 'data-latex': attributes.latex }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="math-block"]' }];
    },

    renderHTML({ HTMLAttributes, node }: { HTMLAttributes: any; node: any }) {
        return [
            'div',
            mergeAttributes({ 'data-type': 'math-block', class: 'rk-math-block' }, HTMLAttributes),
            node.attrs.latex || '',
        ];
    },

    addCommands() {
        return {
            insertMathBlock: (latex: string) => ({ commands }: { commands: any }) => {
                return commands.insertContent({
                    type: 'mathBlock',
                    attrs: { latex },
                });
            },
        } as any;
    },
});
