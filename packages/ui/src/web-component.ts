import { EditorShell } from './index';

/**
 * Vanilla custom element: <rk-word-editor></rk-word-editor>
 *
 * Attributes:
 *   - placeholder: initial placeholder text
 *   - theme: "light" | "dark" | "auto"
 *   - readonly: present means start in read-only mode
 *   - outline: present means show document outline
 *   - menubar / toolbar / statusbar: present (default) — set to "false" to hide.
 */
export class RKEditorElement extends HTMLElement {
    private shell: EditorShell | null = null;

    connectedCallback() {
        const host = document.createElement('div');
        host.style.height = '100%';
        host.style.display = 'flex';
        host.style.flexDirection = 'column';
        this.appendChild(host);

        const initial = this.innerHTML.trim();
        if (initial) host.dataset.initialContent = initial;

        const theme = (this.getAttribute('theme') as 'light' | 'dark' | 'auto') || 'light';
        const readonly = this.hasAttribute('readonly');
        const outline = this.hasAttribute('outline');

        const flag = (attr: string, def: boolean) => {
            const v = this.getAttribute(attr);
            if (v === null) return def;
            return v !== 'false';
        };

        this.shell = new EditorShell({
            element: host,
            initialContent: initial || '<p></p>',
            placeholder: this.getAttribute('placeholder') || undefined,
            editable: !readonly,
            menubar: flag('menubar', true),
            toolbar: flag('toolbar', true),
            statusBar: flag('statusbar', true),
            outline,
            theme,
        });
    }

    disconnectedCallback() {
        this.shell?.destroy();
        this.shell = null;
    }

    public get editor() { return this.shell?.editor; }
    public get toolbar() { return this.shell?.toolbar; }
}

if (typeof customElements !== 'undefined' && !customElements.get('rk-word-editor')) {
    customElements.define('rk-word-editor', RKEditorElement);
}
