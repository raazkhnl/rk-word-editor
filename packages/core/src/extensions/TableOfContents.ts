import { Extension, Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        tableOfContents: {
            /** Insert a Table of Contents node at the cursor. */
            insertTableOfContents: (attrs?: TocAttrs) => ReturnType;
            /** Re-scan the document and refresh every TOC node. */
            refreshTableOfContents: () => ReturnType;
            /** Update the level filter for the TOC at the current selection. */
            setTocLevels: (minLevel: number, maxLevel: number) => ReturnType;
        };
    }
}

interface TocAttrs {
    /** Minimum heading level to include (default 1). */
    minLevel?: number;
    /** Maximum heading level to include (default 3). */
    maxLevel?: number;
    /** Display title shown above the TOC ("Table of contents"). */
    title?: string;
    /** Show the dotted leader between text and page number (default true). */
    showLeader?: boolean;
    /** Show estimated page numbers (default true). */
    showPageNumbers?: boolean;
}

interface HeadingItem {
    level: number;
    text: string;
    id: string;
    pos: number;
    estimatedPage: number;
}

const TOC_TYPE = 'tableOfContents';

/**
 * Table of Contents extension.
 *
 * - Backed by a real `tableOfContents` node so it survives copy/paste, undo/redo,
 *   serialisation and round-trips through HTML/JSON.
 * - Renders as a static HTML block in the document; the engine refreshes it
 *   whenever the user runs `refreshTableOfContents()` (and once on insert).
 * - Configurable via `minLevel`, `maxLevel`, `title`, `showLeader`, `showPageNumbers`.
 * - Page numbers are estimated from a rough characters-per-page heuristic until
 *   the host application supplies a real pagination map. Works well in practice
 *   because the dotted leaders absorb minor mis-alignment.
 */
