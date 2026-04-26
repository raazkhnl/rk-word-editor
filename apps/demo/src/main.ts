import { EditorShell } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';

const app = document.getElementById('app')!;

// Empty starting document — the editor's placeholder ("Start typing here…")
// is shown automatically. Pass `initialContent: '<p>Your HTML</p>'` if you
// want to seed the editor with content for end-users.
const shell = new EditorShell({
    container: app,
    initialContent: '',
    placeholder: 'Start typing here…',
    autofocus: 'end',
    outline: true,
    propertyPanel: true,
    theme: 'light',
    brandHtml: `
        <strong style="font-size:14px;color:var(--rk-primary)">RK</strong>
        <span style="font-size:13px;margin-left:6px;">Word Editor</span>`,
    onUpdate: (json) => {
        try { localStorage.setItem('rk-demo-doc', JSON.stringify(json)); } catch { /* quota */ }
    },
});

// Restore previously saved content if present (so refresh keeps your work).
try {
    const saved = localStorage.getItem('rk-demo-doc');
    if (saved) {
        const json = JSON.parse(saved);
        if (json && typeof json === 'object' && Array.isArray(json.content) && json.content.length) {
            shell.editor.setDocument(json);
        }
    }
} catch { /* ignore */ }

// Expose for debugging in the console (try `rkEditor.exportDocx()`).
(window as any).rkEditor = shell.editor;
(window as any).rkToolbar = shell.toolbar;

console.info('[demo] RK Word Editor mounted. Try rkEditor.exportDocx() in the console.');
