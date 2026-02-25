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
                    fontVariant: {
                        default: null,
                        parseHTML: (element) => element.style.fontVariant,
                        renderHTML: (attributes) => {
                            if (!attributes.fontVariant) {
                                return {};
                            }

                            return {
                                style: `font-variant: ${attributes.fontVariant}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setTextTransform: (textTransform: string) => ({ chain }: { chain: any }) => {
                return chain()
                    .focus()
                    .setMark('textStyle', { textTransform })
                    .run();
            },
            toggleSmallCaps: () => ({ chain }: { chain: any }) => {
                return chain().focus().setMark('textStyle', { fontVariant: 'small-caps' }).run();
            },
            unsetTextTransform: () => ({ chain }: { chain: any }) => {
                return chain().focus().setMark('textStyle', { textTransform: null }).removeEmptyTextStyle().run();
            },
        };
    },
});
