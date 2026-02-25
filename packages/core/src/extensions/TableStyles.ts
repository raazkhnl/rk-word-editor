import { Extension } from '@tiptap/core';

/**
 * TableStyles extension - Adds style attributes to tables.
 */
export const TableStyles = Extension.create({
    name: 'tableStyles',

    addGlobalAttributes() {
        return [
            {
                types: ['table'],
                attributes: {
                    tableStyle: {
                        default: 'standard',
                        parseHTML: (element: HTMLElement) => element.getAttribute('data-table-style'),
                        renderHTML: (attributes: any) => {
                            if (!attributes.tableStyle) return {};
                            return { 'data-table-style': attributes.tableStyle };
                        },
                    },
                    borderWidth: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.style.borderWidth,
                        renderHTML: (attributes: any) => {
                            if (!attributes.borderWidth) return {};
                            return { style: `border-width: ${attributes.borderWidth}` };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setTableStyle: (style: string) => ({ commands }: { commands: any }) => {
                return commands.updateAttributes('table', { tableStyle: style });
            },
            setTableBorder: (width: string) => ({ commands }: { commands: any }) => {
                return commands.updateAttributes('table', { borderWidth: width });
            },
        } as any;
    },
});
