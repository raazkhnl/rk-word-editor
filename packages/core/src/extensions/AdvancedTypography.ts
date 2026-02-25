import { Extension } from '@tiptap/core';

export interface AdvancedTypographyOptions {
    types: string[];
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        advancedTypography: {
            /**
             * Set the letter spacing
             */
            setLetterSpacing: (spacing: string) => ReturnType;
            /**
             * Unset the letter spacing
             */
            unsetLetterSpacing: () => ReturnType;
            /**
             * Set the word spacing
             */
            setWordSpacing: (spacing: string) => ReturnType;
            /**
             * Unset the word spacing
             */
            unsetWordSpacing: () => ReturnType;
        };
    }
}

export const AdvancedTypography = Extension.create<AdvancedTypographyOptions>({
    name: 'advancedTypography',

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
                    letterSpacing: {
                        default: null,
                        parseHTML: element => element.style.letterSpacing,
                        renderHTML: attributes => {
                            if (!attributes.letterSpacing) {
                                return {};
                            }

                            return {
                                style: `letter-spacing: ${attributes.letterSpacing}`,
                            };
                        },
                    },
                    wordSpacing: {
                        default: null,
                        parseHTML: element => element.style.wordSpacing,
                        renderHTML: attributes => {
                            if (!attributes.wordSpacing) {
                                return {};
                            }

                            return {
                                style: `word-spacing: ${attributes.wordSpacing}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setLetterSpacing: (letterSpacing) => ({ chain }) => {
                return chain().setMark('textStyle', { letterSpacing }).run();
            },
            unsetLetterSpacing: () => ({ chain }) => {
                return chain().setMark('textStyle', { letterSpacing: null }).removeEmptyTextStyle().run();
            },
            setWordSpacing: (wordSpacing) => ({ chain }) => {
                return chain().setMark('textStyle', { wordSpacing }).run();
            },
            unsetWordSpacing: () => ({ chain }) => {
                return chain().setMark('textStyle', { wordSpacing: null }).removeEmptyTextStyle().run();
            },
        };
    },
});
