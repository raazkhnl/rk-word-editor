import { Node, mergeAttributes } from '@tiptap/core';

export const Footnote = Node.create({
    name: 'footnote',

    group: 'inline',

    content: 'text*',

    inline: true,

    draggable: true,

    parseHTML() {
        return [
            {
                tag: 'footnote',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['footnote', mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setFootnote: () => ({ commands }: { commands: any }) => {
                return commands.insertContent({ type: this.name });
            },
        } as any;
    },
});
