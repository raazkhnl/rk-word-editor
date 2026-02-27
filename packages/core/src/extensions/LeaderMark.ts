import { Mark, mergeAttributes } from '@tiptap/core';

export const LeaderMark = Mark.create({
    name: 'leader',

    addAttributes() {
        return {
            class: {
                default: 'rk-toc-leader',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span.rk-toc-leader',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
});
