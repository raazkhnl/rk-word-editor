import { Extension } from '@tiptap/core';

export const MultilevelList = Extension.create({
    name: 'multilevelList',

    addGlobalAttributes() {
        return [
            {
                types: ['bulletList', 'orderedList'],
                attributes: {
                    listStyle: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.getAttribute('data-list-style'),
                        renderHTML: (attributes: any) => {
                            if (!attributes.listStyle) return {};
                            return {
                                'data-list-style': attributes.listStyle,
                                style: `list-style-type: ${attributes.listStyle}`,
                            };
                        },
                    },
                    startNumber: {
                        default: 1,
                        parseHTML: (element: HTMLElement) => parseInt(element.getAttribute('start') || '1', 10),
                        renderHTML: (attributes: any) => {
                            if (!attributes.startNumber || attributes.startNumber === 1) return {};
                            return { start: String(attributes.startNumber) };
                        },
                    },
                },
            },
            {
                types: ['listItem'],
                attributes: {
                    listLevel: {
                        default: 1,
                        parseHTML: (element: HTMLElement) => parseInt(element.getAttribute('data-list-level') || '1', 10),
                        renderHTML: (attributes: any) => {
                            return { 'data-list-level': String(attributes.listLevel || 1) };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setListStyle: (listStyle: string) => ({ commands }: { commands: any }) => {
                return (
                    commands.updateAttributes('orderedList', { listStyle }) ||
                    commands.updateAttributes('bulletList', { listStyle })
                );
            },
            setListStartNumber: (startNumber: number) => ({ commands }: { commands: any }) => {
                return commands.updateAttributes('orderedList', { startNumber });
            },
            setLegalNumbering: () => ({ commands }: { commands: any }) => {
                return commands.updateAttributes('orderedList', { listStyle: 'decimal' });
            },
        } as any;
    },
});
