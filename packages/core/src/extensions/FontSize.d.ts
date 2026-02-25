import { Extension } from '@tiptap/core';
export interface FontSizeOptions {
    types: string[];
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            /**
             * Set the font size
             */
            setFontSize: (size: string) => ReturnType;
            /**
             * Unset the font size
             */
            unsetFontSize: () => ReturnType;
        };
    }
}
export declare const FontSize: Extension<FontSizeOptions, any>;
