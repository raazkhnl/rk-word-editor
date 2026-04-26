import { Extension } from '@tiptap/core';

export type PageSize = 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom';
export type Orientation = 'portrait' | 'landscape';

export interface PageLayoutOptions {
    pageSize: PageSize;
    orientation: Orientation;
    /** Custom width when pageSize is 'Custom' (e.g. '210mm'). */
    width?: string;
    /** Custom height when pageSize is 'Custom' (e.g. '297mm'). */
    height?: string;
    margins: {
        top: string;
        bottom: string;
        left: string;
        right: string;
    };
}

export const DEFAULT_PAGE_LAYOUT: PageLayoutOptions = {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
    },
};

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pageLayout: {
            setPageLayout: (options: Partial<PageLayoutOptions>) => ReturnType;
        };
    }
}

export const PageLayout = Extension.create<PageLayoutOptions>({
    name: 'pageLayout',

    addOptions() {
        return { ...DEFAULT_PAGE_LAYOUT };
    },

    addStorage() {
        return { ...DEFAULT_PAGE_LAYOUT };
    },

    onCreate() {
        Object.assign(this.storage, this.options);
    },

    addCommands() {
        return {
            setPageLayout: (options) => ({ editor }) => {
                Object.assign(this.options, options);
                if (options.margins) {
                    this.options.margins = { ...this.options.margins, ...options.margins };
                }
                Object.assign(this.storage, this.options);
                const parent = (editor as any).options.parent;
                if (parent && typeof parent.setPageLayout === 'function') {
                    parent.setPageLayout(this.options);
                }
                return true;
            },
        };
    },
});
