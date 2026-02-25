import { Node, mergeAttributes } from '@tiptap/core';

export interface SectionOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        section: {
            /**
             * Insert a section break
             */
            insertSectionBreak: () => ReturnType;
        };
    }
}

export const Section = Node.create<SectionOptions>({
    name: 'section',
    group: 'block',
    content: 'block+',
    defining: true,

    addAttributes() {
        return {
            id: {
                default: null,
            },
            pageSize: {
                default: 'A4',
            },
            orientation: {
                default: 'portrait',
            },
            marginTop: {
                default: '1in',
            },
            marginBottom: {
                default: '1in',
            },
            marginLeft: {
                default: '1in',
            },
            marginRight: {
                default: '1in',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'section.rk-section',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['section', mergeAttributes(HTMLAttributes, { class: 'rk-section' }), 0];
    },

    addCommands() {
        return {
            insertSectionBreak: () => ({ chain }) => {
                return chain()
                    .focus()
                    .insertContent({ type: this.name, content: [{ type: 'paragraph' }] })
                    .run();
            },
        };
    },
});
