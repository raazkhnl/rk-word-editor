import type { Editor } from '@tiptap/core';

/**
 * CommandManager — high-level, friendly façade over the underlying Tiptap chain.
 * All formatting commands focus the editor first and then run.
 */
export class CommandManager {
    private editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    public execute(fn: (chain: any) => any) {
        return fn(this.editor.chain().focus()).run();
    }

    private get parent(): any { return (this.editor as any).options.parent; }

    // ---- Character formatting ----
    public bold = () => this.execute(c => c.toggleBold());
    public italic = () => this.execute(c => c.toggleItalic());
    public underline = () => this.execute(c => c.toggleUnderline());
    public strike = () => this.execute(c => c.toggleStrike());
    public subscript = () => this.execute(c => c.toggleSubscript());
    public superscript = () => this.execute(c => c.toggleSuperscript());
    public code = () => this.execute(c => c.toggleCode());

    public fontFamily = (font: string) => this.execute(c => c.setFontFamily(font));
    public fontSize = (size: string) => this.execute(c => c.setFontSize(size));
    public setColor = (color: string) => this.execute(c => c.setColor(color));
    public unsetColor = () => this.execute(c => c.unsetColor());
    public setHighlight = (color: string) => this.execute(c => c.setHighlight({ color }));
    public unsetHighlight = () => this.execute(c => c.unsetHighlight());
    public transform = (type: string) => (this.editor.chain().focus() as any).setTextTransform(type).run();
    public toggleSmallCaps = () => (this.editor.chain().focus() as any).toggleSmallCaps().run();
    public letterSpacing = (spacing: string) => (this.editor.chain().focus() as any).setLetterSpacing(spacing).run();
    public wordSpacing = (spacing: string) => (this.editor.chain().focus() as any).setWordSpacing(spacing).run();

    // ---- Block formatting ----
    public align = (alignment: 'left' | 'center' | 'right' | 'justify') =>
        this.execute(c => c.setTextAlign(alignment));
    public lineHeight = (height: string) => this.execute(c => c.setLineHeight(height));
    public spacing = (top: string, bottom: string) =>
        this.execute(c => c.setParagraphSpacing({ top, bottom }));
    public paragraphLayout = (attrs: any) =>
        (this.editor.chain().focus() as any).setParagraphLayout(attrs).run();
    public indent = () => {
        if (this.editor.isActive('listItem')) {
            return (this.editor.chain().focus() as any).sinkListItem('listItem').run();
        }
        return this.execute(c => c.indent());
    };
    public outdent = () => {
        if (this.editor.isActive('listItem')) {
            return (this.editor.chain().focus() as any).liftListItem('listItem').run();
        }
        return this.execute(c => c.outdent());
    };

    public heading = (level: 1 | 2 | 3 | 4 | 5 | 6) =>
        this.execute(c => c.toggleHeading({ level }));
    public paragraph = () => this.execute(c => c.setParagraph());
    public title = () => (this.editor.chain().focus() as any).setTitle().run();
    public subtitle = () => (this.editor.chain().focus() as any).setSubtitle().run();
    public blockquote = () => this.execute(c => c.toggleBlockquote());
    public codeBlock = () => this.execute(c => c.toggleCodeBlock());
    public horizontalRule = () => this.execute(c => c.setHorizontalRule());

    // ---- Lists ----
    public bulletList = () => this.execute(c => c.toggleBulletList());
    public orderedList = () => this.execute(c => c.toggleOrderedList());
    public taskList = () => (this.editor.chain().focus() as any).toggleTaskList().run();
    public setListStyle = (style: string) =>
        (this.editor.chain().focus() as any).setListStyle(style).run();
    public setListStartNumber = (n: number) =>
        (this.editor.chain().focus() as any).setListStartNumber(n).run();

    // ---- Tables ----
    public insertTable = (options: { rows: number; cols: number; withHeaderRow?: boolean }) =>
        this.execute(c => c.insertTable(options));
    public addColumnBefore = () => this.execute(c => c.addColumnBefore());
    public addColumnAfter = () => this.execute(c => c.addColumnAfter());
    public deleteColumn = () => this.execute(c => c.deleteColumn());
    public addRowBefore = () => this.execute(c => c.addRowBefore());
    public addRowAfter = () => this.execute(c => c.addRowAfter());
    public deleteRow = () => this.execute(c => c.deleteRow());
    public deleteTable = () => this.execute(c => c.deleteTable());
    public mergeCells = () => this.execute(c => c.mergeCells());
    public splitCell = () => this.execute(c => c.splitCell());
    public toggleHeaderColumn = () => this.execute(c => c.toggleHeaderColumn());
    public toggleHeaderRow = () => this.execute(c => c.toggleHeaderRow());
    public toggleHeaderCell = () => this.execute(c => c.toggleHeaderCell());
    public mergeOrSplit = () => this.execute(c => c.mergeOrSplit());
    public setCellAttribute = (name: string, value: any) =>
        this.execute(c => c.setCellAttribute(name, value));
    public setTableStyle = (style: string) =>
        (this.editor.chain().focus() as any).setTableStyle(style).run();

