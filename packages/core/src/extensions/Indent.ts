import { Extension } from '@tiptap/core';

export interface IndentOptions {
    types: string[];
    minIndent: number;
    maxIndent: number;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        indent: {
            indent: () => ReturnType;
            outdent: () => ReturnType;
        };
    }
}

export const Indent = Extension.create<IndentOptions>({
    name: 'indent',

    addOptions() {
        return {
            types: ['paragraph', 'heading', 'listItem'],
            minIndent: 0,
            maxIndent: 8,
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: 0,
                        parseHTML: (element) => parseInt(element.style.paddingLeft) / 40 || 0,
                        renderHTML: (attributes) => {
                            if (!attributes.indent) return {};
                            return { style: `padding-left: ${attributes.indent * 40}px` };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            indent: () => ({ commands }) => {
                return this.options.types.every((type) =>
                    commands.updateAttributes(type, (attrs: any) => ({
                        indent: Math.min((attrs.indent || 0) + 1, this.options.maxIndent),
                    }))
                );
            },
            outdent: () => ({ commands }) => {
                return this.options.types.every((type) =>
                    commands.updateAttributes(type, (attrs: any) => ({
                        indent: Math.max((attrs.indent || 0) - 1, this.options.minIndent),
                    }))
                );
            },
        };
    },
});
