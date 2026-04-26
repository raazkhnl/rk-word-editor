import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

interface StoredFormat {
    /** Inline marks to clone (bold, italic, color, font, size, …). */
    marks: { type: string; attrs: Record<string, any> }[];
    /** The textblock type and attrs (alignment, line height, indent, …) at the cursor. */
    nodeType: string | null;
    nodeAttrs: Record<string, any>;
}

/**
 * Word-style format painter.
 *
 * Click the painter, optionally with text selected, to capture the formatting
 * (both inline marks AND block attributes — alignment, line-height, indent,
 * spacing). Then click anywhere or drag to apply that formatting to the next
 * selection. Press Esc to cancel.
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
                const $from = state.selection.$from;

                // 1. Capture inline marks across the selection (or at the cursor).
                const marks: { type: string; attrs: Record<string, any> }[] = [];
                const seen = new Set<string>();
                const range = from === to
                    ? [Math.max(0, from - 1), from]
                    : [from, to];
                state.doc.nodesBetween(range[0], range[1], (node: any) => {
                    if (!node.isText) return;
                    for (const mark of node.marks) {
                        if (seen.has(mark.type.name)) continue;
                        seen.add(mark.type.name);
                        marks.push({ type: mark.type.name, attrs: { ...mark.attrs } });
                    }
                });
                // Also pick up stored marks at the cursor (e.g. user typed nothing yet but toggled bold)
                for (const m of state.storedMarks || $from.marks() || []) {
                    if (!seen.has(m.type.name)) {
                        seen.add(m.type.name);
                        marks.push({ type: m.type.name, attrs: { ...m.attrs } });
                    }
                }

                // 2. Capture textblock attrs (alignment, lineHeight, indent, marginTop/Bottom).
                const parent = $from.parent;
                const nodeType = parent.isTextblock ? parent.type.name : null;
                const nodeAttrs = parent.isTextblock ? { ...parent.attrs } : {};

                this.storage.storedFormat = { marks, nodeType, nodeAttrs };
                this.storage.isActive = true;
                editor.view.dom?.classList.add('rk-format-paint-mode');
                return true;
            },

            cancelFormatPaint: () => ({ editor }: { editor: any }) => {
                this.storage.isActive = false;
                this.storage.storedFormat = null;
                editor.view.dom?.classList.remove('rk-format-paint-mode');
                return true;
            },

            applyStoredFormat: () => ({ editor, tr, dispatch }: { editor: any; tr: any; dispatch: any }) => {
                if (!this.storage.isActive || !this.storage.storedFormat) return false;
                const fmt = this.storage.storedFormat as StoredFormat;
                const { from, to } = editor.state.selection;
                if (from === to) return false; // need a selection to paint onto

                // (a) Apply node attrs to the textblocks in the range.
                if (fmt.nodeType) {
                    editor.state.doc.nodesBetween(from, to, (node: any, pos: number) => {
                        if (!node.isTextblock) return;
                        const targetType = editor.schema.nodes[fmt.nodeType!];
                        if (!targetType) return;
                        try {
                            tr.setNodeMarkup(pos, targetType, { ...node.attrs, ...fmt.nodeAttrs });
                        } catch { /* node type mismatch — skip */ }
                    });
                }

                // (b) Clear existing inline marks, then apply the captured marks.
                tr.removeMark(from, to);
                for (const mark of fmt.marks) {
                    const markType = editor.schema.marks[mark.type];
                    if (!markType) continue;
                    try {
                        tr.addMark(from, to, markType.create(mark.attrs));
                    } catch { /* skip incompatible marks */ }
                }

                if (dispatch) dispatch(tr);

                // Single-shot: deactivate after one application.
                this.storage.isActive = false;
                this.storage.storedFormat = null;
                editor.view.dom?.classList.remove('rk-format-paint-mode');
                return true;
            },
        } as any;
    },

    addKeyboardShortcuts() {
        return {
            Escape: () => {
                if (this.storage.isActive) {
                    (this.editor.commands as any).cancelFormatPaint();
                    return true;
                }
                return false;
            },
        };
    },

    addProseMirrorPlugins() {
        const ext = this;
        return [
            new Plugin({
                key: new PluginKey('formatPainterApply'),
                props: {
                    handleDOMEvents: {
                        mouseup(_view, _event) {
                            if (!ext.storage.isActive) return false;
                            // Defer so the selection has been updated by the time we apply.
                            setTimeout(() => {
                                if (ext.storage.isActive) {
                                    (ext.editor.commands as any).applyStoredFormat();
                                }
                            }, 0);
                            return false;
                        },
                    },
                },
            }),
        ];
    },
});
