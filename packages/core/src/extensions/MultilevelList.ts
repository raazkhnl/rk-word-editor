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
                                class: attributes.listStyle === 'nepali' ? 'rk-list-nepali' : '',
                                style: `list-style-type: ${attributes.listStyle === 'nepali' ? 'none' : attributes.listStyle}`,
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
            setListStyle: (listStyle: string) => ({ state, dispatch }: { state: any, dispatch?: any }) => {
                const { selection } = state;
                let tr = state.tr;
                let found = false;

                state.doc.nodesBetween(selection.from, selection.to, (node: any, pos: number) => {
                    if (node.type.name === 'orderedList' || node.type.name === 'bulletList') {
                        tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, listStyle });
                        found = true;
                    }
                });

                if (found) {
                    if (dispatch) dispatch(tr);
                    return true;
                }

                return false;
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
