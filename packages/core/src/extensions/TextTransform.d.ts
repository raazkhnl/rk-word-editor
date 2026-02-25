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
export declare const TextTransform: Extension<TextTransformOptions, any>;
