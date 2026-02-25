import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pageBreak: {
            setPageBreak: () => ReturnType;
        };
    }
}

export const PageBreak = Node.create({
    name: 'pageBreak',

    group: 'block',

    parseHTML() {
        return [
            { tag: 'div[data-type="page-break"]' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page-break', class: 'rk-page-break' })];
    },

    addCommands() {
        return {
            setPageBreak: () => ({ commands }: { commands: any }) => {
                return (commands as any).insertContent({ type: this.name });
            },
        } as any;
    },
});
