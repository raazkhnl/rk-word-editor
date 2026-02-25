import { Extension } from '@tiptap/core';

export interface TextTransformOptions {
    types: string[];
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textTransform: {
            /**
             * Set the text transform
             */
            setTextTransform: (transform: string) => ReturnType;
            /**
             * Unset the text transform
             */
            unsetTextTransform: () => ReturnType;
        };
    }
}

export const TextTransform = Extension.create<TextTransformOptions>({
    name: 'textTransform',

    addOptions() {
        return {
            types: ['textStyle'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    textTransform: {
                        default: null,
                        parseHTML: (element) => element.style.textTransform,
                        renderHTML: (attributes) => {
                            if (!attributes.textTransform) {
                                return {};
                            }

                            return {
                                style: `text-transform: ${attributes.textTransform}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setTextTransform: (textTransform) => ({ chain }) => {
                return chain().setMark('textStyle', { textTransform }).run();
            },
            unsetTextTransform: () => ({ chain }) => {
                return chain().setMark('textStyle', { textTransform: null }).removeEmptyTextStyle().run();
            },
        };
    },
});
