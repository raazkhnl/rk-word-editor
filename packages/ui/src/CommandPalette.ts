/**
 * Quick command palette opened with Ctrl/⌘+/.
 * Fuzzy filters a flat command list and runs the picked entry.
 */

export interface PaletteCommand {
    id: string;
    title: string;
    description?: string;
    shortcut?: string;
    action: () => void;
}

export class CommandPalette {
    private overlay: HTMLDivElement;
    private input!: HTMLInputElement;
    private list!: HTMLUListElement;
    private commands: PaletteCommand[];
    private filtered: PaletteCommand[] = [];
    private active = 0;
    private isOpen = false;
    private keyHandler: (e: KeyboardEvent) => void;

    constructor(commands: PaletteCommand[]) {
        this.commands = commands;
        this.overlay = document.createElement('div');
        this.overlay.className = 'rk-cmd-palette rk-word-editor';
        const themed = document.querySelector('.rk-word-editor[data-rk-theme]') as HTMLElement | null;
        if (themed?.dataset.rkTheme) this.overlay.dataset.rkTheme = themed.dataset.rkTheme;

        this.overlay.innerHTML = `
            <div class="rk-cmd-palette-content" role="dialog" aria-modal="true" aria-label="Command palette">
                <input class="rk-cmd-palette-input" type="text" placeholder="Type a command…" aria-label="Search commands" />
                <ul class="rk-cmd-palette-list" role="listbox"></ul>
            </div>`;

        this.input = this.overlay.querySelector('.rk-cmd-palette-input') as HTMLInputElement;
        this.list = this.overlay.querySelector('.rk-cmd-palette-list') as HTMLUListElement;

        this.input.addEventListener('input', () => this.refresh());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        this.list.addEventListener('click', (e) => {
            const li = (e.target as HTMLElement).closest('[data-cmd-id]') as HTMLLIElement | null;
            if (li) this.run(this.filtered.find(c => c.id === li.dataset.cmdId));
        });

        this.keyHandler = (e: KeyboardEvent) => {
            if (!this.isOpen) return;
            if (e.key === 'Escape') { e.preventDefault(); this.close(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); this.move(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); this.move(-1); }
            else if (e.key === 'Enter') { e.preventDefault(); this.run(this.filtered[this.active]); }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    public setCommands(commands: PaletteCommand[]) {
        this.commands = commands;
    }

    public open() {
        if (this.isOpen) return;
        this.isOpen = true;
        const themed = document.querySelector('.rk-word-editor[data-rk-theme]') as HTMLElement | null;
        if (themed?.dataset.rkTheme) this.overlay.dataset.rkTheme = themed.dataset.rkTheme;
        document.body.appendChild(this.overlay);
        requestAnimationFrame(() => this.overlay.classList.add('is-open'));
        this.input.value = '';
        this.refresh();
        setTimeout(() => this.input.focus(), 30);
    }

    public close() {
        this.isOpen = false;
        this.overlay.classList.remove('is-open');
        setTimeout(() => this.overlay.remove(), 200);
    }

    public toggle() {
        if (this.isOpen) this.close(); else this.open();
    }

    public destroy() {
        document.removeEventListener('keydown', this.keyHandler);
        this.overlay.remove();
    }

    private move(delta: number) {
        if (!this.filtered.length) return;
        this.active = (this.active + delta + this.filtered.length) % this.filtered.length;
        this.render();
        const el = this.list.querySelector('.is-active') as HTMLElement | null;
        el?.scrollIntoView({ block: 'nearest' });
    }

    private run(cmd: PaletteCommand | undefined) {
        if (!cmd) return;
        this.close();
        try { cmd.action(); }
        catch (e) { console.warn('[CommandPalette] command failed', e); }
    }

    private refresh() {
        const q = this.input.value.trim().toLowerCase();
        this.filtered = q
            ? this.commands.filter(c => fuzzyMatch(`${c.title} ${c.description || ''}`.toLowerCase(), q))
            : this.commands;
        this.active = 0;
        this.render();
    }

    private render() {
        if (!this.filtered.length) {
            this.list.innerHTML = `<li class="rk-cmd-palette-empty">No matching commands.</li>`;
            return;
        }
        this.list.innerHTML = this.filtered.map((c, i) => `
            <li class="rk-cmd-palette-item ${i === this.active ? 'is-active' : ''}"
                data-cmd-id="${escAttr(c.id)}" role="option" aria-selected="${i === this.active}">
                <div>
                    <div>${escHtml(c.title)}</div>
                    ${c.description ? `<div style="font-size:11px;color:var(--rk-text-muted)">${escHtml(c.description)}</div>` : ''}
                </div>
                ${c.shortcut ? `<span class="rk-cmd-palette-item-shortcut">${escHtml(c.shortcut)}</span>` : ''}
            </li>
        `).join('');
    }
}

function fuzzyMatch(text: string, query: string): boolean {
    let i = 0;
    for (const ch of query) {
        const idx = text.indexOf(ch, i);
        if (idx === -1) return false;
        i = idx + 1;
    }
    return true;
}

function escAttr(s: string): string { return s.replace(/"/g, '&quot;'); }
function escHtml(s: string): string {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
