import { Extension } from '@tiptap/core';
import { StyleManager } from '../StyleManager';

export interface StylesEngineOptions {
    manager: StyleManager;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        stylesEngine: {
            /**
             * Apply a named style to the selection.
             */
            applyNamedStyle: (name: string) => ReturnType;
            /**
             * Update a named style definition.
             */
            updateNamedStyle: (name: string, attributes: Record<string, any>) => ReturnType;
        };
    }
}

export const StylesEngine = Extension.create<StylesEngineOptions>({
    name: 'stylesEngine',

    addOptions() {
        return {
            manager: new StyleManager(),
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: ['paragraph', 'heading'],
                attributes: {
                    styleName: {
                        default: 'Normal',
                        parseHTML: element => element.getAttribute('data-style-name') || 'Normal',
                        renderHTML: attributes => {
                            if (!attributes.styleName || attributes.styleName === 'Normal') {
                                return {};
                            }
                            return { 'data-style-name': attributes.styleName };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            applyNamedStyle: (name: string) => ({ chain, commands }) => {
                const resolvedAttributes = this.options.manager.resolveStyle(name);

                // 1. Update the block attributes (spacing, align, etc.)
                // 2. Wrap/Update the node type if necessary (e.g. Heading 1 -> heading level 1)
                let chainExec = chain().focus().updateAttributes('paragraph', { styleName: name, ...resolvedAttributes });

                if (name.startsWith('Heading')) {
                    const level = (parseInt(name.replace('Heading ', '')) || 1) as any;
                    chainExec = chainExec.setHeading({ level }).updateAttributes('heading', { styleName: name, ...resolvedAttributes });
                } else if (name === 'Normal' || name === 'Quote') {
                    chainExec = chainExec.setParagraph().updateAttributes('paragraph', { styleName: name, ...resolvedAttributes });
                }

                // 3. Apply character marks if defined in the style (e.g. bold, fontSize)
                // Note: In Tiptap, some attributes are marks and some are node attributes.
                // For simplicity in Phase 2, we focus on node attributes.

                return chainExec.run();
            },

            updateNamedStyle: (name, attributes) => () => {
                const style = this.options.manager.getStyle(name);
                if (style) {
                    style.attributes = { ...style.attributes, ...attributes };
                    // TODO: In a more advanced implementation, this should trigger a re-render of all nodes with this style
                    return true;
                }
                return false;
            },
        };
    },
});
