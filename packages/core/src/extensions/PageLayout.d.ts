import { Extension } from '@tiptap/core';
export type PageSize = 'A4' | 'Letter' | 'Custom';
export type Orientation = 'portrait' | 'landscape';
export interface PageLayoutOptions {
    pageSize: PageSize;
    orientation: Orientation;
    width?: string;
    height?: string;
    margins: {
        top: string;
        bottom: string;
        left: string;
        right: string;
    };
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pageLayout: {
            /**
             * Set page size configuration
             */
            setPageLayout: (options: Partial<PageLayoutOptions>) => ReturnType;
        };
    }
}
export declare const PageLayout: Extension<PageLayoutOptions, any>;
