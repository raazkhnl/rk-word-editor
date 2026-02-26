import { Mark, mergeAttributes } from '@tiptap/core';

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
            setLink: (attributes: { href: string; target?: string | null; rel?: string | null; class?: string | null }) => ReturnType;
            /**
             * Toggle a link mark
             */
            toggleLink: (attributes: { href: string; target?: string | null; rel?: string | null; class?: string | null }) => ReturnType;
            /**
             * Unset a link mark
             */
            unsetLink: () => ReturnType;
        };
    }
}

export const Link = Mark.create<LinkOptions>({
    name: 'link',

    priority: 1000,

    keepOnSplit: false,

    addOptions() {
        return {
            openOnClick: true,
            HTMLAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer nofollow',
                class: null,
            },
        };
    },

    addAttributes() {
        return {
            href: {
                default: null,
            },
            target: {
                default: this.options.HTMLAttributes.target,
            },
            rel: {
                default: this.options.HTMLAttributes.rel,
            },
            class: {
                default: this.options.HTMLAttributes.class,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'a[href]:not([href^="javascript:"])',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setLink: attributes => ({ chain }) => {
                return chain().setMark(this.name, attributes).setMeta('preventAutolink', true).run();
            },

            toggleLink: attributes => ({ chain }) => {
                return chain().toggleMark(this.name, attributes).setMeta('preventAutolink', true).run();
            },

            unsetLink: () => ({ chain }) => {
                return chain().unsetMark(this.name).setMeta('preventAutolink', true).run();
            },
        };
    },
});
