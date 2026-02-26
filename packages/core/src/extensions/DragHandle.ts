import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * DragHandle extension - Renders a ⠿ drag handle in the left gutter for
 * each block-level node. Clicking and dragging reorders blocks.
 */
export const DragHandle = Extension.create({
    name: 'dragHandle',

    addProseMirrorPlugins() {
        let draggedNode: { from: number; to: number } | null = null;
        let handleEl: HTMLElement | null = null;
        let currentPos: number | null = null;

        const plugin = new Plugin({
            key: new PluginKey('dragHandle'),

            view(editorView: any) {
                handleEl = document.createElement('div');
                handleEl.className = 'rk-drag-handle';
                handleEl.innerHTML = '⠿';
                handleEl.contentEditable = 'false';
                handleEl.setAttribute('draggable', 'true');
                handleEl.title = 'Drag to reorder';
                document.body.appendChild(handleEl);

                const hide = () => {
                    if (handleEl) handleEl.style.display = 'none';
                };

                const onMouseMove = (e: MouseEvent) => {
                    if (!handleEl) return;
                    const target = e.target as HTMLElement;

                    // Find the nearest block-level node
                    const pos = editorView.posAtCoords({ left: e.clientX, top: e.clientY });
                    if (!pos) { hide(); return; }

                    const resolved = editorView.state.doc.resolve(pos.pos);
                    const blockDepth = resolved.depth > 0 ? 1 : 0;
                    const blockNode = resolved.node(blockDepth);
                    if (!blockNode || !blockNode.isBlock) { hide(); return; }

                    const dom = editorView.nodeDOM(resolved.start(blockDepth));
                    if (!dom || !(dom instanceof Element)) { hide(); return; }

                    const rect = dom.getBoundingClientRect();
                    const editorRect = editorView.dom.getBoundingClientRect();

                    handleEl.style.display = 'flex';
                    handleEl.style.top = `${rect.top + window.scrollY}px`;
                    handleEl.style.left = `${editorRect.left + window.scrollX - 25}px`;

                    // FIXED: Ensure we don't try to get 'before' the top-level document node (depth 0)
                    try {
                        currentPos = blockDepth > 0 ? resolved.before(blockDepth) : 0;
                    } catch (err) {
                        currentPos = 0;
                    }
                };

                handleEl.addEventListener('dragstart', (e: DragEvent) => {
                    if (currentPos === null) return;
                    const $pos = editorView.state.doc.resolve(currentPos);
                    const node = $pos.nodeAfter;
                    if (!node) return;
                    draggedNode = { from: currentPos, to: currentPos + node.nodeSize };
                    e.dataTransfer?.setData('text/plain', '');
                });

                handleEl.addEventListener('dragend', () => {
                    draggedNode = null;
                });

                editorView.dom.addEventListener('mousemove', onMouseMove);
                editorView.dom.parentElement?.addEventListener('mouseleave', hide);

                return {
                    destroy() {
                        handleEl?.remove();
                        editorView.dom.removeEventListener('mousemove', onMouseMove);
                    },
                };
            },

            props: {
                handleDrop(view: any, event: DragEvent, _slice: any, moved: boolean) {
                    if (!draggedNode || !moved) return false;

                    const coords = { left: event.clientX, top: event.clientY };
                    const dropPos = view.posAtCoords(coords);
                    if (!dropPos) return false;

                    const { from, to } = draggedNode;
                    const targetPos = dropPos.pos;

                    // Don't drop inside itself
                    if (targetPos >= from && targetPos <= to) return false;

                    const node = view.state.doc.slice(from, to).content.firstChild;
                    if (!node) return false;

                    const tr = view.state.tr;
                    // Delete from original position
                    tr.delete(from, to);
                    // Insert at new position (adjusted)
                    const insertAt = targetPos > to ? targetPos - (to - from) : targetPos;
                    tr.insert(insertAt, node);
                    view.dispatch(tr);
                    draggedNode = null;
                    event.preventDefault();
                    return true;
                },
            },
        });

        return [plugin];
    },
});
