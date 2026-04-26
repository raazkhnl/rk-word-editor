import type { WordEditor } from '@raazkhnl/rk-editor-core';
import { icon } from './icons';

/**
 * Floating, draggable Find &amp; Replace popup.
 *
 * - Opens with `Ctrl/⌘+F` (find) or `Ctrl/⌘+H` (find &amp; replace).
 * - Can be dragged anywhere on screen by its title bar.
 * - Live match counter; Enter / Shift+Enter cycle through matches.
 * - Supports case-sensitive, whole-word and regex modes.
 */
export class FindReplaceBar {
    private el: HTMLDivElement;
    private editor: WordEditor;
    private replaceMode = false;
    private query = '';
    private replacement = '';
    private caseSensitive = false;
    private regex = false;
    private wholeWord = false;
    private statusEl!: HTMLSpanElement;
    private findInput!: HTMLInputElement;
    private replaceInput!: HTMLInputElement;
    private replaceRow!: HTMLDivElement;

    constructor(editor: WordEditor, parent: HTMLElement) {
        this.editor = editor;
        this.el = document.createElement('div');
        this.el.className = 'rk-find-bar';
        this.el.setAttribute('role', 'dialog');
        this.el.setAttribute('aria-label', 'Find and replace');
        this.el.style.display = 'none';
        this.render();
        parent.appendChild(this.el);
    }

    private render() {
        this.el.innerHTML = `
            <div class="rk-find-handle" data-drag-handle>
                <span class="rk-find-title">${icon('search')}<span>Find</span></span>
                <button class="rk-icon-btn rk-find-close" title="Close (Esc)" aria-label="Close find">${icon('close')}</button>
            </div>
            <div class="rk-find-row">
                <button class="rk-icon-btn rk-find-toggle" title="Toggle replace" aria-label="Toggle replace">${icon('chevronRight')}</button>
                <div class="rk-find-input-wrap">
                    <input type="text" class="rk-find-input" placeholder="Find" autocomplete="off" spellcheck="false" />
                </div>
                <button class="rk-icon-btn rk-find-prev" title="Previous match (Shift+Enter)" aria-label="Previous match">${icon('chevronUp')}</button>
                <button class="rk-icon-btn rk-find-next" title="Next match (Enter)" aria-label="Next match">${icon('chevronDown')}</button>
                <span class="rk-find-status" aria-live="polite">0 of 0</span>
            </div>
            <div class="rk-find-row rk-find-options-row">
                <button class="rk-find-opt rk-find-case" title="Match case" aria-pressed="false">Aa</button>
                <button class="rk-find-opt rk-find-word" title="Whole word" aria-pressed="false">[w]</button>
                <button class="rk-find-opt rk-find-regex" title="Regular expression" aria-pressed="false">.*</button>
            </div>
            <div class="rk-find-row rk-find-replace-row" style="display:none">
                <div class="rk-find-input-wrap">
                    <input type="text" class="rk-find-replace-input" placeholder="Replace with…" autocomplete="off" spellcheck="false" />
                </div>
                <button class="rk-btn rk-btn-secondary rk-find-replace-one">Replace</button>
                <button class="rk-btn rk-btn-primary rk-find-replace-all">All</button>
            </div>`;

        this.findInput = this.el.querySelector('.rk-find-input') as HTMLInputElement;
        this.replaceInput = this.el.querySelector('.rk-find-replace-input') as HTMLInputElement;
        this.statusEl = this.el.querySelector('.rk-find-status') as HTMLSpanElement;
        this.replaceRow = this.el.querySelector('.rk-find-replace-row') as HTMLDivElement;

        this.bindInputs();
        this.bindButtons();
        this.bindDragging();
    }

