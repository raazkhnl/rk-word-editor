import { Extension } from '@tiptap/core';

export interface IndentOptions {
    types: string[];
    minIndent: number;
    maxIndent: number;
    indentSize: number; // Added indentSize
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
            indentSize: 1, // Default indent size
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: 0,
                        parseHTML: (element) => parseInt(element.style.marginLeft) / 40 || 0,
                        renderHTML: (attributes) => {
                            if (!attributes.indent) return {};
                            return { style: `margin-left: ${attributes.indent * 40}px` };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            indent: () => ({ commands }) => {
                if (this.editor.isActive('listItem')) {
                    return (this.editor.chain().focus() as any).sinkListItem('listItem').run();
                }
                const types = this.options.types.filter(t => t !== 'listItem');
                return types.every(type => {
                    const currentIndent = this.editor.getAttributes(type).indent || 0;
                    return commands.updateAttributes(type, {
                        indent: Math.min(currentIndent + this.options.indentSize, this.options.maxIndent),
                    });
                });
            },
            outdent: () => ({ commands }) => {
                if (this.editor.isActive('listItem')) {
                    return (this.editor.chain().focus() as any).liftListItem('listItem').run();
                }
                const types = this.options.types.filter(t => t !== 'listItem');
                return types.every(type => {
                    const currentIndent = this.editor.getAttributes(type).indent || 0;
                    return commands.updateAttributes(type, {
                        indent: Math.max(this.options.minIndent, currentIndent - this.options.indentSize),
                    });
                });
            },
        };
    },
});
