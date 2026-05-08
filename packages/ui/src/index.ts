import { WordEditor, type WordEditorOptions } from '@raazkhnl/rk-editor-core';
import { Modal } from './Modal';
import { icon, Icons, type IconName } from './icons';
import {
    showLinkDialog, showImageDialog, showTableDialog, showMathDialog, showFootnoteDialog,
    showCitationDialog, showPageLayoutDialog, showShortcutsDialog, showAboutDialog, showTocDialog,
    RK_EDITOR_VERSION,
} from './dialogs';
import { FindReplaceBar } from './FindReplaceBar';
import { StatusBar, type AutoSaveState } from './StatusBar';
import { Outline } from './Outline';
import { PropertyPanel } from './PropertyPanel';
import { CommandPalette } from './CommandPalette';
import { toast } from './toast';
import './styles.css';

export { Modal, icon, Icons, type IconName };
export { FindReplaceBar, StatusBar, Outline, PropertyPanel, CommandPalette, toast };
export type { AutoSaveState };
export { RK_EDITOR_VERSION };
export {
    showLinkDialog, showImageDialog, showTableDialog, showMathDialog, showFootnoteDialog,
    showCitationDialog, showPageLayoutDialog, showShortcutsDialog, showAboutDialog, showTocDialog,
};

const FONT_FAMILIES = [
    { label: 'Default', value: '' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Calibri', value: 'Calibri, sans-serif' },
    { label: 'Cambria', value: 'Cambria, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Open Sans', value: '"Open Sans", sans-serif' },
    { label: 'Lato', value: 'Lato, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Source Sans 3', value: '"Source Sans 3", sans-serif' },
    { label: 'Noto Sans Devanagari', value: '"Noto Sans Devanagari", sans-serif' },
    { label: 'Mangal', value: 'Mangal, sans-serif' },
    { label: 'Kalimati', value: 'Kalimati, sans-serif' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];

const PARAGRAPH_STYLES = [
    { label: 'Title', value: 'title' },
    { label: 'Subtitle', value: 'subtitle' },
    { label: 'Heading 1', value: '1' },
    { label: 'Heading 2', value: '2' },
    { label: 'Heading 3', value: '3' },
    { label: 'Heading 4', value: '4' },
    { label: 'Heading 5', value: '5' },
    { label: 'Heading 6', value: '6' },
    { label: 'Normal text', value: 'p' },
];

interface MenuItem {
    label?: string;
    icon?: IconName;
    action?: string;
    shortcut?: string;
    sep?: boolean;
}

export interface WordToolbarOptions {
    /** Show the menubar (File / Edit / Insert / Format / View / Help). Defaults to `true`. */
    menubar?: boolean;
    /** Show the formatting toolbar. Defaults to `true`. */
    toolbar?: boolean;
    /** Show the status bar (page count, word count, zoom). Defaults to `true`. */
    statusBar?: boolean;
    /** Show the document outline sidebar. Defaults to `false`. */
    outline?: boolean;
    /** Show the right-side property panel. Defaults to `true`. */
    propertyPanel?: boolean;
    /** Initial theme. Defaults to `'light'`. */
    theme?: 'light' | 'dark' | 'auto';
    /** Brand label / logo HTML. */
    brandHtml?: string;
}

export class WordToolbar {
    public editor: WordEditor;
    private container: HTMLElement;
    private opts: WordToolbarOptions;
    private root!: HTMLDivElement;
    private findBar?: FindReplaceBar;
    private _statusBar?: StatusBar;
    private outline?: Outline;
    private propertyPanel?: PropertyPanel;
    private surfaceWrap!: HTMLDivElement;
    private palette?: CommandPalette;

    /** The status bar instance (if one was rendered). */
    public get statusBar(): StatusBar | undefined { return this._statusBar; }

    constructor(editor: WordEditor, container: HTMLElement, opts: WordToolbarOptions = {}) {
        this.editor = editor;
        this.container = container;
        this.opts = {
            menubar: true,
            toolbar: true,
            statusBar: true,
            outline: false,
            propertyPanel: true,
            theme: 'light',
            ...opts,
        };
        this.render();
        this.applyTheme(this.opts.theme!);
    }

    private render() {
        this.container.classList.add('rk-word-editor');
        this.root = document.createElement('div');
        this.root.className = 'rk-editor-shell';
        this.container.appendChild(this.root);

        if (this.opts.menubar) this.root.appendChild(this.buildMenubar());
        if (this.opts.toolbar) this.root.appendChild(this.buildToolbar());

        const main = document.createElement('div');
        main.className = 'rk-editor-main';

        if (this.opts.outline) {
            this.outline = new Outline(this.editor, main);
        }

        const surfaceArea = document.createElement('div');
        surfaceArea.className = 'rk-editor-surface-area';
        this.surfaceWrap = surfaceArea;

        // Move the existing ProseMirror surface here.
        const editorEl = this.editor.instance.options.element as HTMLElement;
        if (editorEl && editorEl.firstChild) {
            surfaceArea.appendChild(editorEl);
        }

        main.appendChild(surfaceArea);

        if (this.opts.propertyPanel) {
            this.propertyPanel = new PropertyPanel(this.editor, main, 'end');
        }

        this.root.appendChild(main);

        this.findBar = new FindReplaceBar(this.editor, surfaceArea);

        if (this.opts.statusBar) this._statusBar = new StatusBar(this.editor, this.root);

        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.id = 'rk-import-input';
        importInput.accept = '.docx,.md,.markdown,.html,.htm,.txt,.json';
        importInput.style.display = 'none';
        this.root.appendChild(importInput);

        importInput.addEventListener('change', async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
                await this.editor.importFromFile(file);
            } catch (err: any) {
                alert(`Import failed: ${err.message || err}`);
            } finally {
                importInput.value = '';
            }
        });

        this.bindGlobalKeys();
        // Single document-level click closes any open menubar dropdown.
        document.addEventListener('click', this.handleDocClick);
        this.editor.instance.on('selectionUpdate', () => this.updateActiveStates());
        this.editor.instance.on('transaction', () => this.updateActiveStates());
        this.updateActiveStates();
    }

    private handleDocClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target || !target.closest('.rk-menu-trigger,.rk-menu-dropdown')) {
            this.closeMenus();
        }
    };

    // ----- Menubar -----
    private buildMenubar(): HTMLElement {
        const nav = document.createElement('nav');
        nav.className = 'rk-menubar';
        nav.setAttribute('role', 'menubar');

        if (this.opts.brandHtml) {
            const brand = document.createElement('div');
            brand.className = 'rk-brand';
            brand.innerHTML = this.opts.brandHtml;
            nav.appendChild(brand);
        }

        const menus: { label: string; items: MenuItem[] }[] = [
            {
                label: 'File',
                items: [
                    { label: 'New document', action: 'newDoc', icon: 'fileNew' },
                    { label: 'Open / Import…', action: 'openImport', icon: 'fileOpen' },
                    { sep: true },
                    { label: 'Save copy as DOCX', action: 'exportDocx', icon: 'docx' },
                    { label: 'Export as Markdown', action: 'exportMd' },
                    { label: 'Export as HTML', action: 'exportHtml' },
                    { label: 'Export as JSON', action: 'exportJson' },
                    { sep: true },
                    { label: 'Print / Save as PDF', action: 'printDoc', icon: 'print', shortcut: 'Ctrl+P' },
                    { sep: true },
                    { label: 'Page layout…', action: 'pageLayout', icon: 'pageSize' },
                ],
            },
            {
                label: 'Edit',
                items: [
                    { label: 'Undo', action: 'undo', icon: 'undo', shortcut: 'Ctrl+Z' },
                    { label: 'Redo', action: 'redo', icon: 'redo', shortcut: 'Ctrl+Y' },
                    { sep: true },
                    { label: 'Cut', action: 'cut', icon: 'cut', shortcut: 'Ctrl+X' },
                    { label: 'Copy', action: 'copy', icon: 'copy', shortcut: 'Ctrl+C' },
                    { label: 'Paste', action: 'paste', icon: 'paste', shortcut: 'Ctrl+V' },
                    { sep: true },
                    { label: 'Find', action: 'find', icon: 'search', shortcut: 'Ctrl+F' },
                    { label: 'Find & Replace', action: 'findReplace', icon: 'replace', shortcut: 'Ctrl+H' },
                    { sep: true },
                    { label: 'Format painter', action: 'formatPainter', icon: 'formatPainter' },
                    { label: 'Clear formatting', action: 'clearFormatting', icon: 'eraser' },
                    { label: 'Track changes', action: 'trackChanges', icon: 'track' },
                ],
            },
            {
                label: 'Insert',
                items: [
                    { label: 'Image', action: 'insertImage', icon: 'image' },
                    { label: 'Image from URL', action: 'insertImageUrl', icon: 'image' },
                    { label: 'Table…', action: 'insertTable', icon: 'table' },
                    { label: 'Text box', action: 'insertTextBox', icon: 'textbox' },
                    { label: 'Link…', action: 'insertLink', icon: 'link', shortcut: 'Ctrl+K' },
                    { sep: true },
                    { label: 'Math (LaTeX)…', action: 'insertMath', icon: 'math' },
                    { label: 'Citation…', action: 'insertCitation', icon: 'citation' },
                    { label: 'Footnote…', action: 'insertFootnote', icon: 'footnote' },
                    { label: 'Bibliography', action: 'insertBibliography', icon: 'citation' },
                    { label: 'Table of contents', action: 'insertToc', icon: 'toc' },
                    { sep: true },
                    { label: 'Page number', action: 'insertPageNumber', icon: 'pageBreak' },
                    { label: 'Page break', action: 'pageBreak', icon: 'pageBreak', shortcut: 'Ctrl+Enter' },
                    { label: 'Horizontal rule', action: 'hr', icon: 'horizontalRule' },
                    { label: 'Blockquote', action: 'blockquote', icon: 'blockquote' },
                    { label: 'Code block', action: 'codeBlock', icon: 'code' },
                ],
            },
            {
                label: 'Format',
                items: [
                    { label: 'Bold', action: 'bold', icon: 'bold', shortcut: 'Ctrl+B' },
                    { label: 'Italic', action: 'italic', icon: 'italic', shortcut: 'Ctrl+I' },
                    { label: 'Underline', action: 'underline', icon: 'underline', shortcut: 'Ctrl+U' },
                    { label: 'Strikethrough', action: 'strike', icon: 'strike' },
                    { sep: true },
                    { label: 'Superscript', action: 'superscript', icon: 'superscript' },
                    { label: 'Subscript', action: 'subscript', icon: 'subscript' },
                    { sep: true },
                    { label: 'Align left', action: 'alignLeft', icon: 'alignLeft' },
                    { label: 'Align center', action: 'alignCenter', icon: 'alignCenter' },
                    { label: 'Align right', action: 'alignRight', icon: 'alignRight' },
                    { label: 'Justify', action: 'alignJustify', icon: 'alignJustify' },
                    { sep: true },
                    { label: 'Bullet list', action: 'bulletList', icon: 'bulletList' },
                    { label: 'Numbered list', action: 'orderedList', icon: 'orderedList' },
                    { label: 'Nepali numbering (१.)', action: 'nepaliList', icon: 'nepaliList' },
                    { label: 'Task list', action: 'taskList', icon: 'taskList' },
                ],
            },
            {
                label: 'View',
                items: [
                    { label: 'Toggle outline', action: 'toggleOutline', icon: 'panelLeft' },
                    { label: 'Toggle properties panel', action: 'toggleProperties', icon: 'panelRight' },
                    { label: 'Read-only mode', action: 'toggleReadOnly', icon: 'eye' },
                    { label: 'Show secondary toolbar', action: 'toggleSecondaryToolbar', icon: 'panelLeft' },
                    { sep: true },
                    { label: 'Light theme', action: 'themeLight', icon: 'sun' },
                    { label: 'Dark theme', action: 'themeDark', icon: 'moon' },
                    { sep: true },
                    { label: 'Command palette', action: 'commandPalette', icon: 'search', shortcut: 'Ctrl+/' },
                    { sep: true },
                    { label: 'Zoom in', action: 'zoomIn', icon: 'zoomIn', shortcut: 'Ctrl++' },
                    { label: 'Zoom out', action: 'zoomOut', icon: 'zoomOut', shortcut: 'Ctrl+-' },
                    { label: 'Reset zoom', action: 'zoomReset', shortcut: 'Ctrl+0' },
                ],
            },
            {
                label: 'Help',
                items: [
                    { label: 'Command palette', action: 'commandPalette', icon: 'search', shortcut: 'Ctrl+/' },
                    { label: 'Keyboard shortcuts', action: 'showShortcuts', icon: 'keyboard' },
                    { label: 'About', action: 'showAbout', icon: 'info' },
                    { label: 'GitHub repository', action: 'openGithub', icon: 'github' },
                ],
            },
        ];

        menus.forEach(menu => nav.appendChild(this.buildMenu(menu.label, menu.items)));

        const spacer = document.createElement('div');
        spacer.className = 'rk-menubar-spacer';
        nav.appendChild(spacer);

        const toolbarRight = document.createElement('div');
        toolbarRight.className = 'rk-menubar-actions';
        toolbarRight.innerHTML = `
            <button class="rk-icon-btn rk-theme-toggle" title="Toggle dark mode" aria-label="Toggle theme">${icon('moon')}</button>
            <button class="rk-icon-btn rk-find-toggle-btn" title="Find (Ctrl+F)" aria-label="Find">${icon('search')}</button>`;
        nav.appendChild(toolbarRight);

        toolbarRight.querySelector('.rk-theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        toolbarRight.querySelector('.rk-find-toggle-btn')?.addEventListener('click', () => this.findBar?.open(false));
        return nav;
    }

    private buildMenu(label: string, items: MenuItem[]): HTMLElement {
        const wrap = document.createElement('div');
        wrap.className = 'rk-menu';
        const trigger = document.createElement('button');
        trigger.className = 'rk-menu-trigger';
        trigger.textContent = label;
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');

        const dropdown = document.createElement('div');
        dropdown.className = 'rk-menu-dropdown';
        dropdown.setAttribute('role', 'menu');
        items.forEach(item => {
            if (item.sep) {
                const s = document.createElement('div');
                s.className = 'rk-menu-sep';
                dropdown.appendChild(s);
                return;
            }
            const btn = document.createElement('button');
            btn.className = 'rk-menu-item';
            btn.dataset.action = item.action;
            btn.innerHTML = `
                <span class="rk-menu-icon">${item.icon ? icon(item.icon) : ''}</span>
                <span class="rk-menu-label">${item.label}</span>
                ${item.shortcut ? `<span class="rk-menu-shortcut">${item.shortcut}</span>` : ''}`;
            btn.addEventListener('click', () => {
                this.handleAction(item.action!);
                this.closeMenus();
            });
            dropdown.appendChild(btn);
        });

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            this.closeMenus();
            trigger.setAttribute('aria-expanded', String(!expanded));
        });

        wrap.appendChild(trigger);
        wrap.appendChild(dropdown);
        return wrap;
    }

    private closeMenus() {
        this.container.querySelectorAll('.rk-menu-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
    }

    // ----- Toolbar -----
    private buildToolbar(): HTMLElement {
        const tb = document.createElement('div');
        tb.className = 'rk-toolbar';
        tb.setAttribute('role', 'toolbar');

        // Row 1
        const row1 = document.createElement('div');
        row1.className = 'rk-toolbar-row';
        row1.appendChild(this.toolbarGroup([
            { id: 'undo', icon: 'undo', title: 'Undo (Ctrl+Z)' },
            { id: 'redo', icon: 'redo', title: 'Redo (Ctrl+Y)' },
        ]));

        const styleGroup = document.createElement('div');
        styleGroup.className = 'rk-toolbar-group';
        styleGroup.innerHTML = `
            <select class="rk-select rk-select-medium" id="rk-style">
                ${PARAGRAPH_STYLES.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
            </select>
            <select class="rk-select rk-select-wide" id="rk-font">
                ${FONT_FAMILIES.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
            </select>
            <select class="rk-select rk-select-narrow" id="rk-size">
                ${FONT_SIZES.map(s => `<option value="${s}pt"${s === 12 ? ' selected' : ''}>${s}</option>`).join('')}
            </select>`;
        row1.appendChild(styleGroup);

        row1.appendChild(this.toolbarGroup([
            { id: 'bold', icon: 'bold', title: 'Bold (Ctrl+B)' },
            { id: 'italic', icon: 'italic', title: 'Italic (Ctrl+I)' },
            { id: 'underline', icon: 'underline', title: 'Underline (Ctrl+U)' },
            { id: 'strike', icon: 'strike', title: 'Strikethrough' },
            { id: 'sup', icon: 'superscript', title: 'Superscript' },
            { id: 'sub', icon: 'subscript', title: 'Subscript' },
        ]));

        const colorGroup = document.createElement('div');
        colorGroup.className = 'rk-toolbar-group';
        colorGroup.innerHTML = `
            <label class="rk-color-pick" title="Text color" data-color="#1a1a1a">
                <span class="rk-color-pick-icon">${icon('fontColor')}<span class="rk-color-pick-bar" style="background:#1a1a1a"></span></span>
                <input type="color" class="rk-color-input" id="rk-text-color" value="#1a1a1a" />
            </label>
            <label class="rk-color-pick" title="Highlight color" data-color="#fff59d">
                <span class="rk-color-pick-icon">${icon('highlight')}<span class="rk-color-pick-bar" style="background:#fff59d"></span></span>
                <input type="color" class="rk-color-input" id="rk-hl-color" value="#fff59d" />
            </label>`;
        row1.appendChild(colorGroup);

        row1.appendChild(this.toolbarGroup([
            { id: 'alignLeft', icon: 'alignLeft', title: 'Align left' },
            { id: 'alignCenter', icon: 'alignCenter', title: 'Align center' },
            { id: 'alignRight', icon: 'alignRight', title: 'Align right' },
            { id: 'alignJustify', icon: 'alignJustify', title: 'Justify' },
        ]));

        row1.appendChild(this.toolbarGroup([
            { id: 'bulletList', icon: 'bulletList', title: 'Bullet list' },
            { id: 'orderedList', icon: 'orderedList', title: 'Numbered list' },
            { id: 'nepaliList', icon: 'nepaliList', title: 'Nepali numbering (१.)' },
            { id: 'taskList', icon: 'taskList', title: 'Task list' },
            { id: 'indent', icon: 'indentRight', title: 'Increase indent' },
            { id: 'outdent', icon: 'indentLeft', title: 'Decrease indent' },
        ]));

        tb.appendChild(row1);

        // Row 2
        const row2 = document.createElement('div');
        row2.className = 'rk-toolbar-row';
        row2.appendChild(this.toolbarGroup([
            { id: 'insertLink', icon: 'link', title: 'Insert link (Ctrl+K)' },
            { id: 'insertImage', icon: 'image', title: 'Insert image' },
            { id: 'insertTable', icon: 'table', title: 'Insert table' },
            { id: 'insertTextBox', icon: 'textbox', title: 'Insert text box' },
            { id: 'insertMath', icon: 'math', title: 'Insert math' },
            { id: 'insertFootnote', icon: 'footnote', title: 'Insert footnote' },
            { id: 'insertCitation', icon: 'citation', title: 'Insert citation' },
            { id: 'insertToc', icon: 'toc', title: 'Insert table of contents' },
        ]));

        row2.appendChild(this.toolbarGroup([
            { id: 'blockquote', icon: 'blockquote', title: 'Blockquote' },
            { id: 'codeBlock', icon: 'code', title: 'Code block' },
            { id: 'hr', icon: 'horizontalRule', title: 'Horizontal rule' },
            { id: 'pageBreak', icon: 'pageBreak', title: 'Page break (Ctrl+Enter)' },
        ]));

        row2.appendChild(this.toolbarGroup([
            { id: 'formatPainter', icon: 'formatPainter', title: 'Format painter' },
            { id: 'clearFormatting', icon: 'eraser', title: 'Clear formatting' },
            { id: 'trackChanges', icon: 'track', title: 'Track changes' },
        ]));

        row2.appendChild(this.toolbarGroup([
            { id: 'find', icon: 'search', title: 'Find (Ctrl+F)' },
            { id: 'findReplace', icon: 'replace', title: 'Find & replace (Ctrl+H)' },
            { id: 'pageLayout', icon: 'pageSize', title: 'Page layout' },
        ]));

        row2.appendChild(this.toolbarGroup([
            { id: 'exportDocx', icon: 'docx', title: 'Export DOCX' },
            { id: 'printDoc', icon: 'print', title: 'Print / Save as PDF' },
        ]));

        tb.appendChild(row2);

        this.bindToolbarEvents(tb);
        return tb;
    }

    private toolbarGroup(items: { id: string; icon: IconName; title: string }[]): HTMLElement {
        const g = document.createElement('div');
        g.className = 'rk-toolbar-group';
        items.forEach(it => {
            const btn = document.createElement('button');
            btn.className = 'rk-icon-btn';
            btn.dataset.action = it.id;
            btn.title = it.title;
            btn.setAttribute('aria-label', it.title);
            btn.innerHTML = icon(it.icon);
            btn.addEventListener('click', () => this.handleAction(it.id));
            g.appendChild(btn);
        });
        return g;
    }

    private bindToolbarEvents(tb: HTMLElement) {
        const $ = (s: string) => tb.querySelector(s) as HTMLElement | null;

        ($('#rk-font') as HTMLSelectElement | null)?.addEventListener('change', (e) => {
            const v = (e.target as HTMLSelectElement).value;
            if (v) this.editor.format.fontFamily(v);
        });
        ($('#rk-size') as HTMLSelectElement | null)?.addEventListener('change', (e) => {
            const v = (e.target as HTMLSelectElement).value;
            if (v) this.editor.format.fontSize(v);
        });
        ($('#rk-style') as HTMLSelectElement | null)?.addEventListener('change', (e) => {
            const v = (e.target as HTMLSelectElement).value;
            if (v === 'p') this.editor.format.paragraph();
            else if (v === 'title') this.editor.format.title();
            else if (v === 'subtitle') this.editor.format.subtitle();
            else this.editor.format.heading(parseInt(v) as any);
        });
        const txtColor = $('#rk-text-color') as HTMLInputElement | null;
        txtColor?.addEventListener('input', (e) => {
            const v = (e.target as HTMLInputElement).value;
            this.editor.format.setColor(v);
            const bar = txtColor.parentElement?.querySelector('.rk-color-pick-bar') as HTMLElement | null;
            if (bar) bar.style.background = v;
        });
        const hlColor = $('#rk-hl-color') as HTMLInputElement | null;
        hlColor?.addEventListener('input', (e) => {
            const v = (e.target as HTMLInputElement).value;
            this.editor.format.setHighlight(v);
            const bar = hlColor.parentElement?.querySelector('.rk-color-pick-bar') as HTMLElement | null;
            if (bar) bar.style.background = v;
        });
    }

    // ----- Action dispatcher -----
    private handleAction(action: string) {
        const ed = this.editor;
        const importInput = () => (this.container.querySelector('#rk-import-input') as HTMLInputElement | null)?.click();
        switch (action) {
            // File
            case 'newDoc':
                if (!ed.isEmpty() && !confirm('Discard current document and start a new one?')) return;
                ed.clear(); ed.focus(); break;
            case 'openImport': importInput(); break;
            case 'exportDocx': ed.exportDocx(); break;
            case 'exportMd': ed.exportMarkdown(); break;
            case 'exportHtml': ed.exportHtml(); break;
            case 'exportJson': ed.exportJson(); break;
            case 'printDoc': ed.printPdf(); break;
            case 'pageLayout': showPageLayoutDialog(ed); break;

            // Edit
            case 'undo': ed.format.undo(); break;
            case 'redo': ed.format.redo(); break;
            case 'cut': document.execCommand('cut'); break;
            case 'copy': document.execCommand('copy'); break;
            case 'paste': document.execCommand('paste'); break;
            case 'find': this.findBar?.open(false); break;
            case 'findReplace': this.findBar?.open(true); break;
            case 'formatPainter': ed.format.startFormatPaint(); break;
            case 'clearFormatting': ed.format.clearFormatting(); break;
            case 'trackChanges': ed.toggleTrackChanges(); this.updateActiveStates(); break;

            // Insert
            case 'insertImage': ed.format.openImageUpload(); break;
            case 'insertImageUrl': showImageDialog(ed); break;
            case 'insertTable': showTableDialog(ed); break;
            case 'insertTextBox': ed.format.insertTextBox(); break;
            case 'insertLink': showLinkDialog(ed); break;
            case 'insertMath': showMathDialog(ed); break;
            case 'insertFootnote': showFootnoteDialog(ed); break;
            case 'insertCitation': showCitationDialog(ed); break;
            case 'insertBibliography': ed.format.insertBibliography(); break;
            case 'insertToc': showTocDialog(ed); break;
            case 'insertPageNumber': ed.format.insertPageNumber(); break;
            case 'refreshToc': ed.format.refreshTableOfContents(); break;
            case 'pageBreak': ed.format.pageBreak(); break;
            case 'hr': ed.format.horizontalRule(); break;
            case 'blockquote': ed.format.blockquote(); break;
            case 'codeBlock': ed.format.codeBlock(); break;

            // Format
            case 'bold': ed.format.bold(); break;
            case 'italic': ed.format.italic(); break;
            case 'underline': ed.format.underline(); break;
            case 'strike': ed.format.strike(); break;
            case 'sup':
            case 'superscript': ed.format.superscript(); break;
            case 'sub':
            case 'subscript': ed.format.subscript(); break;
            case 'alignLeft': ed.format.align('left'); break;
            case 'alignCenter': ed.format.align('center'); break;
            case 'alignRight': ed.format.align('right'); break;
            case 'alignJustify': ed.format.align('justify'); break;
            case 'bulletList': ed.format.bulletList(); break;
            case 'orderedList': ed.format.orderedList(); break;
            case 'nepaliList': ed.format.orderedList(); ed.format.setListStyle('nepali'); break;
            case 'taskList': ed.format.taskList(); break;
            case 'indent': ed.format.indent(); break;
            case 'outdent': ed.format.outdent(); break;

            // View
            case 'toggleOutline':
                if (this.outline) {
                    this.outline.toggle();
                } else {
                    const main = this.root.querySelector('.rk-editor-main') as HTMLElement;
                    this.outline = new Outline(ed, main, 'start');
                }
                break;
            case 'toggleProperties':
                if (this.propertyPanel) {
                    this.propertyPanel.toggle();
                } else {
                    const main = this.root.querySelector('.rk-editor-main') as HTMLElement;
                    this.propertyPanel = new PropertyPanel(ed, main, 'end');
                }
                break;
            case 'toggleReadOnly':
                ed.setEditable(!ed.isEditable());
                this.root.classList.toggle('rk-readonly', !ed.isEditable());
                break;
            case 'toggleSecondaryToolbar': {
                const tb = this.root.querySelector('.rk-toolbar') as HTMLElement | null;
                tb?.classList.toggle('is-show-secondary');
                break;
            }
            case 'commandPalette': this.openCommandPalette(); break;
            case 'themeLight': this.applyTheme('light'); break;
            case 'themeDark': this.applyTheme('dark'); break;
            case 'zoomIn': ed.setZoom(ed.getZoom() + 0.1); this._statusBar?.update(); break;
            case 'zoomOut': ed.setZoom(ed.getZoom() - 0.1); this._statusBar?.update(); break;
            case 'zoomReset': ed.setZoom(1); this._statusBar?.update(); break;

            // Help
            case 'showShortcuts': showShortcutsDialog(); break;
            case 'showAbout': showAboutDialog(); break;
            case 'openGithub': window.open('https://github.com/raazkhnl/rk-word-editor', '_blank', 'noopener'); break;
        }
    }

    private bindGlobalKeys() {
        document.addEventListener('keydown', (e) => {
            const mod = e.ctrlKey || e.metaKey;
            if (!mod) return;
            const k = e.key.toLowerCase();
            if (k === 'f') { e.preventDefault(); this.findBar?.open(false); }
            else if (k === 'h') { e.preventDefault(); this.findBar?.open(true); }
            else if (k === 'p') { e.preventDefault(); this.editor.printPdf(); }
            else if (k === 's') { e.preventDefault(); this.editor.exportDocx(); }
            else if (k === '=' || k === '+') { e.preventDefault(); this.handleAction('zoomIn'); }
            else if (k === '-') { e.preventDefault(); this.handleAction('zoomOut'); }
            else if (k === '0') { e.preventDefault(); this.handleAction('zoomReset'); }
            else if (k === '/') { e.preventDefault(); this.openCommandPalette(); }
        });
    }

    /** Lazily build & open the command palette (Ctrl/⌘+/). */
    private openCommandPalette() {
        if (!this.palette) {
            const run = (action: string) => () => this.handleAction(action);
            this.palette = new CommandPalette([
                { id: 'newDoc', title: 'New document', description: 'Clear the editor and start fresh', action: run('newDoc') },
                { id: 'openImport', title: 'Open / Import file…', description: '.docx, .md, .html, .json, .txt', action: run('openImport') },
                { id: 'exportDocx', title: 'Save as DOCX', shortcut: 'Ctrl+S', action: run('exportDocx') },
                { id: 'exportMd', title: 'Export as Markdown', action: run('exportMd') },
                { id: 'exportHtml', title: 'Export as HTML', action: run('exportHtml') },
                { id: 'exportJson', title: 'Export as JSON', action: run('exportJson') },
                { id: 'printDoc', title: 'Print / Save as PDF', shortcut: 'Ctrl+P', action: run('printDoc') },
                { id: 'pageLayout', title: 'Page layout…', description: 'Page size, orientation, margins', action: run('pageLayout') },
                { id: 'find', title: 'Find', shortcut: 'Ctrl+F', action: run('find') },
                { id: 'findReplace', title: 'Find and replace', shortcut: 'Ctrl+H', action: run('findReplace') },
                { id: 'insertImage', title: 'Insert image (upload)', action: run('insertImage') },
                { id: 'insertImageUrl', title: 'Insert image from URL', action: run('insertImageUrl') },
                { id: 'insertTable', title: 'Insert table', action: run('insertTable') },
                { id: 'insertTextBox', title: 'Insert text box', action: run('insertTextBox') },
                { id: 'insertLink', title: 'Insert link', shortcut: 'Ctrl+K', action: run('insertLink') },
                { id: 'insertMath', title: 'Insert math (LaTeX)', action: run('insertMath') },
                { id: 'insertCitation', title: 'Insert citation', action: run('insertCitation') },
                { id: 'insertFootnote', title: 'Insert footnote', action: run('insertFootnote') },
                { id: 'insertToc', title: 'Insert table of contents', action: run('insertToc') },
                { id: 'insertPageNumber', title: 'Insert page number', action: run('insertPageNumber') },
                { id: 'pageBreak', title: 'Insert page break', shortcut: 'Ctrl+Enter', action: run('pageBreak') },
                { id: 'trackChanges', title: 'Toggle track changes', action: run('trackChanges') },
                { id: 'formatPainter', title: 'Format painter', action: run('formatPainter') },
                { id: 'clearFormatting', title: 'Clear formatting', action: run('clearFormatting') },
                { id: 'toggleOutline', title: 'Toggle outline panel', action: run('toggleOutline') },
                { id: 'toggleProperties', title: 'Toggle properties panel', action: run('toggleProperties') },
                { id: 'toggleReadOnly', title: 'Toggle read-only mode', action: run('toggleReadOnly') },
                { id: 'themeDark', title: 'Switch to dark theme', action: run('themeDark') },
                { id: 'themeLight', title: 'Switch to light theme', action: run('themeLight') },
                { id: 'showShortcuts', title: 'Keyboard shortcuts', action: run('showShortcuts') },
                { id: 'showAbout', title: 'About RK Word Editor', action: run('showAbout') },
            ]);
        }
        this.palette.open();
    }

    // ----- Theme -----
    public applyTheme(theme: 'light' | 'dark' | 'auto') {
        this.opts.theme = theme;
        let resolved: 'light' | 'dark' = theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;
        this.container.dataset.rkTheme = resolved;
        const btn = this.root.querySelector('.rk-theme-toggle') as HTMLElement | null;
        if (btn) btn.innerHTML = resolved === 'dark' ? icon('sun') : icon('moon');
    }

    public toggleTheme() {
        const next = this.container.dataset.rkTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(next as 'light' | 'dark');
    }

    // ----- Active states -----
    private updateActiveStates() {
        const ed = this.editor.instance;
        const root = this.root;
        const $btn = (id: string) => root.querySelector(`.rk-icon-btn[data-action="${id}"]`);
        const setActive = (id: string, active: boolean) => $btn(id)?.classList.toggle('is-active', active);

        setActive('bold', ed.isActive('bold'));
        setActive('italic', ed.isActive('italic'));
        setActive('underline', ed.isActive('underline'));
        setActive('strike', ed.isActive('strike'));
        setActive('sup', ed.isActive('superscript'));
        setActive('sub', ed.isActive('subscript'));
        setActive('bulletList', ed.isActive('bulletList'));
        setActive('orderedList', ed.isActive('orderedList'));
        setActive('taskList', ed.isActive('taskList'));
        setActive('blockquote', ed.isActive('blockquote'));
        setActive('codeBlock', ed.isActive('codeBlock'));
        setActive('alignLeft', ed.isActive({ textAlign: 'left' }));
        setActive('alignCenter', ed.isActive({ textAlign: 'center' }));
        setActive('alignRight', ed.isActive({ textAlign: 'right' }));
        setActive('alignJustify', ed.isActive({ textAlign: 'justify' }));
        setActive('trackChanges', this.editor.isTrackingChanges?.() || false);

        const styleSel = root.querySelector('#rk-style') as HTMLSelectElement | null;
        if (styleSel) {
            if (ed.isActive('title')) { styleSel.value = 'title'; return; }
            if (ed.isActive('subtitle')) { styleSel.value = 'subtitle'; return; }
            for (let l = 1; l <= 6; l++) {
                if (ed.isActive('heading', { level: l })) { styleSel.value = String(l); return; }
            }
            styleSel.value = 'p';
        }
    }

    /** Reflect auto-save progress in the status bar pill. */
    public setSaveState(state: AutoSaveState, message?: string) {
        this._statusBar?.setSaveState(state, message);
    }

    public destroy() {
        document.removeEventListener('click', this.handleDocClick);
        this.findBar?.destroy();
        this._statusBar?.destroy();
        this.outline?.destroy();
        this.propertyPanel?.destroy();
        this.palette?.destroy();
        this.root.remove();
    }
}

