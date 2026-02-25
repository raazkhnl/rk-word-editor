import { Editor } from '@tiptap/core';

export class CommandManager {
    private editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    /**
     * Executes a command with focused state.
     */
    public execute(fn: (chain: any) => any) {
        return fn(this.editor.chain().focus()).run();
    }

    // ---- Character Formatting (Phase 1) ----
    public bold = () => this.execute(c => c.toggleBold());
    public italic = () => this.execute(c => c.toggleItalic());
    public underline = () => this.execute(c => c.toggleUnderline());
    public strike = () => this.execute(c => c.toggleStrike());
    public subscript = () => this.execute(c => c.toggleSubscript());
    public superscript = () => this.execute(c => c.toggleSuperscript());
    public code = () => this.execute(c => c.toggleCode());

    public fontFamily = (font: string) => this.execute(c => c.setFontFamily(font));
    public fontSize = (size: string) => this.execute(c => c.setFontSize(size));
    public color = (color: string) => this.execute(c => c.setColor(color));
    public highlight = (color: string) => this.execute(c => c.setHighlight({ color }));
    public transform = (type: string) => this.execute(c => c.setTextTransform(type));
    public toggleSmallCaps = () => (this.editor.chain().focus() as any).toggleSmallCaps().run();
    public letterSpacing = (spacing: string) => (this.editor.chain().focus() as any).setLetterSpacing(spacing).run();
    public wordSpacing = (spacing: string) => (this.editor.chain().focus() as any).setWordSpacing(spacing).run();

    // ---- Block Formatting (Phase 1) ----
    public align = (alignment: any) => this.execute(c => c.setTextAlign(alignment));
    public lineHeight = (height: string) => this.execute(c => c.setLineHeight(height));
    public spacing = (top: string, bottom: string) => this.execute(c => c.setParagraphSpacing({ top, bottom }));
    public paragraphLayout = (attrs: any) => (this.editor.chain().focus() as any).setParagraphLayout(attrs).run();
    public indent = () => this.execute(c => c.indent());
    public outdent = () => this.execute(c => c.outdent());

    public heading = (level: any) => this.execute(c => c.toggleHeading({ level }));
    public paragraph = () => this.execute(c => c.setParagraph());
    public blockquote = () => this.execute(c => c.toggleBlockquote());
    public codeBlock = () => this.execute(c => c.toggleCodeBlock());
    public horizontalRule = () => this.execute(c => c.setHorizontalRule());

    // ---- List Commands (Phase 6) ----
    public bulletList = () => this.execute(c => c.toggleBulletList());
    public orderedList = () => this.execute(c => c.toggleOrderedList());
    public taskList = () => (this.editor.chain().focus() as any).toggleTaskList().run();
    public setListStyle = (style: string) => (this.editor.chain().focus() as any).setListStyle(style).run();
    public setListStartNumber = (n: number) => (this.editor.chain().focus() as any).setListStartNumber(n).run();

    // ---- Table Commands (Phase 5) ----
    public insertTable = (options: any) => this.execute(c => c.insertTable(options));
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
    public setTableCellAttribute = (name: string, value: any) => this.execute(c => c.setTableCellAttribute(name, value));
    public setTableStyle = (style: string) => (this.editor.chain().focus() as any).setTableStyle(style).run();

    // ---- Insert Commands ----
    public insertImage = (src: string) => this.execute(c => c.setImage({ src }));
    public setImageSize = (width: string, height?: string) => (this.editor.chain().focus() as any).setImageSize(width, height).run();
    public setImageFloat = (float: 'left' | 'right' | 'none') => (this.editor.chain().focus() as any).setImageFloat(float).run();
    public insertCaption = (type?: string) => (this.editor.chain().focus() as any).insertCaption(type).run();
    public insertMathInline = (latex: string) => (this.editor.chain().focus() as any).insertMathInline(latex).run();
    public insertMathBlock = (latex: string) => (this.editor.chain().focus() as any).insertMathBlock(latex).run();
    public pageBreak = () => (this.editor.commands as any).setPageBreak();
    public footnote = () => (this.editor.commands as any).setFootnote();
    public sectionBreak = () => (this.editor.commands as any).insertSectionBreak();
    public pageLayout = (options: any) => (this.editor.commands as any).setPageLayout(options);

    // ---- Style Commands (Phase 2) ----
    public applyStyle = (name: string) => (this.editor.chain().focus() as any).applyNamedStyle(name).run();
    public updateStyle = (name: string, attrs: any) => (this.editor.chain().focus() as any).updateNamedStyle(name, attrs).run();

    // ---- References (Phase 8) ----
    public insertTableOfContents = () => (this.editor.chain().focus() as any).insertTableOfContents().run();
    public insertCitation = (key: string, label?: string) => (this.editor.chain().focus() as any).insertCitation(key, label).run();
    public insertBibliography = () => (this.editor.chain().focus() as any).insertBibliography().run();

    // ---- Slash Commands (Phase 10) ----
    public executeSlashCommand = (title: string) => (this.editor.chain().focus() as any).executeSlashCommand(title).run();

    // ---- Utility Commands ----
    public clearFormatting = () => this.execute(c => c.unsetAllMarks().clearNodes());
    public undo = () => this.execute(c => c.undo());
    public redo = () => this.execute(c => c.redo());
    public selectAll = () => this.execute(c => c.selectAll());

    // ---- Export Commands (Phase 4) ----
    public exportDocx = () => (this.editor as any).options.parent.exportDocx();
    public printDoc = () => window.print();
}
