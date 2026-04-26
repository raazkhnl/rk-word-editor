import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        titleSubtitle: {
            setTitle: () => ReturnType;
            setSubtitle: () => ReturnType;
        };
    }
}

/**
 * Title / Subtitle text-block nodes — Word- and Google-Docs-style top-of-document
 * styles that are distinct from regular headings (so they don't appear in the
 * TOC and so styling can be tuned independently).
 *
 * Each is a simple text-block with custom rendering and a corresponding
 * `setTitle()` / `setSubtitle()` command.
 */
export const Title = Node.create({
    name: 'title',
    group: 'block',
    content: 'inline*',
    defining: true,
    parseHTML() { return [{ tag: 'h1.rk-title' }, { tag: 'div[data-type="title"]' }]; },
    renderHTML({ HTMLAttributes }) {
        return ['h1', mergeAttributes(HTMLAttributes, { class: 'rk-title', 'data-type': 'title' }), 0];
    },
    addCommands() {
        return {
            setTitle: () => ({ commands }: any) => commands.setNode(this.name),
        } as any;
    },
});

export const Subtitle = Node.create({
    name: 'subtitle',
    group: 'block',
    content: 'inline*',
    defining: true,
    parseHTML() { return [{ tag: 'p.rk-subtitle' }, { tag: 'div[data-type="subtitle"]' }]; },
    renderHTML({ HTMLAttributes }) {
        return ['p', mergeAttributes(HTMLAttributes, { class: 'rk-subtitle', 'data-type': 'subtitle' }), 0];
    },
    addCommands() {
        return {
            setSubtitle: () => ({ commands }: any) => commands.setNode(this.name),
        } as any;
    },
});