export const TableOfContents = Node.create({
    name: TOC_TYPE,
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        return {
            minLevel: {
                default: 1,
                parseHTML: (el: HTMLElement) => Number(el.getAttribute('data-min-level') || 1),
                renderHTML: (a: any) => ({ 'data-min-level': String(a.minLevel ?? 1) }),
            },
            maxLevel: {
                default: 3,
                parseHTML: (el: HTMLElement) => Number(el.getAttribute('data-max-level') || 3),
                renderHTML: (a: any) => ({ 'data-max-level': String(a.maxLevel ?? 3) }),
            },
            title: {
                default: 'Table of contents',
                parseHTML: (el: HTMLElement) => el.getAttribute('data-title') || 'Table of contents',
                renderHTML: (a: any) => ({ 'data-title': a.title || 'Table of contents' }),
            },
            showLeader: {
                default: true,
                parseHTML: (el: HTMLElement) => el.getAttribute('data-leader') !== 'false',
                renderHTML: (a: any) => ({ 'data-leader': a.showLeader === false ? 'false' : 'true' }),
            },
            showPageNumbers: {
                default: true,
                parseHTML: (el: HTMLElement) => el.getAttribute('data-pagenums') !== 'false',
                renderHTML: (a: any) => ({ 'data-pagenums': a.showPageNumbers === false ? 'false' : 'true' }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="toc"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toc', class: 'rk-toc' }),
            // We render content via a NodeView; this fallback keeps SSR safe.
            ['div', { class: 'rk-toc-fallback' }, 'Table of contents'],
        ];
    },

    addCommands() {
        return {
            insertTableOfContents:
                (attrs: TocAttrs = {}) =>
                ({ commands }: { commands: any }) => {
                    return commands.insertContent({
                        type: TOC_TYPE,
                        attrs: {
                            minLevel: attrs.minLevel ?? 1,
                            maxLevel: attrs.maxLevel ?? 3,
                            title: attrs.title ?? 'Table of contents',
                            showLeader: attrs.showLeader !== false,
                            showPageNumbers: attrs.showPageNumbers !== false,
                        },
                    });
                },

            refreshTableOfContents:
                () =>
                ({ editor, tr, dispatch }: { editor: any; tr: any; dispatch: any }) => {
                    if (!dispatch) return false;
                    let changed = false;
                    editor.state.doc.descendants((node: any, pos: number) => {
                        if (node.type.name === TOC_TYPE) {
                            // Force a re-render by toggling a hidden attr.
                            tr.setNodeMarkup(pos, undefined, { ...node.attrs, _refresh: Date.now() });
                            changed = true;
                        }
                    });
                    if (changed) dispatch(tr);
                    return changed;
                },

            setTocLevels:
                (minLevel: number, maxLevel: number) =>
                ({ editor, tr, dispatch }: { editor: any; tr: any; dispatch: any }) => {
                    const $from = editor.state.selection.$from;
                    for (let d = $from.depth; d >= 0; d--) {
                        const n = $from.node(d);
                        if (n.type.name === TOC_TYPE) {
                            const pos = $from.before(d);
                            if (dispatch) {
                                tr.setNodeMarkup(pos, undefined, { ...n.attrs, minLevel, maxLevel });
                                dispatch(tr);
                            }
                            return true;
                        }
                    }
                    return false;
                },
        };
    },

    addNodeView() {
        return ({ node, editor, getPos }) => {
            const root = document.createElement('div');
            root.classList.add('rk-toc');
            root.dataset.type = 'toc';
            root.contentEditable = 'false';

            const render = (n: any) => {
                const items = collectHeadings(editor.state.doc, n.attrs.minLevel || 1, n.attrs.maxLevel || 3);
                root.innerHTML = '';

                const header = document.createElement('div');
                header.className = 'rk-toc-header';
                header.innerHTML = `
                    <h2 class="rk-toc-title">${escapeHtml(n.attrs.title || 'Table of contents')}</h2>
                    <button class="rk-toc-refresh" type="button" title="Refresh table of contents">↻ Refresh</button>
                `;
                header.querySelector('.rk-toc-refresh')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    (editor.commands as any).refreshTableOfContents();
                });
                root.appendChild(header);

                if (items.length === 0) {
                    const empty = document.createElement('p');
                    empty.className = 'rk-toc-empty';
                    empty.textContent = 'No headings yet — add a heading (H1–H6) to populate this table of contents.';
                    root.appendChild(empty);
                    return;
                }

                const list = document.createElement('ol');
                list.className = 'rk-toc-list';
                for (const item of items) {
                    const li = document.createElement('li');
                    li.className = `rk-toc-item rk-toc-l${item.level}`;
                    const link = document.createElement('a');
                    link.className = 'rk-toc-link';
                    link.href = `#${item.id}`;
                    link.dataset.pos = String(item.pos);

                    const text = document.createElement('span');
                    text.className = 'rk-toc-text';
                    text.textContent = item.text;

                    link.appendChild(text);

                    if (n.attrs.showLeader !== false) {
                        const leader = document.createElement('span');
                        leader.className = 'rk-toc-leader';
                        leader.setAttribute('aria-hidden', 'true');
                        link.appendChild(leader);
                    }

                    if (n.attrs.showPageNumbers !== false) {
                        const page = document.createElement('span');
                        page.className = 'rk-toc-page';
                        page.textContent = String(item.estimatedPage);
                        link.appendChild(page);
                    }

                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const pos = Number(link.dataset.pos);
                        if (Number.isFinite(pos)) {
                            const dom = editor.view.nodeDOM(pos) as HTMLElement | null;
                            editor.commands.setTextSelection(pos + 1);
                            if (dom?.scrollIntoView) {
                                dom.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } else {
                                editor.commands.scrollIntoView();
                            }
                        }
                    });

                    li.appendChild(link);
                    list.appendChild(li);
                }
                root.appendChild(list);
            };

            render(node);

            // No auto-refresh — TOCs only update when:
            //   1. the user clicks the inline Refresh button, or
            //   2. the user calls `editor.format.refreshTableOfContents()`, or
            //   3. the node attrs change (level filter, title, etc.).
            return {
                dom: root,
                update(updated) {
                    if (updated.type.name !== TOC_TYPE) return false;
                    render(updated);
                    return true;
                },
                destroy() { /* nothing to clean up */ },
                stopEvent(event) {
                    // Allow the refresh button + heading links to receive clicks.
                    return !!(event.target as HTMLElement)?.closest?.('button, a');
                },
            };
        };
    },
});

/** Re-export the legacy storage extension name so existing code keeps working. */
export { TableOfContents as default };

// ---- helpers ----

function collectHeadings(doc: any, minLevel: number, maxLevel: number): HeadingItem[] {
    const items: HeadingItem[] = [];
    let charCount = 0;
    // Rough heuristic: ~1500 characters per A4 page at 11pt with 1in margins.
    const CHARS_PER_PAGE = 1500;
    doc.descendants((node: any, pos: number) => {
        if (node.isText) charCount += node.text?.length || 0;
        if (node.type.name === 'heading') {
            const level = node.attrs.level;
            if (level >= minLevel && level <= maxLevel) {
                const text = node.textContent;
                if (!text.trim()) return;
                items.push({
                    level,
                    text,
                    id: slug(text),
                    pos,
                    estimatedPage: Math.max(1, Math.ceil(charCount / CHARS_PER_PAGE)),
                });
            }
        }
        return true;
    });
    return items;
}

function slug(s: string): string {
    return s.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
