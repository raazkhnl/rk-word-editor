import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface PaginationOptions {
    /** Enable visual page boundaries (defaults to true). */
    enabled: boolean;
    /** Inside-page area in pixels — calculated from page layout when not given. */
    contentHeightPx: number | null;
    /** CSS pixel offset between consecutive page sheets (defaults to 32px). */
    gap: number;
}

const KEY = new PluginKey<DecorationSet>('rkPagination');

/**
 * Visually splits the editor surface into pages by measuring rendered block
 * heights and inserting "page boundary" widget decorations at each multiple of
 * the configured page height. Decorations are display-only — they don't change
 * the document model, so cursor positions, selections, undo/redo and exports
 * all behave identically. Hard `<div data-type="page-break">` page breaks
 * inserted by the user reset the running height so the next boundary aligns
 * with the user's intended break.
 */
export const Pagination = Extension.create<PaginationOptions>({
    name: 'pagination',

    addOptions() {
        return {
            enabled: true,
            contentHeightPx: null,
            gap: 24,
        };
    },

    addStorage() {
        return {
            // Set by the host (WordEditor) whenever the page layout changes.
            contentHeightPx: 0,
            // Updated by computePageBoundaries on every recompute.
            pageCount: 1,
            measuredHeight: 0,
        };
    },

    addProseMirrorPlugins() {
        const ext = this;
        return [
            new Plugin<DecorationSet>({
                key: KEY,
                state: {
                    init: () => DecorationSet.empty,
                    apply(tr, oldSet) {
                        // Recompute ONLY when explicitly requested via meta (the
                        // view triggers this via rAF + throttle). Mapping
                        // through `tr.mapping` keeps existing decorations
                        // anchored across edits in the meantime.
                        if (tr.getMeta(KEY)) return computePageBoundaries(ext);
                        return oldSet.map(tr.mapping, tr.doc);
                    },
                },
                view(view) {
                    // Throttled, rAF-debounced recompute that ignores layout
                    // shifts caused by our own decoration changes — that loop
                    // was the source of the flicker.
                    let rafId: number | null = null;
                    let lastRun = 0;
                    let lastWidth = view.dom.clientWidth;
                    const MIN_INTERVAL = 200;

                    const recompute = (force = false) => {
                        if (rafId) cancelAnimationFrame(rafId);
                        rafId = requestAnimationFrame(() => {
                            rafId = null;
                            const now = performance.now();
                            if (!force && now - lastRun < MIN_INTERVAL) {
                                // Re-schedule once the cooldown elapses.
                                setTimeout(() => recompute(true), MIN_INTERVAL - (now - lastRun));
                                return;
                            }
                            lastRun = now;
                            try { view.dispatch(view.state.tr.setMeta(KEY, true)); } catch { /* destroyed */ }
                        });
                    };

                    // First paint.
                    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => recompute(true));

                    // Only react to ResizeObserver when WIDTH actually changes
                    // (height changes from our own spacers should never trigger us).
                    let obs: ResizeObserver | null = null;
                    if (typeof ResizeObserver !== 'undefined') {
                        obs = new ResizeObserver((entries) => {
                            const next = view.dom.clientWidth;
                            if (Math.abs(next - lastWidth) < 1) return;
                            lastWidth = next;
                            recompute();
                        });
                        obs.observe(view.dom);
                    }

                    const onWindowResize = () => recompute();
                    if (typeof window !== 'undefined') {
                        window.addEventListener('resize', onWindowResize);
                    }

                    return {
                        update: (newView, oldState) => {
                            // Only recompute on actual document changes (not on
                            // selection-only or decoration-only transactions).
                            if (!newView.state.doc.eq(oldState.doc)) recompute();
                        },
                        destroy: () => {
                            if (rafId) cancelAnimationFrame(rafId);
                            obs?.disconnect();
                            if (typeof window !== 'undefined') {
                                window.removeEventListener('resize', onWindowResize);
                            }
                        },
                    };
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },
            }),
        ];
    },
});

function computePageBoundaries(ext: any): DecorationSet {
    if (!ext.options.enabled) return DecorationSet.empty;
    const editor = ext.editor;
    if (!editor || !editor.view) return DecorationSet.empty;

    const pageHeight: number =
        ext.storage.contentHeightPx ||
        ext.options.contentHeightPx ||
        defaultA4ContentPx();
    if (pageHeight <= 100) return DecorationSet.empty;

    const view = editor.view;
    const proseMirror = view.dom as HTMLElement;
    if (!proseMirror) return DecorationSet.empty;

    const decos: Decoration[] = [];
    let pageIndex = 1;
    // Y coordinate (relative to proseMirror, top-of-padding) where the current
    // page's USABLE area starts. Initially it's the top padding (page margin).
    const padTop = parseFloat(getComputedStyle(proseMirror).paddingTop || '0') || 0;
    let pageStartY = padTop;

    const containerRect = proseMirror.getBoundingClientRect();
    let totalContentHeight = 0;

    editor.state.doc.forEach((node: any, offset: number) => {
        const dom = view.nodeDOM(offset) as HTMLElement | null;
        if (!dom || !(dom instanceof HTMLElement)) return;

        const rect = dom.getBoundingClientRect();
        const top = rect.top - containerRect.top;
        const bottom = top + rect.height;
        totalContentHeight = Math.max(totalContentHeight, bottom);

        // Hard page-break node: push the NEXT block to the top of the next page.
        if (node.type.name === 'pageBreak') {
            const pageEnd = pageStartY + pageHeight;
            const remaining = Math.max(0, pageEnd - top);
            // Spacer fills the rest of the current page; next block lands at top of next page.
            decos.push(makeSpacer(offset + node.nodeSize, remaining, true));
            pageStartY = pageEnd;
            pageIndex += 1;
            return;
        }

        // Auto page break: this block would cross the boundary — push it whole
        // to the next page so it doesn't get sliced in half by the boundary line.
        const pageEnd = pageStartY + pageHeight;
        if (bottom > pageEnd && top < pageEnd && rect.height < pageHeight) {
            const remaining = Math.max(0, pageEnd - top);
            decos.push(makeSpacer(offset, remaining, false));
            pageStartY = pageEnd;
            pageIndex += 1;
        } else if (bottom > pageEnd) {
            // Block taller than a full page — let it span; just bump page index.
            while (bottom > pageStartY + pageHeight) {
                pageStartY += pageHeight;
                pageIndex += 1;
            }
        }
    });

    ext.storage.pageCount = Math.max(1, pageIndex);
    ext.storage.measuredHeight = totalContentHeight;

    return DecorationSet.create(editor.state.doc, decos);
}

function makeSpacer(pos: number, height: number, fromHardBreak: boolean): Decoration {
    const el = document.createElement('div');
    el.className = fromHardBreak ? 'rk-page-spacer rk-page-spacer-hard' : 'rk-page-spacer';
    el.contentEditable = 'false';
    el.setAttribute('aria-hidden', 'true');
    el.style.height = `${Math.max(0, Math.round(height))}px`;
    return Decoration.widget(pos, el, { side: fromHardBreak ? 1 : -1, ignoreSelection: true });
}

function defaultA4ContentPx(): number {
    // 297mm tall, minus 1in top + 1in bottom margin ≈ 245mm of content area.
    // 1mm ≈ 3.7795px → ~926px content area.
    return Math.round(245 * 3.7795);
}
