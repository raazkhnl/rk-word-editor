import { NodeSelection } from '@tiptap/pm/state';

/**
 * Creates an image NodeView with corner and side drag handles for resizing.
 * Hold Shift while dragging to lock the aspect ratio.
 *
 * Wired up by the `Image` extension in `WordEditor`'s `addNodeView` so any
 * `<img>` node in the document gets these handles when selected.
 */
export function createImageResizeView(node: any, view: any, getPos: any) {
    const wrapper = document.createElement('div');
    wrapper.className = 'rk-image-resize-wrapper';
    wrapper.setAttribute('contenteditable', 'false');
    wrapper.setAttribute('draggable', 'true');

    const img = document.createElement('img');
    img.src = node.attrs.src;
    img.alt = node.attrs.alt || '';
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';

    if (node.attrs.width) img.style.width = node.attrs.width;
    if (node.attrs.height) img.style.height = node.attrs.height;
    if (node.attrs.float) wrapper.style.float = node.attrs.float;

    wrapper.appendChild(img);

    // Click-to-select: makes the resize handles appear without keyboard nav.
    img.addEventListener('mousedown', (e) => {
        // Allow click-and-hold-to-drag (browser default for draggable=true) but
        // also select the node so handles appear.
        const pos = getPos();
        if (typeof pos !== 'number') return;
        try {
            const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
            view.dispatch(tr);
        } catch { /* not a selectable node */ }
        // Don't preventDefault — we want native drag to start when held.
        e.stopPropagation();
    });

    // Build resize handles: corners + sides
    const handlePositions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    handlePositions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `rk-resize-handle rk-resize-handle-${pos}`;
        handle.dataset.handle = pos;
        wrapper.appendChild(handle);

        let startX = 0;
        let startY = 0;
        let startW = 0;
        let startH = 0;
        let aspectRatio = 1;

        handle.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            startX = e.clientX;
            startY = e.clientY;
            startW = img.offsetWidth;
            startH = img.offsetHeight;
            aspectRatio = startH > 0 ? startW / startH : 1;
            wrapper.classList.add('is-resizing');

            const onMouseMove = (e: MouseEvent) => {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const lockAspect = e.shiftKey;

                let newWidth = startW;
                let newHeight = startH;

                if (pos.includes('e')) newWidth = Math.max(60, startW + dx);
                if (pos.includes('w')) newWidth = Math.max(60, startW - dx);
                if (pos.includes('s')) newHeight = Math.max(40, startH + dy);
                if (pos.includes('n')) newHeight = Math.max(40, startH - dy);

                if (lockAspect) {
                    if (pos.includes('e') || pos.includes('w')) {
                        newHeight = Math.round(newWidth / aspectRatio);
                    } else {
                        newWidth = Math.round(newHeight * aspectRatio);
                    }
                }

                img.style.width = `${newWidth}px`;
                img.style.height = `${newHeight}px`;
            };

            const onMouseUp = () => {
                wrapper.classList.remove('is-resizing');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                const pos = getPos();
                if (typeof pos === 'number') {
                    const tr = view.state.tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        width: img.style.width,
                        height: img.style.height,
                    });
                    view.dispatch(tr);
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });

    const select = () => {
        wrapper.classList.add('is-selected');
    };
    const deselect = () => {
        wrapper.classList.remove('is-selected');
    };

    return {
        dom: wrapper,
        update(updatedNode: any) {
            if (updatedNode.type.name !== 'image') return false;
            img.src = updatedNode.attrs.src;
            img.alt = updatedNode.attrs.alt || '';
            if (updatedNode.attrs.width) img.style.width = updatedNode.attrs.width;
            if (updatedNode.attrs.height) img.style.height = updatedNode.attrs.height;
            return true;
        },
        selectNode: select,
        deselectNode: deselect,
        stopEvent: (event: Event) => event.target !== img,
        destroy() { },
    };
}
