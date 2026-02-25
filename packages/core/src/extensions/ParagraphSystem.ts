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

export const ParagraphSystem = Extension.create<ParagraphSystemOptions>({
    name: 'paragraphSystem',

    addOptions() {
        return {
            types: ['paragraph', 'heading'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    spacingBefore: {
                        default: null,
                        parseHTML: element => element.style.marginTop,
                        renderHTML: attributes => {
                            if (!attributes.spacingBefore) return {};
                            return { style: `margin-top: ${attributes.spacingBefore}` };
                        },
                    },
                    spacingAfter: {
                        default: null,
                        parseHTML: element => element.style.marginBottom,
                        renderHTML: attributes => {
                            if (!attributes.spacingAfter) return {};
                            return { style: `margin-bottom: ${attributes.spacingAfter}` };
                        },
                    },
                    firstLineIndent: {
                        default: null,
                        parseHTML: element => element.style.textIndent,
                        renderHTML: attributes => {
                            if (!attributes.firstLineIndent) return {};
                            return { style: `text-indent: ${attributes.firstLineIndent}` };
                        },
                    },
                    hangingIndent: {
                        default: null,
                        parseHTML: element => {
                            const padding = element.style.paddingLeft;
                            const indent = element.style.textIndent;
                            if (indent.startsWith('-')) return padding;
                            return null;
                        },
                        renderHTML: attributes => {
                            if (!attributes.hangingIndent) return {};
                            return {
                                style: `padding-left: ${attributes.hangingIndent}; text-indent: -${attributes.hangingIndent}`,
                            };
                        },
                    },
                    backgroundColor: {
                        default: null,
                        parseHTML: element => element.style.backgroundColor,
                        renderHTML: attributes => {
                            if (!attributes.backgroundColor) return {};
                            return { style: `background-color: ${attributes.backgroundColor}` };
                        },
                    },
                    border: {
                        default: null,
                        parseHTML: element => element.style.border,
                        renderHTML: attributes => {
                            if (!attributes.border) return {};
                            return { style: `border: ${attributes.border}` };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setParagraphLayout: (attrs) => ({ commands }) => {
                return this.options.types.every((type) =>
                    commands.updateAttributes(type, {
                        spacingBefore: attrs.before,
                        spacingAfter: attrs.after,
                        firstLineIndent: attrs.firstLineIndent,
                        hangingIndent: attrs.hangingIndent,
                        backgroundColor: attrs.backgroundColor,
                        border: attrs.border,
                    })
                );
            },
        };
    },
});
