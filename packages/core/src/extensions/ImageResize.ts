import { Extension } from '@tiptap/core';

export const ImageResize = Extension.create({
    name: 'imageResize',

    addGlobalAttributes() {
        return [
            {
                types: ['image'],
                attributes: {
                    width: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.getAttribute('width') || element.style.width,
                        renderHTML: (attributes: any) => {
                            if (!attributes.width) return {};
                            return { style: `width: ${attributes.width}; max-width: 100%;` };
                        },
                    },
                    height: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.getAttribute('height') || element.style.height,
                        renderHTML: (attributes: any) => {
                            if (!attributes.height) return {};
                            return { style: `height: ${attributes.height};` };
                        },
                    },
                    float: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.style.float || null,
                        renderHTML: (attributes: any) => {
                            if (!attributes.float) return {};
                            return { style: `float: ${attributes.float}; margin: 0.5em;` };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setImageSize: (width: string, height?: string) => ({ commands }: { commands: any }) => {
                return commands.updateAttributes('image', { width, height: height || null });
            },
            setImageFloat: (float: 'left' | 'right' | 'none') => ({ commands }: { commands: any }) => {
                return commands.updateAttributes('image', { float: float === 'none' ? null : float });
            },
            setImageInline: () => ({ commands }: { commands: any }) => {
                return commands.updateAttributes('image', { float: null });
            },
        } as any;
    },
});
