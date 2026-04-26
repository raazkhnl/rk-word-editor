export type ModalFieldType = 'text' | 'number' | 'select' | 'color' | 'textarea' | 'checkbox';

export interface ModalField {
    id: string;
    label: string;
    type: ModalFieldType;
    value?: any;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    options?: { label: string; value: any }[];
}

export interface ModalAction {
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick?: (data: Record<string, any>, modal: Modal) => void | Promise<void>;
    closeOnClick?: boolean;
}

export interface ModalOptions {
    title: string;
    description?: string;
    fields?: ModalField[];
    confirmLabel?: string;
    cancelLabel?: string;
    actions?: ModalAction[];
    width?: number;
    onConfirm?: (data: Record<string, any>) => void;
    onClose?: () => void;
    bodyHtml?: string;
}

/** Lightweight, themed modal that supports forms, custom actions, and ESC/click-out close. */
export class Modal {
    private overlay: HTMLDivElement;
    private fields: Record<string, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = {};
    private opts: ModalOptions;
    private bodyContainer: HTMLDivElement;

    constructor(opts: ModalOptions) {
        this.opts = opts;
        this.overlay = document.createElement('div');
        // Carry the editor scope so CSS variables (--rk-surface, --rk-text, etc.) resolve.
        // Inherit the active theme from the first editor on the page if present.
        const themed = document.querySelector('.rk-word-editor[data-rk-theme]') as HTMLElement | null;
        this.overlay.className = 'rk-word-editor rk-modal-overlay';
        if (themed?.dataset.rkTheme) this.overlay.dataset.rkTheme = themed.dataset.rkTheme;

        const content = document.createElement('div');
        content.className = 'rk-modal-content';
        if (opts.width) content.style.maxWidth = `${opts.width}px`;

        const header = document.createElement('div');
        header.className = 'rk-modal-header';
        header.innerHTML = `<h3>${escapeHtml(opts.title)}</h3>
            <button class="rk-modal-close" aria-label="Close">×</button>`;

        const body = document.createElement('div');
        body.className = 'rk-modal-body';
        this.bodyContainer = body;

        if (opts.description) {
            const desc = document.createElement('div');
            desc.className = 'rk-modal-description';
            desc.innerHTML = opts.description.replace(/\n/g, '<br/>');
            body.appendChild(desc);
        }
        if (opts.bodyHtml) {
            const wrap = document.createElement('div');
            wrap.innerHTML = opts.bodyHtml;
            body.appendChild(wrap);
        }

        if (opts.fields) {
            opts.fields.forEach(field => body.appendChild(this.buildField(field)));
        }

        const footer = document.createElement('div');
        footer.className = 'rk-modal-footer';

        if (opts.actions && opts.actions.length) {
            opts.actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = `rk-btn rk-btn-${action.variant || 'secondary'}`;
                btn.textContent = action.label;
                btn.addEventListener('click', async () => {
                    await action.onClick?.(this.collect(), this);
                    if (action.closeOnClick !== false) this.close();
                });
                footer.appendChild(btn);
            });
        } else {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'rk-btn rk-btn-secondary';
            cancelBtn.textContent = opts.cancelLabel || 'Cancel';
            cancelBtn.addEventListener('click', () => this.close());

            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'rk-btn rk-btn-primary';
            confirmBtn.textContent = opts.confirmLabel || (opts.fields?.length ? 'Confirm' : 'Close');
            confirmBtn.addEventListener('click', () => {
                opts.onConfirm?.(this.collect());
                this.close();
            });
            if (opts.fields?.length) footer.appendChild(cancelBtn);
            footer.appendChild(confirmBtn);
        }

        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(footer);
        this.overlay.appendChild(content);

        header.querySelector('.rk-modal-close')?.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', e => {
            if (e.target === this.overlay) this.close();
        });
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', onKey);
        this.overlay.addEventListener('rk-modal-closed', () => document.removeEventListener('keydown', onKey));
    }

    private buildField(field: ModalField): HTMLDivElement {
        const group = document.createElement('div');
        group.className = 'rk-modal-field';

        const label = document.createElement('label');
        label.htmlFor = field.id;
        label.textContent = field.label;
        group.appendChild(label);

        let input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (field.type === 'select') {
            const sel = document.createElement('select');
            (field.options || []).forEach(opt => {
                const o = document.createElement('option');
                o.value = String(opt.value);
                o.textContent = opt.label;
                sel.appendChild(o);
            });
            input = sel;
        } else if (field.type === 'textarea') {
            input = document.createElement('textarea');
            (input as HTMLTextAreaElement).rows = 4;
        } else {
            const i = document.createElement('input');
            i.type = field.type;
            if (field.min !== undefined) i.min = String(field.min);
            if (field.max !== undefined) i.max = String(field.max);
            if (field.step !== undefined) i.step = String(field.step);
            input = i;
        }
        input.id = field.id;
        if (field.placeholder) (input as any).placeholder = field.placeholder;
        if (field.value !== undefined) {
            if (field.type === 'checkbox') (input as HTMLInputElement).checked = !!field.value;
            else (input as any).value = field.value;
        }
        group.appendChild(input);
        this.fields[field.id] = input;
        return group;
    }

    public collect(): Record<string, any> {
        const data: Record<string, any> = {};
        Object.keys(this.fields).forEach(k => {
            const el = this.fields[k];
            if ((el as HTMLInputElement).type === 'checkbox') data[k] = (el as HTMLInputElement).checked;
            else if ((el as HTMLInputElement).type === 'number') data[k] = parseFloat((el as HTMLInputElement).value);
            else data[k] = (el as any).value;
        });
        return data;
    }

    public show(): this {
        document.body.appendChild(this.overlay);
        // Force reflow
        void this.overlay.offsetHeight;
        this.overlay.classList.add('active');
        // Focus first field
        const first = this.overlay.querySelector('input, select, textarea, button.rk-btn-primary') as HTMLElement | null;
        first?.focus();
        return this;
    }

    public close(): void {
        this.overlay.classList.remove('active');
        this.opts.onClose?.();
        this.overlay.dispatchEvent(new CustomEvent('rk-modal-closed'));
        setTimeout(() => this.overlay.remove(), 180);
    }

    public get body(): HTMLDivElement { return this.bodyContainer; }
}

function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
