import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textBox: {
            /** Insert a free-floating text box at the cursor. */
            insertTextBox: (attrs?: { width?: number; height?: number; backgroundColor?: string; borderColor?: string }) => ReturnType;
        };
    }
}

/**
 * TextBox — a Word-style floating text frame that can be dragged and resized.
 * Renders as a `<div>` block with rich content inside (paragraphs, lists, etc.).
 *
 * Behaviour:
 *   - Inserts at the current selection.
 *   - Drag the `⠿` handle on the top-left to move it on the page.
 *   - Eight corner / edge handles let you resize while keeping content reflowing inside.
 *   - The position is persisted via `data-x` / `data-y` attributes.
 *
 * Useful for callouts, sidebars, pull quotes, diagrams.
 */
export const TextBox = Node.create({
    name: 'textBox',
    group: 'block',
    content: 'block+',
    defining: true,
    isolating: true,
    draggable: true,

    addAttributes() {
        return {
            width: {
                default: 320,
                parseHTML: (el: HTMLElement) => parseInt(el.getAttribute('data-width') || '0', 10) || 320,
                renderHTML: (attrs: any) => ({ 'data-width': String(attrs.width) }),
            },
            height: {
                default: 160,
                parseHTML: (el: HTMLElement) => parseInt(el.getAttribute('data-height') || '0', 10) || 160,
                renderHTML: (attrs: any) => ({ 'data-height': String(attrs.height) }),
            },
            x: {
                default: 0,
                parseHTML: (el: HTMLElement) => parseInt(el.getAttribute('data-x') || '0', 10),
                renderHTML: (attrs: any) => ({ 'data-x': String(attrs.x || 0) }),
            },
            y: {
                default: 0,
                parseHTML: (el: HTMLElement) => parseInt(el.getAttribute('data-y') || '0', 10),
                renderHTML: (attrs: any) => ({ 'data-y': String(attrs.y || 0) }),
            },
            backgroundColor: {
                default: null,
                parseHTML: (el: HTMLElement) => el.style.backgroundColor || null,
                renderHTML: (attrs: any) => attrs.backgroundColor ? { style: `background-color: ${attrs.backgroundColor}` } : {},
            },
            borderColor: {
                default: '#cbd5e1',
                parseHTML: (el: HTMLElement) => el.style.borderColor || '#cbd5e1',
                renderHTML: (attrs: any) => ({}),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="text-box"]' }];
    },

    renderHTML({ HTMLAttributes, node }) {
        const w = node.attrs.width || 320;
        const h = node.attrs.height || 160;
        const x = node.attrs.x || 0;
        const y = node.attrs.y || 0;
        const style = `width:${w}px;min-height:${h}px;transform:translate(${x}px,${y}px);` + (node.attrs.backgroundColor ? `background:${node.attrs.backgroundColor};` : '') + `border:1px solid ${node.attrs.borderColor || '#cbd5e1'};`;
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'text-box', class: 'rk-textbox', style }), 0];
    },

    addCommands() {
        return {
            insertTextBox: (attrs: any = {}) => ({ commands }: { commands: any }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        width: attrs.width || 320,
                        height: attrs.height || 160,
                        x: 0,
                        y: 0,
                        backgroundColor: attrs.backgroundColor || null,
                        borderColor: attrs.borderColor || '#cbd5e1',
                    },
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Text box' }] }],
                });
            },
        };
    },

    addNodeView() {
        return ({ node, editor, getPos }) => {
            const dom = document.createElement('div');
            dom.className = 'rk-textbox';
            dom.dataset.type = 'text-box';
            dom.contentEditable = 'true';

            const applyTransform = () => {
                const w = node.attrs.width || 320;
                const h = node.attrs.height || 160;
                const x = node.attrs.x || 0;
                const y = node.attrs.y || 0;
                dom.style.width = `${w}px`;
                dom.style.minHeight = `${h}px`;
                dom.style.transform = `translate(${x}px, ${y}px)`;
                if (node.attrs.backgroundColor) dom.style.background = node.attrs.backgroundColor;
                else dom.style.background = '';
                dom.style.border = `1px solid ${node.attrs.borderColor || '#cbd5e1'}`;
            };
            applyTransform();

            // Drag handle (top-left)
            const dragHandle = document.createElement('div');
            dragHandle.className = 'rk-textbox-drag';
            dragHandle.contentEditable = 'false';
            dragHandle.title = 'Drag to move';
            dragHandle.innerHTML = '⠿';
            dom.appendChild(dragHandle);

            // Resize handles (corners + sides)
            const handlePositions: ('nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w')[] =
                ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
            const handles: HTMLElement[] = [];
            for (const pos of handlePositions) {
                const h = document.createElement('div');
                h.className = `rk-textbox-handle rk-textbox-handle-${pos}`;
                h.contentEditable = 'false';
                dom.appendChild(h);
                handles.push(h);

                let startX = 0, startY = 0, startW = 0, startH = 0, startNX = 0, startNY = 0;
                h.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startX = e.clientX;
                    startY = e.clientY;
                    startW = node.attrs.width || dom.offsetWidth;
                    startH = node.attrs.height || dom.offsetHeight;
                    startNX = node.attrs.x || 0;
                    startNY = node.attrs.y || 0;
                    dom.classList.add('is-resizing');
                    const onMove = (m: MouseEvent) => {
                        const dx = m.clientX - startX;
                        const dy = m.clientY - startY;
                        let w = startW, h2 = startH, nx = startNX, ny = startNY;
                        if (pos.includes('e')) w = Math.max(80, startW + dx);
                        if (pos.includes('w')) { w = Math.max(80, startW - dx); nx = startNX + dx; }
                        if (pos.includes('s')) h2 = Math.max(60, startH + dy);
                        if (pos.includes('n')) { h2 = Math.max(60, startH - dy); ny = startNY + dy; }
                        dom.style.width = `${w}px`;
                        dom.style.minHeight = `${h2}px`;
                        dom.style.transform = `translate(${nx}px, ${ny}px)`;
                    };
                    const onUp = () => {
                        dom.classList.remove('is-resizing');
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                        const pos2 = (getPos as any)?.();
                        if (typeof pos2 !== 'number') return;
                        const w = parseInt(dom.style.width, 10) || node.attrs.width;
                        const h2 = parseInt(dom.style.minHeight, 10) || node.attrs.height;
                        const m = dom.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
                        const nx = m ? parseInt(m[1], 10) : node.attrs.x;
                        const ny = m ? parseInt(m[2], 10) : node.attrs.y;
                        const tr = editor.state.tr.setNodeMarkup(pos2, undefined, {
                            ...node.attrs, width: w, height: h2, x: nx, y: ny,
                        });
                        editor.view.dispatch(tr);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
            }

            // Drag handle to move
            let dragging = false;
            let dStartX = 0, dStartY = 0, dStartNX = 0, dStartNY = 0;
            dragHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dragging = true;
                dStartX = e.clientX;
                dStartY = e.clientY;
                dStartNX = node.attrs.x || 0;
                dStartNY = node.attrs.y || 0;
                dom.classList.add('is-dragging');
                const onMove = (m: MouseEvent) => {
                    if (!dragging) return;
                    const nx = dStartNX + (m.clientX - dStartX);
                    const ny = dStartNY + (m.clientY - dStartY);
                    dom.style.transform = `translate(${nx}px, ${ny}px)`;
                };
                const onUp = () => {
                    if (!dragging) return;
                    dragging = false;
                    dom.classList.remove('is-dragging');
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                    const pos2 = (getPos as any)?.();
                    if (typeof pos2 !== 'number') return;
                    const m = dom.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
                    if (!m) return;
                    const nx = parseInt(m[1], 10);
                    const ny = parseInt(m[2], 10);
                    const tr = editor.state.tr.setNodeMarkup(pos2, undefined, { ...node.attrs, x: nx, y: ny });
                    editor.view.dispatch(tr);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });

            // Content goes inside this element.
            const contentDOM = document.createElement('div');
            contentDOM.className = 'rk-textbox-content';
            dom.appendChild(contentDOM);

            return {
                dom,
                contentDOM,
                update(updated) {
                    if (updated.type.name !== 'textBox') return false;
                    Object.assign(node, updated);
                    applyTransform();
                    return true;
                },
                stopEvent(event) {
                    const t = event.target as HTMLElement | null;
                    if (!t) return false;
                    return t.classList.contains('rk-textbox-drag') || t.classList.contains('rk-textbox-handle');
                },
            };
        };
    },
});