// ---- Convenience: bundled editor + shell ----

export interface EditorShellOptions extends Omit<WordEditorOptions, 'element'>, WordToolbarOptions {
    /** Where to mount the editor. Either `container` or `element` is accepted. */
    container?: HTMLElement;
    /** Same as `container` — kept for compatibility with the bare `WordEditor` API. */
    element?: HTMLElement;
}

/**
 * One-shot constructor that mounts a fully-featured editor (engine + UI shell)
 * into a container. Returns both the engine and toolbar so consumers can wire
 * up their own buttons, listeners, or commands.
 */
export class EditorShell {
    public editor: WordEditor;
    public toolbar: WordToolbar;
    public container: HTMLElement;

    constructor(opts: EditorShellOptions) {
        const target = opts.container || opts.element;
        if (!target) throw new Error('EditorShell requires `container` or `element`.');
        this.container = target;

        // We need a child element for the editor surface so we don't fight with the toolbar layout.
        target.classList.add('rk-word-editor');
        const surface = document.createElement('div');
        surface.className = 'rk-editor-surface';
        target.appendChild(surface);

        this.editor = new WordEditor({
            ...opts,
            element: surface,
        });
        this.toolbar = new WordToolbar(this.editor, target, opts);
    }

    /** Reflect auto-save progress in the status bar pill. */
    public setSaveState(state: AutoSaveState, message?: string) {
        this.toolbar.setSaveState(state, message);
    }

    public destroy(): void {
        this.toolbar.destroy();
        this.editor.destroy();
    }
}

// ---- Web component ----
export * from './web-component';
