import type { WordEditor } from '@raazkhnl/rk-editor-core';
import { icon } from './icons';

export interface StatusBarOptions {
    showWordCount?: boolean;
    showZoom?: boolean;
    showPage?: boolean;
    showReadingTime?: boolean;
    showAutoSave?: boolean;
}

export type AutoSaveState = 'idle' | 'saving' | 'saved' | 'error';

export class StatusBar {
    private el: HTMLDivElement;
    private editor: WordEditor;
    private opts: StatusBarOptions;
    private wcEl!: HTMLSpanElement;
    private pageEl!: HTMLSpanElement;
    private readEl!: HTMLSpanElement;
    private zoomLabel!: HTMLSpanElement;
    private saveEl!: HTMLSpanElement;
    private savedAt: number | null = null;
    private resetTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(editor: WordEditor, parent: HTMLElement, opts: StatusBarOptions = {}) {
        this.editor = editor;
        this.opts = {
            showWordCount: true,
            showZoom: true,
            showPage: true,
            showReadingTime: true,
            showAutoSave: true,
            ...opts,
        };
        this.el = document.createElement('div');
        this.el.className = 'rk-statusbar';
        this.render();
        parent.appendChild(this.el);
        this.update();
        this.editor.instance.on('update', () => this.update());
        this.editor.instance.on('selectionUpdate', () => this.update());
    }

    private render() {
        this.el.innerHTML = `
            <div class="rk-statusbar-left">
                <span class="rk-status-page" title="Estimated pages"></span>
                <span class="rk-status-wc" title="Word count"></span>
                <span class="rk-status-read" title="Reading time"></span>
                ${this.opts.showAutoSave ? `<span class="rk-status-autosave" data-state="idle" aria-live="polite">Ready</span>` : ''}
            </div>
            <div class="rk-statusbar-right">
                <button class="rk-icon-btn rk-zoom-out" aria-label="Zoom out" title="Zoom out (Ctrl+-)">${icon('zoomOut')}</button>
                <span class="rk-zoom-label" aria-live="polite">100%</span>
                <button class="rk-icon-btn rk-zoom-in" aria-label="Zoom in" title="Zoom in (Ctrl++)">${icon('zoomIn')}</button>
            </div>
        `;
        this.pageEl = this.el.querySelector('.rk-status-page')!;
        this.wcEl = this.el.querySelector('.rk-status-wc')!;
        this.readEl = this.el.querySelector('.rk-status-read')!;
        this.zoomLabel = this.el.querySelector('.rk-zoom-label')!;
        this.saveEl = this.el.querySelector('.rk-status-autosave')!;

        this.el.querySelector('.rk-zoom-in')?.addEventListener('click', () => this.bumpZoom(0.1));
        this.el.querySelector('.rk-zoom-out')?.addEventListener('click', () => this.bumpZoom(-0.1));
    }

    private bumpZoom(delta: number) {
        const z = Math.round((this.editor.getZoom() + delta) * 100) / 100;
        this.editor.setZoom(z);
        this.zoomLabel.textContent = `${Math.round(z * 100)}%`;
    }

    public update() {
        const stats = this.editor.getWordCount();
        if (this.opts.showPage) this.pageEl.textContent = `Page ${stats.pages}`;
        if (this.opts.showWordCount) this.wcEl.textContent = `${stats.words} words • ${stats.characters} chars`;
        if (this.opts.showReadingTime) this.readEl.textContent = `${stats.readingTimeMinutes} min read`;
        this.zoomLabel.textContent = `${Math.round(this.editor.getZoom() * 100)}%`;
    }

    /** Reflect auto-save progress in the status bar pill. */
    public setSaveState(state: AutoSaveState, message?: string) {
        if (!this.saveEl) return;
        this.saveEl.classList.remove('is-saving', 'is-saved', 'is-error');
        if (this.resetTimer) { clearTimeout(this.resetTimer); this.resetTimer = null; }
        switch (state) {
            case 'saving':
                this.saveEl.classList.add('is-saving');
                this.saveEl.textContent = message ?? 'Saving…';
                break;
            case 'saved':
                this.saveEl.classList.add('is-saved');
                this.savedAt = Date.now();
                this.saveEl.textContent = message ?? 'Saved';
                this.resetTimer = setTimeout(() => this.refreshSavedLabel(), 30_000);
                break;
            case 'error':
                this.saveEl.classList.add('is-error');
                this.saveEl.textContent = message ?? 'Save failed';
                break;
            default:
                this.saveEl.textContent = message ?? 'Ready';
        }
    }

    private refreshSavedLabel() {
        if (!this.saveEl || !this.savedAt) return;
        const seconds = Math.floor((Date.now() - this.savedAt) / 1000);
        if (seconds < 60) this.saveEl.textContent = `Saved ${seconds}s ago`;
        else if (seconds < 3600) this.saveEl.textContent = `Saved ${Math.floor(seconds / 60)}m ago`;
        else this.saveEl.textContent = 'Saved';
        this.resetTimer = setTimeout(() => this.refreshSavedLabel(), 30_000);
    }

    public destroy() {
        if (this.resetTimer) clearTimeout(this.resetTimer);
        this.el.remove();
    }
}
