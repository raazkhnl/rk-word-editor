import { WordEditor } from '@raazkhnl/rk-editor-core';
import { WordToolbar } from './index';

export class RKEditorElement extends HTMLElement {
    private editor: WordEditor | null = null;
    private toolbar: WordToolbar | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const container = document.createElement('div');
        container.className = 'rk-editor-wc-container';

        // Inject styles (in a real scenario, we'd bundle CSS into the JS or link it)
        const style = document.createElement('style');
        style.textContent = `
      .rk-editor-wc-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
      }
      .rk-toolbar-container {
        background: #f9f9f9;
        border-bottom: 1px solid #ddd;
      }
      .rk-editor-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: white;
      }
    `;

        const toolbarDiv = document.createElement('div');
        toolbarDiv.className = 'rk-toolbar-container';

        const editorDiv = document.createElement('div');
        editorDiv.className = 'rk-editor-content';

        container.appendChild(toolbarDiv);
        container.appendChild(editorDiv);
        this.shadowRoot?.appendChild(style);
        this.shadowRoot?.appendChild(container);

        this.editor = new WordEditor({ element: editorDiv });
        this.toolbar = new WordToolbar(this.editor, toolbarDiv);
    }

    get editorInstance() {
        return this.editor?.instance;
    }
}

if (!customElements.get('rk-word-editor')) {
    customElements.define('rk-word-editor', RKEditorElement);
}
