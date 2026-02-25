import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Caption node - Adds a caption to images and tables.
 * Allows numbered captions "Figure 1: ..." or "Table 2: ...".
 */
export const Caption = Node.create({
    name: 'caption',
    group: 'block',
    content: 'inline*',
    selectable: false,
    draggable: false,

    addAttributes() {
        return {
            captionType: {
                default: 'Figure',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-caption-type'),
                renderHTML: (attributes: any) => ({ 'data-caption-type': attributes.captionType }),
            },
            captionNumber: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute('data-caption-number'),
                renderHTML: (attributes: any) => {
                    if (!attributes.captionNumber) return {};
                    return { 'data-caption-number': attributes.captionNumber };
                },
            },
        };
    },

    parseHTML() {
        return [{ tag: 'figcaption' }];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
        return ['figcaption', mergeAttributes({ class: 'rk-caption' }, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            insertCaption: (type = 'Figure') => ({ commands }: { commands: any }) => {
                return commands.insertContent({
                    type: 'caption',
                    attrs: { captionType: type },
                    content: [{ type: 'text', text: `${type}: ` }],
                });
            },
        } as any;
    },
});
