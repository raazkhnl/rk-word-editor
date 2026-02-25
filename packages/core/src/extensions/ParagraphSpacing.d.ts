import { Extension } from '@tiptap/core';
export interface ParagraphSpacingOptions {
    types: string[];
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        paragraphSpacing: {
            setParagraphSpacing: (spacing: {
                top?: string;
                bottom?: string;
            }) => ReturnType;
        };
    }
}
export declare const ParagraphSpacing: Extension<ParagraphSpacingOptions, any>;
