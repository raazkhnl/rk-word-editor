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

export const PageLayout = Extension.create<PageLayoutOptions>({
    name: 'pageLayout',

    addOptions() {
        return {
            pageSize: 'A4',
            orientation: 'portrait',
            margins: {
                top: '1in',
                bottom: '1in',
                left: '1in',
                right: '1in',
            },
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: ['paragraph', 'heading', 'bulletList', 'orderedList', 'taskList'],
                attributes: {
                    // This allows us to track which page layout applies to which block
                    // In a complex document, this might be linked to a Section ID
                    pageLayoutId: {
                        default: 'default',
                        parseHTML: element => element.getAttribute('data-page-layout-id') || 'default',
                        renderHTML: attributes => {
                            if (attributes.pageLayoutId === 'default') return {};
                            return { 'data-page-layout-id': attributes.pageLayoutId };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setPageLayout: (options) => ({ editor }) => {
                // In a real implementation, this would update a document-wide metadata
                // For now, we update the extension options and trigger a style update
                Object.assign(this.options, options);

                // We emit a custom event that the UI can listen to for updating the CSS variables
                (editor as any).emit('pageLayoutUpdate', this.options);

                return true;
            },
        };
    },
});