    private bindInputs() {
        this.findInput.addEventListener('input', () => {
            this.query = this.findInput.value;
            this.runFind();
        });
        this.findInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) this.editor.commands.findPrev();
                else this.editor.commands.findNext();
                this.updateStatus();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });
        this.replaceInput.addEventListener('input', () => {
            this.replacement = this.replaceInput.value;
        });
        this.replaceInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
            if (e.key === 'Enter') { e.preventDefault(); this.replaceOne(); }
        });
    }

    private bindButtons() {
        this.el.querySelector('.rk-find-prev')?.addEventListener('click', () => {
            this.editor.commands.findPrev();
            this.updateStatus();
        });
        this.el.querySelector('.rk-find-next')?.addEventListener('click', () => {
            this.editor.commands.findNext();
            this.updateStatus();
        });
        this.el.querySelector('.rk-find-close')?.addEventListener('click', () => this.close());
        this.el.querySelector('.rk-find-toggle')?.addEventListener('click', () => this.toggleReplace());
        this.el.querySelector('.rk-find-replace-one')?.addEventListener('click', () => this.replaceOne());
        this.el.querySelector('.rk-find-replace-all')?.addEventListener('click', () => this.replaceAll());

        const setupOpt = (cls: string, onChange: (v: boolean) => void) => {
            const btn = this.el.querySelector(cls) as HTMLButtonElement;
            btn.addEventListener('click', () => {
                const next = btn.getAttribute('aria-pressed') !== 'true';
                btn.setAttribute('aria-pressed', String(next));
                btn.classList.toggle('is-active', next);
                onChange(next);
                this.runFind();
            });
        };
        setupOpt('.rk-find-case', v => (this.caseSensitive = v));
        setupOpt('.rk-find-word', v => (this.wholeWord = v));
        setupOpt('.rk-find-regex', v => (this.regex = v));
    }

    private bindDragging() {
        const handle = this.el.querySelector('.rk-find-handle') as HTMLElement;
        let dragging = false;
        let startX = 0, startY = 0, startLeft = 0, startTop = 0;

        handle.addEventListener('mousedown', (e) => {
            // Don't start a drag if user clicked the close button.
            if ((e.target as HTMLElement).closest('.rk-find-close')) return;
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = this.el.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            this.el.style.transition = 'none';
            this.el.classList.add('is-dragging');
            e.preventDefault();
        });

        const onMove = (e: MouseEvent) => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const left = Math.max(8, Math.min(window.innerWidth - this.el.offsetWidth - 8, startLeft + dx));
            const top = Math.max(8, Math.min(window.innerHeight - this.el.offsetHeight - 8, startTop + dy));
            this.el.style.left = `${left}px`;
            this.el.style.top = `${top}px`;
            this.el.style.right = 'auto';
            this.el.style.bottom = 'auto';
        };
        const onUp = () => {
            if (!dragging) return;
            dragging = false;
            this.el.classList.remove('is-dragging');
            this.el.style.transition = '';
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    private runFind() {
        if (!this.query) {
            this.editor.clearSearch();
            this.statusEl.textContent = '0 of 0';
            return;
        }
        this.editor.find(this.query, { caseSensitive: this.caseSensitive, regex: this.regex });
        this.updateStatus();
    }

    private updateStatus() {
        const storage: any = (this.editor.instance.storage as any).findReplace;
        if (!storage) return;
        const total = storage.results?.length || 0;
        const idx = total ? (storage.current >= 0 ? storage.current + 1 : 1) : 0;
        this.statusEl.textContent = `${idx} of ${total}`;
    }

    private replaceOne() {
        if (!this.query) return;
        this.editor.replace(this.query, this.replacement, false, {
            caseSensitive: this.caseSensitive, regex: this.regex,
        });
        this.updateStatus();
    }

    private replaceAll() {
        if (!this.query) return;
        const n = this.editor.replace(this.query, this.replacement, true, {
            caseSensitive: this.caseSensitive, regex: this.regex,
        });
        this.statusEl.textContent = `${n} replaced`;
    }

    public toggleReplace(force?: boolean) {
        this.replaceMode = force ?? !this.replaceMode;
        this.replaceRow.style.display = this.replaceMode ? 'flex' : 'none';
        const toggle = this.el.querySelector('.rk-find-toggle') as HTMLElement;
        toggle.innerHTML = this.replaceMode ? icon('chevronDown') : icon('chevronRight');
        const title = this.el.querySelector('.rk-find-title span') as HTMLElement | null;
        if (title) title.textContent = this.replaceMode ? 'Find & replace' : 'Find';
    }

    public open(replace = false) {
        this.toggleReplace(replace);
        this.el.style.display = 'block';
        // Position in the top-right of the editor surface area on first open.
        if (!this.el.style.left) {
            const parentRect = this.el.parentElement?.getBoundingClientRect();
            if (parentRect) {
                this.el.style.right = '24px';
                this.el.style.top = `${parentRect.top + 16}px`;
            }
        }
        // Pre-fill with selected text (if any).
        const sel = this.editor.instance.state.doc.textBetween(
            this.editor.instance.state.selection.from,
            this.editor.instance.state.selection.to,
        );
        if (sel && sel.length < 200) {
            this.findInput.value = sel;
            this.query = sel;
            this.runFind();
        }
        this.findInput.focus();
        this.findInput.select();
    }

    public close() {
        this.el.style.display = 'none';
        this.editor.clearSearch();
        this.editor.focus();
    }

    public destroy() {
        this.el.remove();
    }
}
