import type { WordEditor } from '@raazkhnl/rk-editor-core';
import { icon } from './icons';

export interface StatusBarOptions {
    showWordCount?: boolean;
    showZoom?: boolean;
    showPage?: boolean;
    showReadingTime?: boolean;
}

export class StatusBar {
    private el: HTMLDivElement;
    private editor: WordEditor;
    private opts: StatusBarOptions;
    private wcEl!: HTMLSpanElement;
    private pageEl!: HTMLSpanElement;
    private readEl!: HTMLSpanElement;
    private zoomLabel!: HTMLSpanElement;

    constructor(editor: WordEditor, parent: HTMLElement, opts: StatusBarOptions = {}) {
        this.editor = editor;
        this.opts = { showWordCount: true, showZoom: true, showPage: true, showReadingTime: true, ...opts };
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
            </div>
            <div class="rk-statusbar-right">
                <button class="rk-icon-btn rk-zoom-out" aria-label="Zoom out">${icon('zoomOut')}</button>
                <span class="rk-zoom-label">100%</span>
                <button class="rk-icon-btn rk-zoom-in" aria-label="Zoom in">${icon('zoomIn')}</button>
            </div>
        `;
        this.pageEl = this.el.querySelector('.rk-status-page')!;
        this.wcEl = this.el.querySelector('.rk-status-wc')!;
        this.readEl = this.el.querySelector('.rk-status-read')!;
        this.zoomLabel = this.el.querySelector('.rk-zoom-label')!;

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

    public destroy() { this.el.remove(); }
}