    // ---- Media & inserts ----
    public openImageUpload = () => (this.editor.commands as any).openImageUpload();
    public insertImage = (src: string, alt?: string) =>
        this.execute(c => c.setImage({ src, alt: alt || '' }));
    public setImageSize = (width: string, height?: string) =>
        (this.editor.chain().focus() as any).setImageSize(width, height).run();
    public setImageFloat = (float: 'left' | 'right' | 'none') =>
        (this.editor.chain().focus() as any).setImageFloat(float).run();
    public insertCaption = (type?: string) =>
        (this.editor.chain().focus() as any).insertCaption(type).run();
    public insertTextBox = (attrs?: { width?: number; height?: number; backgroundColor?: string; borderColor?: string }) =>
        (this.editor.chain().focus() as any).insertTextBox(attrs).run();
    public insertMathInline = (latex: string) =>
        (this.editor.chain().focus() as any).insertMathInline(latex).run();
    public insertMathBlock = (latex: string) =>
        (this.editor.chain().focus() as any).insertMathBlock(latex).run();
    public pageBreak = () => (this.editor.commands as any).setPageBreak();
    public footnote = (content?: string) => (this.editor.commands as any).setFootnote(content);
    public sectionBreak = () => (this.editor.commands as any).insertSectionBreak();
    public pageLayout = (options: any) => (this.editor.commands as any).setPageLayout(options);
    public insertPageNumber = () =>
        this.execute(c => c.insertContent({ type: 'pageNumber' }));
    public insertLink = (href: string) =>
        (this.editor.chain().focus() as any).setLink({ href }).run();
    public unsetLink = () => (this.editor.chain().focus() as any).unsetLink().run();

    // ---- Styles & references ----
    public applyStyle = (name: string) =>
        (this.editor.chain().focus() as any).applyNamedStyle(name).run();
    public updateStyle = (name: string, attrs: any) =>
        (this.editor.chain().focus() as any).updateNamedStyle(name, attrs).run();
    public insertTableOfContents = (attrs?: { minLevel?: number; maxLevel?: number; title?: string; showLeader?: boolean; showPageNumbers?: boolean }) =>
        (this.editor.chain().focus() as any).insertTableOfContents(attrs).run();
    public refreshTableOfContents = () =>
        (this.editor.chain().focus() as any).refreshTableOfContents().run();
    public setTocLevels = (minLevel: number, maxLevel: number) =>
        (this.editor.chain().focus() as any).setTocLevels(minLevel, maxLevel).run();
    public insertCitation = (key: string, label?: string) =>
        (this.editor.chain().focus() as any).insertCitation(key, label).run();
    public insertBibliography = () =>
        (this.editor.chain().focus() as any).insertBibliography().run();

    // ---- Misc ----
    public clearFormatting = () =>
        this.execute(c => c.unsetAllMarks().clearNodes());
    public undo = () => this.execute(c => c.undo());
    public redo = () => this.execute(c => c.redo());
    public selectAll = () => this.execute(c => c.selectAll());

    // ---- Format Painter ----
    public startFormatPaint = () =>
        (this.editor.chain().focus() as any).startFormatPaint().run();
    public cancelFormatPaint = () =>
        (this.editor.chain().focus() as any).cancelFormatPaint().run();

    // ---- Find & Replace passthroughs ----
    public find = (query: string, options?: { caseSensitive?: boolean; regex?: boolean }) =>
        (this.editor.commands as any).findText(query, options);
    public findNext = () => (this.editor.commands as any).goToNextMatch();
    public findPrev = () => (this.editor.commands as any).goToPreviousMatch();
    public replace = (q: string, r: string, opts?: any) =>
        (this.editor.commands as any).replaceText(q, r, opts);
    public replaceAll = (q: string, r: string, opts?: any) =>
        (this.editor.commands as any).replaceAllText(q, r, opts);
    public clearSearch = () => (this.editor.commands as any).clearSearch();

    // ---- Slash commands ----
    public executeSlashCommand = (title: string) =>
        (this.editor.chain().focus() as any).executeSlashCommand(title).run();

    // ---- Export shortcuts (delegate to parent WordEditor) ----
    public exportDocx = (filename?: string) => this.parent?.exportDocx?.(filename);
    public exportMarkdown = (filename?: string) => this.parent?.exportMarkdown?.(filename);
    public exportHtml = (filename?: string) => this.parent?.exportHtml?.(filename);
    public exportJson = (filename?: string) => this.parent?.exportJson?.(filename);
    public printDoc = (options?: any) => this.parent?.printPdf?.(options);
}
