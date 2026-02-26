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
export declare const AdvancedTypography: Extension<AdvancedTypographyOptions, any>;
