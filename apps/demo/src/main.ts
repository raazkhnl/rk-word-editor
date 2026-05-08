import { EditorShell, toast } from '@raazkhnl/rk-editor-ui';
import '@raazkhnl/rk-editor-ui/styles.css';
import { SAMPLE_DOC_HTML } from './sample';

const app = document.getElementById('app')!;

const STORAGE_KEY = 'rk-demo-doc-v2';

const shell = new EditorShell({
    container: app,
    initialContent: '',
    placeholder: 'Start typing here…',
    autofocus: 'end',
    outline: true,
    propertyPanel: true,
    theme: localStorage.getItem('rk-demo-theme') === 'dark' ? 'dark' : 'light',
    brandHtml: `
        <strong style="font-size:14px;color:var(--rk-primary)">RK</strong>
        <span style="font-size:13px;margin-left:6px;">Word Editor</span>
        <span style="font-size:11px;margin-left:8px;color:var(--rk-text-muted)">demo</span>`,
    onUpdate: (json) => {
        scheduleSave(json);
    },
});

// Restore previously saved content; if there is none, seed with a sample doc
// so first-time visitors see what the editor can do.
let restored = false;
try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const json = JSON.parse(saved);
        if (json && typeof json === 'object' && Array.isArray(json.content) && json.content.length) {
            shell.editor.setDocument(json);
            restored = true;
        }
    }
} catch { /* ignore */ }

if (!restored) {
    shell.editor.setDocument(SAMPLE_DOC_HTML);
}

// ---- Auto-save with status indicator ----------------------------------
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(json: any) {
    if (saveTimer) clearTimeout(saveTimer);
    shell.setSaveState('saving');
    saveTimer = setTimeout(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
            shell.setSaveState('saved');
        } catch (err) {
            shell.setSaveState('error', 'Storage full');
            toast('Could not auto-save: browser storage is full.', { variant: 'warn' });
        }
    }, 600);
}

// Persist theme between visits.
const themeObserver = new MutationObserver(() => {
    const t = app.dataset.rkTheme;
    if (t) localStorage.setItem('rk-demo-theme', t);
});
themeObserver.observe(app, { attributes: true, attributeFilter: ['data-rk-theme'] });

// ---- Reset / clear button ---------------------------------------------
const resetBar = document.createElement('div');
resetBar.className = 'rk-demo-resetbar';
resetBar.innerHTML = `<button class="rk-demo-reset" type="button" title="Reset to the sample document">Reset demo</button>`;
document.body.appendChild(resetBar);
resetBar.querySelector('button')!.addEventListener('click', () => {
    if (!confirm('Discard the current document and reload the sample?')) return;
    localStorage.removeItem(STORAGE_KEY);
    shell.editor.setDocument(SAMPLE_DOC_HTML);
    toast('Sample document restored.', { variant: 'success' });
});

// ---- Service worker (PWA, only in production) -------------------------
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        const swUrl = `${import.meta.env.BASE_URL}sw.js`;
        navigator.serviceWorker.register(swUrl).catch(() => { /* ignore */ });
    });
}

// Expose for console debugging.
(window as any).rkEditor = shell.editor;
(window as any).rkToolbar = shell.toolbar;
(window as any).rkShell = shell;

console.info('[demo] RK Word Editor mounted. Try rkEditor.exportDocx() in the console.');
