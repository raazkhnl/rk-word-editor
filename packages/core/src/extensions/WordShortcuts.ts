import { Extension } from '@tiptap/core';

/**
 * Word-style keyboard shortcuts that StarterKit doesn't ship by default.
 *
 * - `Ctrl/⌘+1..6` → Headings 1–6
 * - `Ctrl/⌘+0` (zero) → paragraph (normal)
 * - `Ctrl/⌘+Alt+1..6` → also headings (Word's actual binding)
 * - `Ctrl/⌘+Shift+L` → toggle bullet list
 * - `Ctrl/⌘+Shift+O` → toggle ordered list
 * - `Ctrl/⌘+L / E / R / J` → align left / center / right / justify
 * - `Ctrl/⌘+Enter` → page break
 * - `Ctrl/⌘+Shift+X` → strikethrough
 * - `Ctrl/⌘+.` / `Ctrl/⌘+,` → super- / subscript
 * - `Ctrl/⌘+Shift+H` → highlight (toggle yellow on selection)
 *
 * These mirror Microsoft Word and Google Docs defaults.
 */
export const WordShortcuts = Extension.create({
    name: 'wordShortcuts',

    addKeyboardShortcuts() {
        const heading = (level: number) => () => this.editor.chain().focus().toggleHeading({ level: level as any }).run();
        return {
            // Headings (Word: Ctrl+Alt+N. Google Docs / common: Ctrl+N too — both work)
            'Mod-Alt-1': heading(1),
            'Mod-Alt-2': heading(2),
            'Mod-Alt-3': heading(3),
            'Mod-Alt-4': heading(4),
            'Mod-Alt-5': heading(5),
            'Mod-Alt-6': heading(6),
            'Mod-1': heading(1),
            'Mod-2': heading(2),
            'Mod-3': heading(3),
            'Mod-4': heading(4),
            'Mod-5': heading(5),
            'Mod-6': heading(6),
            'Mod-0': () => this.editor.chain().focus().setParagraph().run(),

            // Lists
            'Mod-Shift-l': () => this.editor.chain().focus().toggleBulletList().run(),
            'Mod-Shift-o': () => this.editor.chain().focus().toggleOrderedList().run(),
            'Mod-Shift-9': () => this.editor.chain().focus().toggleBulletList().run(),
            'Mod-Shift-7': () => this.editor.chain().focus().toggleOrderedList().run(),

            // Alignment
            'Mod-l': () => this.editor.chain().focus().setTextAlign('left').run(),
            'Mod-e': () => this.editor.chain().focus().setTextAlign('center').run(),
            'Mod-r': () => this.editor.chain().focus().setTextAlign('right').run(),
            'Mod-j': () => this.editor.chain().focus().setTextAlign('justify').run(),

            // Marks
            'Mod-Shift-x': () => this.editor.chain().focus().toggleStrike().run(),
            'Mod-,': () => this.editor.chain().focus().toggleSubscript().run(),
            'Mod-.': () => this.editor.chain().focus().toggleSuperscript().run(),
            'Mod-Shift-h': () => this.editor.chain().focus().toggleHighlight({ color: '#FFFF00' }).run(),

            // Page break (Word: Ctrl+Enter inserts page break)
            'Mod-Enter': () => (this.editor.commands as any).setPageBreak(),

            // Insert link via command — UI shell can intercept Ctrl+K to open dialog instead.
            // We don't bind it here so the UI's Ctrl+K dialog isn't pre-empted.
        };
    },
});
