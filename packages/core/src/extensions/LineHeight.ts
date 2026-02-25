import { Extension } from '@tiptap/core';

export interface LineHeightOptions {
    types: string[];
    defaultLineHeight: string;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        lineHeight: {
            setLineHeight: (height: string) => ReturnType;
            unsetLineHeight: () => ReturnType;
        };
    }
}

export const LineHeight = Extension.create<LineHeightOptions>({
    name: 'lineHeight',

    addOptions() {
        return {
            types: ['paragraph', 'heading'],
            defaultLineHeight: 'normal',
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: this.options.defaultLineHeight,
                        parseHTML: (element) => element.style.lineHeight || this.options.defaultLineHeight,
                        renderHTML: (attributes) => {
                            if (attributes.lineHeight === this.options.defaultLineHeight) {
                                return {};
                            }

                            return {
                                style: `line-height: ${attributes.lineHeight}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setLineHeight: (lineHeight) => ({ commands }) => {
                return this.options.types.every((type) => commands.updateAttributes(type, { lineHeight }));
            },
            unsetLineHeight: () => ({ commands }) => {
                return this.options.types.every((type) => commands.updateAttributes(type, { lineHeight: this.options.defaultLineHeight }));
            },
        };
    },
});
