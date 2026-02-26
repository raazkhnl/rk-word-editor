import { Editor } from '@tiptap/core';

export interface ModalOptions {
    title: string;
    fields: {
        label: string;
        id: string;
        type: 'text' | 'number' | 'select' | 'color';
        value?: any;
        options?: { label: string; value: any }[];
    }[];
    onConfirm: (data: Record<string, any>) => void;
}

/**
 * Modal - A lightweight, standard modal system for the RK Word Editor.
 * Replaces invasive browser prompts with themed overlays.
 */
export class Modal {
    private overlay: HTMLDivElement;

    constructor(options: ModalOptions) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'rk-modal-overlay';

        const content = document.createElement('div');
        content.className = 'rk-modal-content';

        const header = document.createElement('div');
        header.className = 'rk-modal-header';
        header.innerHTML = `<h3>${options.title}</h3><button class="rk-modal-close">&times;</button>`;

        const body = document.createElement('div');
        body.className = 'rk-modal-body';

        const fields: Record<string, HTMLInputElement | HTMLSelectElement> = {};

        options.fields.forEach(field => {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'rk-modal-field';

            const label = document.createElement('label');
            label.innerText = field.label;
            label.setAttribute('for', field.id);

            let input: HTMLInputElement | HTMLSelectElement;
            if (field.type === 'select') {
                input = document.createElement('select');
                field.options?.forEach(opt => {
                    const o = document.createElement('option');
                    o.value = opt.value;
                    o.innerText = opt.label;
                    input.appendChild(o);
                });
            } else {
                input = document.createElement('input');
                input.type = field.type;
            }

            input.id = field.id;
            if (field.value !== undefined) input.value = field.value;

            fieldGroup.appendChild(label);
            fieldGroup.appendChild(input);
            body.appendChild(fieldGroup);
            fields[field.id] = input;
        });

        const footer = document.createElement('div');
        footer.className = 'rk-modal-footer';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'rk-btn-secondary';
        cancelBtn.innerText = 'Cancel';

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'rk-btn-primary';
        confirmBtn.innerText = 'Confirm';

        footer.appendChild(cancelBtn);
        footer.appendChild(confirmBtn);

        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(footer);
        this.overlay.appendChild(content);

        const close = () => {
            this.overlay.classList.remove('active');
            setTimeout(() => this.overlay.remove(), 200);
        };

        header.querySelector('.rk-modal-close')?.addEventListener('click', close);
        cancelBtn.addEventListener('click', close);

        confirmBtn.addEventListener('click', () => {
            const data: Record<string, any> = {};
            Object.keys(fields).forEach(key => {
                data[key] = fields[key].value;
            });
            options.onConfirm(data);
            close();
        });
    }

    public show(): void {
        document.body.appendChild(this.overlay);
        // Force reflow
        this.overlay.offsetHeight;
        this.overlay.classList.add('active');
    }
}
