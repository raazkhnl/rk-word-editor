import type { WordEditor } from '@raazkhnl/rk-editor-core';
import { icon } from './icons';

interface SelectionInfo {
    kind: 'image' | 'table' | 'textBox' | 'toc' | 'paragraph' | 'heading' | null;
    pos: number;
    node: any | null;
}

/**
 * Context-aware property panel docked to the right of the editor.
 *
 * Inspects the current selection on every transaction. When the user has an
 * image, table, text box or TOC selected (or the cursor is inside one) we
 * render a small form with the relevant attributes — width, alignment, levels,
 * row/column controls, etc. — and wire each control to the right command.
 */
export class PropertyPanel {
    public readonly el: HTMLElement;
    private editor: WordEditor;
    private last: SelectionInfo = { kind: null, pos: 0, node: null };
    private collapsed = false;

    constructor(editor: WordEditor, parent: HTMLElement, position: 'end' | 'start' = 'end') {
        this.editor = editor;
        this.el = document.createElement('aside');
        this.el.className = 'rk-properties';
        this.el.innerHTML = this.emptyState();
        if (position === 'end') parent.appendChild(this.el);
        else parent.insertBefore(this.el, parent.firstChild);

        editor.instance.on('selectionUpdate', () => this.update());
        editor.instance.on('transaction', () => this.update());
        editor.instance.on('update', () => this.update());
        this.update();
    }

    private emptyState() {
        return `<header class="rk-properties-header">
                    <span class="rk-properties-title">${icon('settings')}<span>Properties</span></span>
                    <button class="rk-icon-btn rk-properties-close" type="button" aria-label="Hide panel" title="Hide panel">${icon('panelRight')}</button>
                </header>
                <div class="rk-properties-body">
                    <p class="rk-properties-empty">Select an image, table, text box, or table of contents to edit its properties.</p>
                </div>
                <button class="rk-properties-reopen" type="button" aria-label="Show properties" title="Show properties panel">
                    ${icon('panelRight')}
                    <span class="rk-properties-reopen-label">Properties</span>
                </button>`;
    }

    private update() {
        const info = detectSelection(this.editor);
        // Skip a render when nothing meaningful changed.
        if (
            info.kind === this.last.kind
            && info.pos === this.last.pos
            && (info.kind === null || JSON.stringify(info.node?.attrs) === JSON.stringify(this.last.node?.attrs))
        ) {
            return;
        }
        this.last = info;

        if (!info.kind) {
            this.el.innerHTML = this.emptyState();
            this.bindHeader();
            return;
        }

        this.el.innerHTML = `
            <header class="rk-properties-header">
                <span class="rk-properties-title">${icon('settings')}<span>${labelFor(info.kind)}</span></span>
                <button class="rk-icon-btn rk-properties-close" type="button" aria-label="Hide panel" title="Hide panel">${icon('panelRight')}</button>
            </header>
            <div class="rk-properties-body">${this.renderBodyFor(info)}</div>
            <button class="rk-properties-reopen" type="button" aria-label="Show properties" title="Show properties panel">
                ${icon('panelRight')}
                <span class="rk-properties-reopen-label">Properties</span>
            </button>`;
        this.bindHeader();
        this.bindBody(info);
    }

    private bindHeader() {
        this.el.querySelector('.rk-properties-close')?.addEventListener('click', () => this.toggle());
        this.el.querySelector('.rk-properties-reopen')?.addEventListener('click', () => this.toggle());
    }

    public toggle() {
        this.collapsed = !this.collapsed;
        this.el.classList.toggle('rk-properties-collapsed', this.collapsed);
    }

    public destroy() {
        this.el.remove();
    }

    // ---------- Renderers ----------

    private renderBodyFor(info: SelectionInfo): string {
        switch (info.kind) {
            case 'image': return renderImageBody(info.node);
            case 'table': return renderTableBody();
            case 'textBox': return renderTextBoxBody(info.node);
            case 'toc': return renderTocBody(info.node);
            case 'heading': return renderHeadingBody(info.node);
            case 'paragraph': return renderParagraphBody(info.node);
            default: return '';
        }
    }

