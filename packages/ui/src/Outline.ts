import type { WordEditor } from '@raazkhnl/rk-editor-core';
import { icon } from './icons';

interface Heading { level: number; text: string; pos: number }

/**
 * Document outline pane that lists all headings and lets the user jump to
 * them by clicking. Compact, hierarchical, and scroll-aware.
 */
export class Outline {
    public readonly el: HTMLElement;
    private editor: WordEditor;
    private headings: Heading[] = [];
    private rafId: number | null = null;

    constructor(editor: WordEditor, parent: HTMLElement, position: 'start' | 'end' = 'start') {
        this.editor = editor;
        this.el = document.createElement('aside');
        this.el.className = 'rk-outline';
        this.render();
        if (position === 'start') parent.insertBefore(this.el, parent.firstChild);
        else parent.appendChild(this.el);
        editor.instance.on('update', () => this.scheduleRefresh());
        editor.instance.on('create', () => this.refresh());
    }

    private scheduleRefresh() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            this.refresh();
        });
    }

    private render() {
        this.el.innerHTML = `
            <header class="rk-outline-header">
                <span class="rk-outline-title">${icon('toc')}<span>Outline</span></span>
                <button class="rk-icon-btn rk-outline-close" aria-label="Hide outline" title="Hide outline">${icon('panelLeft')}</button>
            </header>
            <div class="rk-outline-list" role="navigation" aria-label="Document headings"></div>
            <button class="rk-outline-reopen" type="button" aria-label="Show outline" title="Show outline">
                ${icon('panelLeft')}
                <span class="rk-outline-reopen-label">Outline</span>
            </button>
        `;
        this.el.querySelector('.rk-outline-close')?.addEventListener('click', () => this.toggle());
        this.el.querySelector('.rk-outline-reopen')?.addEventListener('click', () => this.toggle());
        this.refresh();
    }

    public refresh() {
        const list = this.el.querySelector('.rk-outline-list') as HTMLElement;
        if (!list) return;

        // Walk the doc to collect headings WITH their positions so we can
        // scroll the actual DOM node into view.
        this.headings = [];
        this.editor.instance.state.doc.descendants((node, pos) => {
            if (node.type.name === 'heading' && node.textContent.trim().length) {
                this.headings.push({ level: node.attrs.level, text: node.textContent, pos });
            }
            return true;
        });

        if (this.headings.length === 0) {
            list.innerHTML = `<p class="rk-outline-empty">No headings yet. Use H1–H6 to populate the outline.</p>`;
            return;
        }

        list.innerHTML = this.headings
            .map((h, i) => `
                <button type="button"
                        class="rk-outline-item rk-outline-l${h.level}"
                        data-idx="${i}"
                        title="${escapeAttr(h.text)}">
                    <span class="rk-outline-marker">H${h.level}</span>
                    <span class="rk-outline-text">${escapeHtml(h.text)}</span>
                </button>
            `).join('');

        list.querySelectorAll<HTMLButtonElement>('.rk-outline-item').forEach((btn) => {
            btn.addEventListener('click', () => {
                const idx = Number(btn.dataset.idx);
                this.jumpTo(idx);
            });
        });
    }

    private jumpTo(idx: number) {
        const heading = this.headings[idx];
        if (!heading) return;
        const view = this.editor.instance.view;

        // 1. Move the editor cursor to the heading.
        this.editor.instance.commands.setTextSelection(heading.pos + 1);

        // 2. Scroll the heading's actual DOM element into view inside the
        //    editor's scroll container. `commands.scrollIntoView()` works when
        //    the editor itself scrolls, but here the surface area is the
        //    scroller — so we scroll the heading's DOM node directly.
        const dom = view.nodeDOM(heading.pos) as HTMLElement | null;
        if (dom && typeof dom.scrollIntoView === 'function') {
            dom.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            this.editor.instance.commands.scrollIntoView();
        }

        this.editor.focus();
    }

    public toggle() { this.el.classList.toggle('rk-outline-collapsed'); }
    public hide() { this.el.classList.add('rk-outline-collapsed'); }
    public show() { this.el.classList.remove('rk-outline-collapsed'); }
    public destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.el.remove();
    }
}

function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function escapeAttr(s: string): string {
    return s.replace(/"/g, '&quot;');
}
