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
export declare const LineHeight: Extension<LineHeightOptions, any>;
