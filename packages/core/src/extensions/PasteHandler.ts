import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const PasteHandler = Extension.create({
    name: 'pasteHandler',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('pasteHandler'),
                props: {
                    handlePaste: (view, event) => {
                        const html = event.clipboardData?.getData('text/html');

                        if (html && (html.includes('office:word') || html.includes('mso-') || html.includes('docs-internal-guid'))) {
                            const domParser = new DOMParser();
                            const doc = domParser.parseFromString(html, 'text/html');

                            // Remove Word-specific tags and comments
                            const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_ELEMENT);
                            let node;
                            while (node = walker.nextNode()) {
                                if (node.nodeType === Node.COMMENT_NODE) {
                                    node.parentNode?.removeChild(node);
                                }
                            }

                            // Simple cleanup of inline styles that often break layouts
                            doc.querySelectorAll('*').forEach(el => {
                                if (el instanceof HTMLElement) {
                                    el.style.fontFamily = ''; // Clear forced fonts
                                    el.style.fontSize = '';   // Clear forced sizes
                                }
                            });
                        }

                        return false; // Let Tiptap/ProseMirror handle the rest
                    },
                },
            }),
        ];
    },
});
