import type { WordEditor, PageLayoutOptions } from '@raazkhnl/rk-editor-core';
import { Modal } from './Modal';

export function showLinkDialog(editor: WordEditor): void {
    new Modal({
        title: 'Insert link',
        fields: [
            { id: 'url', label: 'URL', type: 'text', value: 'https://', placeholder: 'https://example.com' },
            { id: 'text', label: 'Display text (optional)', type: 'text', placeholder: 'Optional text' },
        ],
        confirmLabel: 'Insert',
        onConfirm: (data) => {
            const safe = sanitizeUrl(data.url);
            if (!safe) return;
            const chain = (editor.instance.chain().focus() as any);
            if (data.text) {
                chain.insertContent({
                    type: 'text', text: data.text,
                    marks: [{ type: 'link', attrs: { href: safe } }],
                }).run();
            } else {
                chain.setLink({ href: safe }).run();
            }
        },
    }).show();
}

/**
 * Reject `javascript:`, `data:` and `vbscript:` URLs to avoid XSS via the
 * link dialog. Returns the sanitised URL or null.
 */
function sanitizeUrl(input: string | undefined | null): string | null {
    if (!input) return null;
    const trimmed = String(input).trim();
    if (!trimmed) return null;
    const lowered = trimmed.toLowerCase();
    if (lowered.startsWith('javascript:') || lowered.startsWith('vbscript:')) return null;
    if (lowered.startsWith('data:')) return null;
    return trimmed;
}

export function showImageDialog(editor: WordEditor): void {
    new Modal({
        title: 'Insert image',
        fields: [
            { id: 'src', label: 'Image URL', type: 'text', placeholder: 'https://...' },
            { id: 'alt', label: 'Alt text', type: 'text', placeholder: 'Description' },
            { id: 'width', label: 'Width (e.g. 480, 60%)', type: 'text' },
        ],
        confirmLabel: 'Insert',
        onConfirm: (data) => {
            if (!data.src) return;
            const attrs: any = { src: data.src, alt: data.alt || '' };
            if (data.width) attrs.width = data.width;
            (editor.instance.chain().focus() as any).setImage(attrs).run();
        },
    }).show();
}

export function showTableDialog(editor: WordEditor): void {
    new Modal({
        title: 'Insert table',
        fields: [
            { id: 'rows', label: 'Rows', type: 'number', value: 3, min: 1, max: 50 },
            { id: 'cols', label: 'Columns', type: 'number', value: 3, min: 1, max: 20 },
            {
                id: 'header', label: 'Header row', type: 'select', value: 'true',
                options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }],
            },
        ],
        confirmLabel: 'Insert',
        onConfirm: (data) => {
            editor.format.insertTable({
                rows: data.rows || 3,
                cols: data.cols || 3,
                withHeaderRow: String(data.header) === 'true',
            });
        },
    }).show();
}

export function showMathDialog(editor: WordEditor): void {
    new Modal({
        title: 'Insert math (LaTeX)',
        fields: [
            { id: 'latex', label: 'Expression', type: 'text', value: 'E=mc^2', placeholder: 'LaTeX expression' },
            {
                id: 'kind', label: 'Type', type: 'select', value: 'inline',
                options: [{ label: 'Inline', value: 'inline' }, { label: 'Block', value: 'block' }],
            },
        ],
        confirmLabel: 'Insert',
        onConfirm: (data) => {
            if (!data.latex) return;
            if (data.kind === 'block') editor.format.insertMathBlock(data.latex);
            else editor.format.insertMathInline(data.latex);
        },
    }).show();
}

export function showFootnoteDialog(editor: WordEditor): void {
    new Modal({
        title: 'Insert footnote',
        fields: [{ id: 'text', label: 'Footnote text', type: 'textarea' }],
        confirmLabel: 'Insert',
        onConfirm: (data) => editor.format.footnote(data.text || ''),
    }).show();
}

export function showCitationDialog(editor: WordEditor): void {
    new Modal({
        title: 'Insert citation',
        fields: [
            { id: 'key', label: 'Citation key', type: 'text', placeholder: 'smith2024' },
            { id: 'label', label: 'Label (optional)', type: 'text', placeholder: 'Smith, 2024' },
        ],
        confirmLabel: 'Insert',
        onConfirm: (data) => {
            if (!data.key) return;
            editor.format.insertCitation(data.key, data.label || undefined);
        },
    }).show();
}