    private bindBody(info: SelectionInfo) {
        const ed = this.editor;
        const $ = (s: string) => this.el.querySelector(s) as HTMLElement | null;
        const onInput = (sel: string, fn: (v: string) => void) => {
            const el = $(sel) as HTMLInputElement | HTMLSelectElement | null;
            if (!el) return;
            el.addEventListener('change', () => fn(el.value));
            el.addEventListener('input', () => fn(el.value));
        };
        const onClick = (sel: string, fn: () => void) => {
            $(sel)?.addEventListener('click', (e) => { e.preventDefault(); fn(); });
        };

        if (info.kind === 'image') {
            onInput('#prop-img-width', v => ed.format.setImageSize(v));
            onInput('#prop-img-height', v => {
                const w = (this.el.querySelector('#prop-img-width') as HTMLInputElement)?.value || '';
                ed.format.setImageSize(w, v);
            });
            onInput('#prop-img-float', v => ed.format.setImageFloat(v as any));
            onInput('#prop-img-align', v => ed.format.align(v as any));
            onInput('#prop-img-alt', v => updateImageAttr(ed, info, { alt: v }));
            onInput('#prop-img-title', v => updateImageAttr(ed, info, { title: v }));
        }

        if (info.kind === 'table') {
            onClick('#prop-tbl-row-before', () => ed.format.addRowBefore());
            onClick('#prop-tbl-row-after', () => ed.format.addRowAfter());
            onClick('#prop-tbl-row-del', () => ed.format.deleteRow());
            onClick('#prop-tbl-col-before', () => ed.format.addColumnBefore());
            onClick('#prop-tbl-col-after', () => ed.format.addColumnAfter());
            onClick('#prop-tbl-col-del', () => ed.format.deleteColumn());
            onClick('#prop-tbl-merge', () => ed.format.mergeOrSplit());
            onClick('#prop-tbl-toggle-header-row', () => ed.format.toggleHeaderRow());
            onClick('#prop-tbl-toggle-header-col', () => ed.format.toggleHeaderColumn());
            onClick('#prop-tbl-delete', () => ed.format.deleteTable());
            onInput('#prop-tbl-bg', v => (ed.format as any).setCellAttribute('background', v));
        }

        if (info.kind === 'textBox') {
            onInput('#prop-tb-width', v => updateTextBoxAttr(ed, info, { width: parseInt(v, 10) || 320 }));
            onInput('#prop-tb-height', v => updateTextBoxAttr(ed, info, { height: parseInt(v, 10) || 160 }));
            onInput('#prop-tb-bg', v => updateTextBoxAttr(ed, info, { backgroundColor: v }));
            onInput('#prop-tb-border', v => updateTextBoxAttr(ed, info, { borderColor: v }));
        }

        if (info.kind === 'toc') {
            onInput('#prop-toc-min', v => {
                const max = (this.el.querySelector('#prop-toc-max') as HTMLSelectElement)?.value || '3';
                ed.format.setTocLevels(parseInt(v, 10), Math.max(parseInt(v, 10), parseInt(max, 10)));
            });
            onInput('#prop-toc-max', v => {
                const min = (this.el.querySelector('#prop-toc-min') as HTMLSelectElement)?.value || '1';
                ed.format.setTocLevels(Math.min(parseInt(min, 10), parseInt(v, 10)), parseInt(v, 10));
            });
            onClick('#prop-toc-refresh', () => ed.format.refreshTableOfContents());
            const leaderEl = $('#prop-toc-leader') as HTMLInputElement | null;
            leaderEl?.addEventListener('change', () => {
                updateTocAttr(ed, info, { showLeader: leaderEl.checked });
                leaderEl.parentElement?.classList.toggle('is-on', leaderEl.checked);
            });
            const pagesEl = $('#prop-toc-pages') as HTMLInputElement | null;
            pagesEl?.addEventListener('change', () => {
                updateTocAttr(ed, info, { showPageNumbers: pagesEl.checked });
                pagesEl.parentElement?.classList.toggle('is-on', pagesEl.checked);
            });
            onInput('#prop-toc-title', v => updateTocAttr(ed, info, { title: v }));
        }

        if (info.kind === 'heading') {
            this.el.querySelectorAll<HTMLButtonElement>('.rk-heading-chip').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const level = Number(btn.dataset.level);
                    if (level >= 1 && level <= 6) ed.format.heading(level as any);
                });
            });
            this.el.querySelectorAll<HTMLButtonElement>('.rk-align-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const a = btn.dataset.align as any;
                    if (a) ed.format.align(a);
                });
            });
        }

        if (info.kind === 'paragraph') {
            this.el.querySelectorAll<HTMLButtonElement>('.rk-align-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const a = btn.dataset.align as any;
                    if (a) ed.format.align(a);
                });
            });
            this.el.querySelectorAll<HTMLButtonElement>('.rk-pill-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const v = btn.dataset.lh;
                    if (v) ed.format.lineHeight(v);
                });
            });
        }
    }
}

