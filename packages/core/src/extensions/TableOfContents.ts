import { Extension } from '@tiptap/core';

export const TableOfContents = Extension.create({
    name: 'tableOfContents',

    addStorage() {
        return {
            headings: [] as { level: number; text: string; id: string }[],
        };
    },

    onTransaction() {
        const headings: { level: number; text: string; id: string }[] = [];
        this.editor.state.doc.descendants((node: any) => {
            if (node.type.name === 'heading') {
                const text = node.textContent;
                const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                headings.push({ level: node.attrs.level, text, id });
            }
        });
        this.storage.headings = headings;
    },

    addCommands() {
        return {
            insertTableOfContents: () => ({ commands }: { commands: any; state: any }) => {
                const headings = this.storage.headings as any[];
                if (!headings.length) return false;

                const tocContent = headings.map((h: any) => ({
                    type: 'paragraph',
                    content: [{ type: 'text', text: `${'  '.repeat(h.level - 1)}${h.text}` }],
                }));

                return commands.insertContent(tocContent);
            },
        } as any;
    },
});
