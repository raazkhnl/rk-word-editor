import { Node } from '@tiptap/core';
export interface SectionOptions {
    HTMLAttributes: Record<string, any>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        section: {
            /**
             * Insert a section break
             */
            insertSectionBreak: () => ReturnType;
        };
    }
}
export declare const Section: Node<SectionOptions, any>;