// ---------- Selection detection ----------

function detectSelection(editor: WordEditor): SelectionInfo {
    const state = editor.instance.state;
    const sel: any = state.selection;

    // Node selection (image, table, textBox, toc, etc.)
    if (sel?.node) {
        const node = sel.node;
        const name = node.type.name;
        if (name === 'image') return { kind: 'image', pos: sel.from, node };
        if (name === 'table') return { kind: 'table', pos: sel.from, node };
        if (name === 'textBox') return { kind: 'textBox', pos: sel.from, node };
        if (name === 'tableOfContents') return { kind: 'toc', pos: sel.from, node };
    }

    // Cursor inside a table / textbox / toc?
    const $from = state.selection.$from;
    for (let d = $from.depth; d >= 0; d--) {
        const n = $from.node(d);
        if (n.type.name === 'table') return { kind: 'table', pos: $from.before(d), node: n };
        if (n.type.name === 'textBox') return { kind: 'textBox', pos: $from.before(d), node: n };
        if (n.type.name === 'tableOfContents') return { kind: 'toc', pos: $from.before(d), node: n };
    }

    // Heading or paragraph at the cursor.
    const parent = $from.parent;
    if (parent?.type?.name === 'heading') return { kind: 'heading', pos: $from.before(), node: parent };
    if (parent?.type?.name === 'paragraph') return { kind: 'paragraph', pos: $from.before(), node: parent };

    return { kind: null, pos: 0, node: null };
}

function labelFor(kind: NonNullable<SelectionInfo['kind']>): string {
    return ({
        image: 'Image properties',
        table: 'Table properties',
        textBox: 'Text box properties',
        toc: 'Table of contents',
        heading: 'Heading',
        paragraph: 'Paragraph',
    } as const)[kind];
}

// ---------- Body templates ----------

function renderImageBody(node: any): string {
    const w = node?.attrs?.width || '';
    const h = node?.attrs?.height || '';
    const float = node?.attrs?.float || 'none';
    const alt = node?.attrs?.alt || '';
    const title = node?.attrs?.title || '';
    return `
        <div class="rk-properties-section">
            <h4>Accessibility</h4>
            ${field('Alt text', `<input id="prop-img-alt" type="text" value="${escAttr(alt)}" placeholder="Describe the image" />`)}
            ${field('Title', `<input id="prop-img-title" type="text" value="${escAttr(title)}" placeholder="Optional tooltip" />`)}
            <p class="rk-properties-help">Alt text is read by screen readers and shown if the image fails to load.</p>
        </div>
        <div class="rk-properties-section">
            <h4>Size</h4>
            ${field('Width', `<input id="prop-img-width" type="text" value="${escAttr(w)}" placeholder="e.g. 480 or 60%" />`)}
            ${field('Height', `<input id="prop-img-height" type="text" value="${escAttr(h)}" placeholder="auto" />`)}
        </div>
        <div class="rk-properties-section">
            <h4>Layout</h4>
            ${field('Wrap', selectMarkup('prop-img-float', String(float), [
                { v: 'none', l: 'No wrap' }, { v: 'left', l: 'Wrap left' }, { v: 'right', l: 'Wrap right' },
            ]))}
            ${field('Align', selectMarkup('prop-img-align', '', [
                { v: 'left', l: 'Left' }, { v: 'center', l: 'Center' }, { v: 'right', l: 'Right' },
            ]))}
        </div>
        <p class="rk-properties-hint">Tip: drag the corner handles on the image to resize visually.</p>
    `;
}

