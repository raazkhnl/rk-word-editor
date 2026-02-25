import { Node, mergeAttributes } from '@tiptap/core';

export const Citation = Node.create({
    name: 'citation',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            key: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-key'),
                renderHTML: (attributes: any) => ({ 'data-key': attributes.key }),
            },
            label: {
                default: '',
                parseHTML: (element: HTMLElement) => element.textContent,
                renderHTML: () => ({}),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'cite[data-type="citation"]' }];
    },

    renderHTML({ HTMLAttributes, node }: { HTMLAttributes: any; node: any }) {
        return [
            'cite',
            mergeAttributes({ 'data-type': 'citation', class: 'rk-citation' }, HTMLAttributes),
            `[${node.attrs.label || node.attrs.key || '?'}]`,
        ];
    },

    addCommands() {
        return {
            insertCitation: (key: string, label?: string) => ({ commands }: { commands: any }) => {
                return commands.insertContent({
                    type: 'citation',
                    attrs: { key, label: label || key },
                });
            },
        } as any;
    },
});

export const Bibliography = Node.create({
    name: 'bibliography',
    group: 'block',
    content: 'block+',

    parseHTML() {
        return [{ tag: 'section[data-type="bibliography"]' }];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
        return [
            'section',
            mergeAttributes({ 'data-type': 'bibliography', class: 'rk-bibliography' }, HTMLAttributes),
            0,
        ];
    },

    addCommands() {
        return {
            insertBibliography: () => ({ commands }: { commands: any }) => {
                return commands.insertContent({
                    type: 'bibliography',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'References' }] }],
                });
            },
        } as any;
    },
});
