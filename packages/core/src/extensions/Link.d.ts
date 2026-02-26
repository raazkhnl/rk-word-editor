import { Mark } from '@tiptap/core';
export interface LinkOptions {
    /**
     * If enabled, it will be opened by a click.
     */
    openOnClick: boolean;
    /**
     * HTML attributes to add to the link element.
     */
    HTMLAttributes: Record<string, any>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        link: {
            /**
             * Set a link mark
             */
            setLink: (attributes: {
                href: string;
                target?: string | null;
                rel?: string | null;
                class?: string | null;
            }) => ReturnType;
            /**
             * Toggle a link mark
             */
            toggleLink: (attributes: {
                href: string;
                target?: string | null;
                rel?: string | null;
                class?: string | null;
            }) => ReturnType;
            /**
             * Unset a link mark
             */
            unsetLink: () => ReturnType;
        };
    }
}
export declare const Link: Mark<LinkOptions, any>;
