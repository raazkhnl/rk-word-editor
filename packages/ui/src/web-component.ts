import { EditorShell } from './index';

/**
 * Vanilla custom element: <rk-word-editor></rk-word-editor>
 *
 * Attributes:
 *   - placeholder: initial placeholder text
 *   - theme: "light" | "dark" | "auto"
 *   - readonly: present means start in read-only mode
 *   - outline: present means show document outline
 *   - properties: present means show right-side property panel
 *   - menubar / toolbar / statusbar: present (default) — set to "false" to hide.
 *
 * Events (CustomEvent on the element):
 *   - rk-ready    — { editor, toolbar } once the shell is mounted
 *   - rk-change   — { json, html } debounced doc update
 *   - rk-selection — { editor }
 *
 * Methods:
 *   - .editor / .toolbar — proxies to the inner shell
 *   - .getValue(format?) — returns html | json | text | markdown
 *   - .setValue(content) — replaces the document (HTML or JSON)
 *   - .focus() / .blur()
 */
export class RKEditorElement extends HTMLElement {
    static get observedAttributes(): string[] {
        return ['theme', 'readonly', 'placeholder'];
    }

    private shell: EditorShell | null = null;
    private mountHost: HTMLDivElement | null = null;

    connectedCallback() {
        if (this.shell) return; // guard against double-mount

        const host = document.createElement('div');
        host.style.height = '100%';
        host.style.display = 'flex';
        host.style.flexDirection = 'column';
        this.appendChild(host);
        this.mountHost = host;

        const initial = (this.getAttribute('content') || this.innerHTML || '').trim();

        const theme = (this.getAttribute('theme') as 'light' | 'dark' | 'auto') || 'light';
        const readonly = this.hasAttribute('readonly');
        const outline = this.hasAttribute('outline');
        const properties = this.hasAttribute('properties') || this.hasAttribute('property-panel');

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
            propertyPanel: properties,
            theme,
            onUpdate: (json, editor) => {
                this.dispatchEvent(new CustomEvent('rk-change', {
                    detail: { json, html: editor.getHTML() },
                    bubbles: true,
                    composed: true,
                }));
            },
            onSelectionChange: (editor) => {
                this.dispatchEvent(new CustomEvent('rk-selection', {
                    detail: { editor },
                    bubbles: true,
                    composed: true,
                }));
            },
        });

        // Notify external code that the editor is ready.
        this.dispatchEvent(new CustomEvent('rk-ready', {
            detail: { editor: this.shell.editor, toolbar: this.shell.toolbar },
            bubbles: true,
            composed: true,
        }));
    }

    disconnectedCallback() {
        this.shell?.destroy();
        this.shell = null;
        if (this.mountHost) {
            this.mountHost.remove();
            this.mountHost = null;
        }
    }

    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
        if (!this.shell) return;
        if (name === 'theme') {
            const t = (newValue as 'light' | 'dark' | 'auto') || 'light';
            this.shell.toolbar.applyTheme(t);
        } else if (name === 'readonly') {
            this.shell.editor.setEditable(newValue === null);
        }
    }

    public get editor() { return this.shell?.editor; }
    public get toolbar() { return this.shell?.toolbar; }

    /** Get the document content. */
    public getValue(format: 'html' | 'json' | 'text' = 'html'): string | object {
        const ed = this.shell?.editor;
        if (!ed) return format === 'json' ? {} : '';
        if (format === 'json') return ed.getJSON();
        if (format === 'text') return ed.getText();
        return ed.getHTML();
    }

    /** Replace the document contents. */
    public setValue(content: string | object): void {
        this.shell?.editor.setDocument(content as any);
    }

    public override focus(): void { this.shell?.editor.focus('end'); }
    public override blur(): void { this.shell?.editor.blur(); }
}

if (typeof customElements !== 'undefined' && !customElements.get('rk-word-editor')) {
    customElements.define('rk-word-editor', RKEditorElement);
}