function renderTableBody(): string {
    return `
        <div class="rk-properties-section">
            <h4>Rows</h4>
            <div class="rk-properties-row">
                <button id="prop-tbl-row-before" class="rk-btn rk-btn-secondary">Insert above</button>
                <button id="prop-tbl-row-after" class="rk-btn rk-btn-secondary">Insert below</button>
            </div>
            <button id="prop-tbl-row-del" class="rk-btn rk-btn-danger">Delete row</button>
        </div>
        <div class="rk-properties-section">
            <h4>Columns</h4>
            <div class="rk-properties-row">
                <button id="prop-tbl-col-before" class="rk-btn rk-btn-secondary">Insert before</button>
                <button id="prop-tbl-col-after" class="rk-btn rk-btn-secondary">Insert after</button>
            </div>
            <button id="prop-tbl-col-del" class="rk-btn rk-btn-danger">Delete column</button>
        </div>
        <div class="rk-properties-section">
            <h4>Cells</h4>
            <button id="prop-tbl-merge" class="rk-btn rk-btn-secondary">Merge / split</button>
            ${field('Cell color', `<input id="prop-tbl-bg" type="color" value="#ffffff" />`)}
        </div>
        <div class="rk-properties-section">
            <h4>Header</h4>
            <div class="rk-properties-row">
                <button id="prop-tbl-toggle-header-row" class="rk-btn rk-btn-secondary">Toggle row</button>
                <button id="prop-tbl-toggle-header-col" class="rk-btn rk-btn-secondary">Toggle column</button>
            </div>
        </div>
        <button id="prop-tbl-delete" class="rk-btn rk-btn-danger" style="width:100%;margin-top:6px">Delete entire table</button>
        <p class="rk-properties-hint">Tip: drag the right edge of any cell to resize the column.</p>
    `;
}

function renderTextBoxBody(node: any): string {
    const w = node?.attrs?.width || 320;
    const h = node?.attrs?.height || 160;
    const bg = node?.attrs?.backgroundColor || '#ffffff';
    const border = node?.attrs?.borderColor || '#cbd5e1';
    return `
        ${field('Width (px)', `<input id="prop-tb-width" type="number" min="80" value="${escAttr(w)}" />`)}
        ${field('Height (px)', `<input id="prop-tb-height" type="number" min="60" value="${escAttr(h)}" />`)}
        ${field('Background', `<input id="prop-tb-bg" type="color" value="${escAttr(bg)}" />`)}
        ${field('Border', `<input id="prop-tb-border" type="color" value="${escAttr(border)}" />`)}
        <p class="rk-properties-hint">Tip: drag the ⠿ handle (top-left) to move; drag a corner to resize.</p>
    `;
}

function renderTocBody(node: any): string {
    const min = node?.attrs?.minLevel ?? 1;
    const max = node?.attrs?.maxLevel ?? 3;
    const title = node?.attrs?.title || 'Table of contents';
    const showLeader = node?.attrs?.showLeader !== false;
    const showPages = node?.attrs?.showPageNumbers !== false;
    return `
        <button id="prop-toc-refresh" class="rk-btn rk-btn-primary rk-properties-cta" type="button">
            <span aria-hidden="true">↻</span> Refresh table of contents
        </button>

        <div class="rk-properties-section">
            <h4>Heading</h4>
            ${field('Title', `<input id="prop-toc-title" type="text" value="${escAttr(title)}" placeholder="Table of contents" />`)}
        </div>

        <div class="rk-properties-section">
            <h4>Levels included</h4>
            <p class="rk-properties-help">Pick the heading depth shown in the table.</p>
            <div class="rk-toc-level-row">
                <label class="rk-toc-level-pill">
                    <span>From</span>
                    ${selectMarkup('prop-toc-min', String(min), [1,2,3,4,5,6].map(l => ({ v: String(l), l: `H${l}` })))}
                </label>
                <span class="rk-toc-level-arrow" aria-hidden="true">→</span>
                <label class="rk-toc-level-pill">
                    <span>To</span>
                    ${selectMarkup('prop-toc-max', String(max), [1,2,3,4,5,6].map(l => ({ v: String(l), l: `H${l}` })))}
                </label>
            </div>
        </div>

        <div class="rk-properties-section">
            <h4>Display</h4>
            ${toggleField('Dotted leader', 'prop-toc-leader', showLeader)}
            ${toggleField('Page numbers', 'prop-toc-pages', showPages)}
        </div>

        <p class="rk-properties-hint">The TOC does not auto-refresh — press <strong>Refresh</strong> after adding, renaming or removing headings.</p>
    `;
}

