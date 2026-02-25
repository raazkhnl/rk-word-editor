import { Extension } from '@tiptap/core';

export interface ParagraphSpacingOptions {
    types: string[];
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        paragraphSpacing: {
            setParagraphSpacing: (spacing: { top?: string, bottom?: string }) => ReturnType;
        };
    }
}

export const ParagraphSpacing = Extension.create<ParagraphSpacingOptions>({
    name: 'paragraphSpacing',

    addOptions() {
        return {
            types: ['paragraph'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    marginTop: {
                        default: null,
                        parseHTML: (element) => element.style.marginTop,
                        renderHTML: (attributes) => {
                            if (!attributes.marginTop) return {};
                            return { style: `margin-top: ${attributes.marginTop}` };
                        },
                    },
                    marginBottom: {
                        default: null,
                        parseHTML: (element) => element.style.marginBottom,
                        renderHTML: (attributes) => {
                            if (!attributes.marginBottom) return {};
                            return { style: `margin-bottom: ${attributes.marginBottom}` };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setParagraphSpacing: (spacing) => ({ commands }) => {
                return this.options.types.every((type) => commands.updateAttributes(type, {
                    marginTop: spacing.top,
                    marginBottom: spacing.bottom
                }));
            },
        };
    },
});
