import { Node, mergeAttributes } from '@tiptap/core';

export const Header = Node.create({
    name: 'header',
    group: 'block',
    content: 'block+',
    selectable: false,
    draggable: false,

    parseHTML() {
        return [{ tag: 'header.rk-header' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['header', mergeAttributes(HTMLAttributes, { class: 'rk-header' }), 0];
    },
});

export const Footer = Node.create({
    name: 'footer',
    group: 'block',
    content: 'block+',
    selectable: false,
    draggable: false,

    parseHTML() {
        return [{ tag: 'footer.rk-footer' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['footer', mergeAttributes(HTMLAttributes, { class: 'rk-footer' }), 0];
    },
});

export const PageNumber = Node.create({
    name: 'pageNumber',
    group: 'inline',
    inline: true,
    selectable: false,
    draggable: false,

    renderHTML() {
        return ['span', { class: 'rk-page-number' }, '1']; // Placeholder, UI handles actual number
    },
});