export function showPageLayoutDialog(editor: WordEditor): void {
    const layout = editor.getPageLayout();
    new Modal({
        title: 'Page layout',
        width: 480,
        fields: [
            {
                id: 'pageSize', label: 'Page size', type: 'select', value: layout.pageSize,
                options: [
                    { label: 'A4 (210 × 297 mm)', value: 'A4' },
                    { label: 'A3 (297 × 420 mm)', value: 'A3' },
                    { label: 'A5 (148 × 210 mm)', value: 'A5' },
                    { label: 'Letter (8.5 × 11 in)', value: 'Letter' },
                    { label: 'Legal (8.5 × 14 in)', value: 'Legal' },
                    { label: 'Tabloid (11 × 17 in)', value: 'Tabloid' },
                ],
            },
            {
                id: 'orientation', label: 'Orientation', type: 'select', value: layout.orientation,
                options: [{ label: 'Portrait', value: 'portrait' }, { label: 'Landscape', value: 'landscape' }],
            },
            { id: 'top', label: 'Top margin', type: 'text', value: layout.margins.top },
            { id: 'bottom', label: 'Bottom margin', type: 'text', value: layout.margins.bottom },
            { id: 'left', label: 'Left margin', type: 'text', value: layout.margins.left },
            { id: 'right', label: 'Right margin', type: 'text', value: layout.margins.right },
        ],
        confirmLabel: 'Apply',
        onConfirm: (data) => {
            const next: Partial<PageLayoutOptions> = {
                pageSize: data.pageSize,
                orientation: data.orientation,
                margins: { top: data.top, bottom: data.bottom, left: data.left, right: data.right },
            };
            editor.setPageLayout(next);
        },
    }).show();
}

export function showTocDialog(editor: WordEditor): void {
    new Modal({
        title: 'Insert table of contents',
        width: 460,
        fields: [
            { id: 'title', label: 'Title', type: 'text', value: 'Table of contents', placeholder: 'Heading shown above the TOC' },
            {
                id: 'minLevel', label: 'From heading', type: 'select', value: '1',
                options: [1, 2, 3, 4, 5, 6].map(l => ({ label: `H${l}`, value: String(l) })),
            },
            {
                id: 'maxLevel', label: 'To heading', type: 'select', value: '3',
                options: [1, 2, 3, 4, 5, 6].map(l => ({ label: `H${l}`, value: String(l) })),
            },
            {
                id: 'showLeader', label: 'Show dotted leader', type: 'select', value: 'true',
                options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }],
            },
            {
                id: 'showPageNumbers', label: 'Show page numbers', type: 'select', value: 'true',
                options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }],
            },
        ],
        confirmLabel: 'Insert',
        onConfirm: (data) => {
            const min = Math.min(parseInt(data.minLevel, 10) || 1, parseInt(data.maxLevel, 10) || 3);
            const max = Math.max(parseInt(data.minLevel, 10) || 1, parseInt(data.maxLevel, 10) || 3);
            editor.format.insertTableOfContents({
                title: data.title || 'Table of contents',
                minLevel: min,
                maxLevel: max,
                showLeader: data.showLeader !== 'false',
                showPageNumbers: data.showPageNumbers !== 'false',
            });
        },
    }).show();
}

export function showShortcutsDialog(): void {
    const rows = [
        ['Bold', 'Ctrl/⌘+B'],
        ['Italic', 'Ctrl/⌘+I'],
        ['Underline', 'Ctrl/⌘+U'],
        ['Strikethrough', 'Ctrl/⌘+Shift+X'],
        ['Heading 1 / 2 / 3', 'Ctrl/⌘+Alt+1 / 2 / 3'],
        ['Bullet list', 'Ctrl/⌘+Shift+8'],
        ['Numbered list', 'Ctrl/⌘+Shift+7'],
        ['Indent / Outdent', 'Tab / Shift+Tab'],
        ['Insert link', 'Ctrl/⌘+K'],
        ['Find', 'Ctrl/⌘+F'],
        ['Find & Replace', 'Ctrl/⌘+H'],
        ['Page break', 'Ctrl/⌘+Enter'],
        ['Undo / Redo', 'Ctrl/⌘+Z / Ctrl/⌘+Shift+Z'],
        ['Print / Export PDF', 'Ctrl/⌘+P'],
        ['Save (autosave)', 'Ctrl/⌘+S'],
        ['Command palette', 'Ctrl/⌘+/'],
    ];
    new Modal({
        title: 'Keyboard shortcuts',
        width: 520,
        bodyHtml: `<table class="rk-shortcut-table"><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td><kbd>${r[1]}</kbd></td></tr>`).join('')}</tbody></table>`,
        confirmLabel: 'Done',
    }).show();
}

export function showAboutDialog(): void {
    new Modal({
        title: 'About RK Word Editor',
        width: 480,
        bodyHtml: `<p>A free, open-source, fully customizable Word-style editor built with Tiptap and ProseMirror.</p>
            <p><strong>Version:</strong> 4.0.0<br/>
            <strong>Author:</strong> RaaZ Khanal (@raazkhnl)<br/>
            <strong>License:</strong> MIT</p>
            <p><a href="https://github.com/raazkhnl/rk-word-editor" target="_blank" rel="noopener">View on GitHub</a></p>`,
        confirmLabel: 'Close',
    }).show();
}
