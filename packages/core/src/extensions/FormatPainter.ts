import { Extension } from '@tiptap/core';

interface StoredFormat {
    marks: { type: string; attrs: Record<string, any> }[];
    nodeAttrs: Record<string, any> | null;
}

/**
 * FormatPainter extension - Copies formatting from one selection and applies
 * it to the next selection (like the paintbrush tool in Word/Google Docs).
 */
export const FormatPainter = Extension.create({
    name: 'formatPainter',

    addStorage() {
        return {
            isActive: false,
            storedFormat: null as StoredFormat | null,
        };
    },

    addCommands() {
        return {
            startFormatPaint: () => ({ editor }: { editor: any }) => {
                const { state } = editor;
                const { from, to } = state.selection;

                // Capture all marks at the cursor/selection
                const marks: { type: string; attrs: Record<string, any> }[] = [];
                state.doc.nodesBetween(from, to, (node: any) => {
                    if (node.isText) {
                        node.marks.forEach((mark: any) => {
                            if (!marks.find(m => m.type === mark.type.name)) {
                                marks.push({ type: mark.type.name, attrs: { ...mark.attrs } });
                            }
                        });
                    }
                });

                // Also capture the node (paragraph/heading) attributes at cursor
                const $from = state.selection.$from;
                const nodeAttrs = $from.parent.isTextblock
                    ? { ...($from.parent.attrs || {}) }
                    : null;

                this.storage.storedFormat = { marks, nodeAttrs };
                this.storage.isActive = true;

                // Add cursor class
                if (editor.view.dom) {
                    editor.view.dom.classList.add('rk-format-paint-mode');
                }

                return true;
            },

            cancelFormatPaint: () => ({ editor }: { editor: any }) => {
                this.storage.isActive = false;
                this.storage.storedFormat = null;
                editor.view.dom?.classList.remove('rk-format-paint-mode');
                return true;
            },

            applyStoredFormat: () => ({ editor, commands }: { editor: any; commands: any }) => {
                if (!this.storage.isActive || !this.storage.storedFormat) return false;

                const { marks } = this.storage.storedFormat;

                // First clear existing marks
                commands.unsetAllMarks();

                // Apply each stored mark
                marks.forEach((mark: { type: string; attrs: Record<string, any> }) => {
                    try {
                        editor.chain().setMark(mark.type, mark.attrs).run();
                    } catch {
                        // Ignore unsupported marks
                    }
                });

                // Deactivate after single use
                this.storage.isActive = false;
                this.storage.storedFormat = null;
                editor.view.dom?.classList.remove('rk-format-paint-mode');

                return true;
            },
        } as any;
    },

    onSelectionUpdate() {
        // If format paint is active and we have a selection, apply the format
        if (this.storage.isActive && this.storage.storedFormat) {
            const { from, to } = this.editor.state.selection;
            if (from !== to) {
                // Small delay to let selection settle
                setTimeout(() => {
                    (this.editor.commands as any).applyStoredFormat();
                }, 10);
            }
        }
    },
});