function renderHeadingBody(node: any): string {
    const level = node?.attrs?.level || 1;
    const align = node?.attrs?.textAlign || 'left';
    return `
        <div class="rk-properties-section">
            <h4>Style</h4>
            <p class="rk-properties-help">Click a level to apply it to this paragraph.</p>
            <div class="rk-heading-grid" role="radiogroup" aria-label="Heading level">
                ${[1, 2, 3, 4, 5, 6].map(l => `
                    <button class="rk-heading-chip ${l === level ? 'is-active' : ''}"
                            data-level="${l}" type="button" role="radio" aria-checked="${l === level}">
                        <span class="rk-heading-chip-num">H${l}</span>
                        <span class="rk-heading-chip-preview" style="font-size:${headingPreviewSize(l)}px">${escHtml(headingLabel(l))}</span>
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="rk-properties-section">
            <h4>Alignment</h4>
            <div class="rk-align-row" role="radiogroup" aria-label="Alignment">
                ${alignBtn('left', '⇤', align === 'left')}
                ${alignBtn('center', '↔', align === 'center')}
                ${alignBtn('right', '⇥', align === 'right')}
                ${alignBtn('justify', '☰', align === 'justify')}
            </div>
        </div>
    `;
}

function renderParagraphBody(node: any): string {
    const lh = node?.attrs?.lineHeight || '';
    const align = node?.attrs?.textAlign || 'left';
    return `
        <div class="rk-properties-section">
            <h4>Alignment</h4>
            <div class="rk-align-row" role="radiogroup" aria-label="Alignment">
                ${alignBtn('left', '⇤', align === 'left')}
                ${alignBtn('center', '↔', align === 'center')}
                ${alignBtn('right', '⇥', align === 'right')}
                ${alignBtn('justify', '☰', align === 'justify')}
            </div>
        </div>

        <div class="rk-properties-section">
            <h4>Line height</h4>
            <div class="rk-lh-row" role="radiogroup" aria-label="Line height">
                ${lineHeightBtn('1', 'Single', lh === '1')}
                ${lineHeightBtn('1.15', '1.15', lh === '1.15')}
                ${lineHeightBtn('1.5', '1.5', lh === '1.5')}
                ${lineHeightBtn('2', 'Double', lh === '2')}
            </div>
        </div>
    `;
}

function alignBtn(value: string, glyph: string, active: boolean): string {
    return `<button type="button" role="radio" aria-checked="${active}"
        class="rk-icon-btn rk-align-btn${active ? ' is-active' : ''}"
        data-align="${value}" title="${value[0].toUpperCase() + value.slice(1)}">${glyph}</button>`;
}

function lineHeightBtn(value: string, label: string, active: boolean): string {
    return `<button type="button" role="radio" aria-checked="${active}"
        class="rk-pill-btn${active ? ' is-active' : ''}"
        data-lh="${value}">${escHtml(label)}</button>`;
}

function toggleField(label: string, id: string, active: boolean): string {
    return `<label class="rk-properties-toggle">
        <span>${label}</span>
        <span class="rk-switch ${active ? 'is-on' : ''}">
            <input type="checkbox" id="${id}" ${active ? 'checked' : ''} />
            <span class="rk-switch-track"><span class="rk-switch-thumb"></span></span>
        </span>
    </label>`;
}

function headingPreviewSize(level: number): number {
    return [22, 18, 15, 13, 12, 11][level - 1] || 12;
}
function headingLabel(level: number): string {
    return ['Title', 'Section', 'Subsection', 'Heading 4', 'Heading 5', 'Heading 6'][level - 1] || `Heading ${level}`;
}

function field(label: string, control: string): string {
    return `<label class="rk-properties-field"><span>${label}</span>${control}</label>`;
}

function selectMarkup(id: string, current: string, opts: { v: string; l: string }[]): string {
    return `<select id="${id}">
        ${opts.map(o => `<option value="${escAttr(o.v)}"${o.v === current ? ' selected' : ''}>${escHtml(o.l)}</option>`).join('')}
    </select>`;
}

function escAttr(s: any): string { return String(s ?? '').replace(/"/g, '&quot;'); }
function escHtml(s: string): string {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function updateTextBoxAttr(editor: WordEditor, info: SelectionInfo, attrs: Record<string, any>) {
    const view = editor.instance.view;
    const tr = editor.instance.state.tr.setNodeMarkup(info.pos, undefined, { ...info.node.attrs, ...attrs });
    view.dispatch(tr);
}

function updateTocAttr(editor: WordEditor, info: SelectionInfo, attrs: Record<string, any>) {
    const view = editor.instance.view;
    const tr = editor.instance.state.tr.setNodeMarkup(info.pos, undefined, { ...info.node.attrs, ...attrs });
    view.dispatch(tr);
}

function updateImageAttr(editor: WordEditor, info: SelectionInfo, attrs: Record<string, any>) {
    const view = editor.instance.view;
    const tr = editor.instance.state.tr.setNodeMarkup(info.pos, undefined, { ...info.node.attrs, ...attrs });
    view.dispatch(tr);
}
