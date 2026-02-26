import { Extension } from '@tiptap/core';
export interface ParagraphSystemOptions {
    types: string[];
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        paragraphSystem: {
            /**
             * Set paragraph spacing
             */
            setParagraphLayout: (attrs: {
                before?: string;
                after?: string;
                firstLineIndent?: string;
                hangingIndent?: string;
                backgroundColor?: string;
                border?: string;
            }) => ReturnType;
        };
    }
}
export declare const ParagraphSystem: Extension<ParagraphSystemOptions, any>;
