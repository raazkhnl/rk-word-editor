import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface SlashCommand {
    title: string;
    description: string;
    icon: string;
    command: (editor: any) => void;
}

const DEFAULT_COMMANDS: SlashCommand[] = [
    {
        title: 'Heading 1',
        description: 'Large section heading',
        icon: 'H1',
        command: (editor: any) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: 'H2',
        command: (editor: any) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: 'H3',
        command: (editor: any) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
        title: 'Bullet List',
        description: 'Create a simple bullet list',
        icon: '•',
        command: (editor: any) => editor.chain().focus().toggleBulletList().run(),
    },
    {
        title: 'Numbered List',
        description: 'Create a numbered list',
        icon: '1.',
        command: (editor: any) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
        title: 'Table',
        description: 'Insert a table (3x3)',
        icon: '⊞',
        command: (editor: any) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
        title: 'Code Block',
        description: 'Insert a code block',
        icon: '</>',
        command: (editor: any) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
        title: 'Blockquote',
        description: 'Insert a quote block',
        icon: '"',
        command: (editor: any) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
        title: 'Horizontal Rule',
        description: 'Insert a divider line',
        icon: '—',
        command: (editor: any) => editor.chain().focus().setHorizontalRule().run(),
    },
];

export const SlashCommands = Extension.create({
    name: 'slashCommands',

    addOptions() {
        return {
            commands: DEFAULT_COMMANDS,
            onShow: null as ((items: SlashCommand[], query: string) => void) | null,
            onHide: null as (() => void) | null,
        };
    },

    addStorage() {
        return {
            isOpen: false,
            query: '',
            items: [] as SlashCommand[],
        };
    },

    addProseMirrorPlugins() {
        const extension = this;

        return [
            new Plugin({
                key: new PluginKey('slashCommands'),
                props: {
                    handleKeyDown(_view: any, event: KeyboardEvent) {
                        if (event.key === 'Escape' && extension.storage.isOpen) {
                            extension.storage.isOpen = false;
                            extension.options.onHide?.();
                            return true;
                        }
                        return false;
                    },
                },
                view() {
                    return {
                        update(view: any, _prevState: any) {
                            const { state } = view;
                            const { selection } = state;
                            const { $from } = selection;

                            const textBefore = $from.parent.textBetween(0, $from.parentOffset, null, '\0');

                            if (textBefore === '/') {
                                extension.storage.isOpen = true;
                                extension.storage.query = '';
                                extension.storage.items = extension.options.commands;
                                extension.options.onShow?.(extension.options.commands, '');
                            } else if (textBefore.startsWith('/') && /^\/\w*$/.test(textBefore)) {
                                const query = textBefore.slice(1).toLowerCase();
                                const items = extension.options.commands.filter(
                                    (cmd: SlashCommand) =>
                                        cmd.title.toLowerCase().includes(query) ||
                                        cmd.description.toLowerCase().includes(query)
                                );
                                extension.storage.query = query;
                                extension.storage.items = items;
                                extension.options.onShow?.(items, query);
                            } else if (extension.storage.isOpen) {
                                extension.storage.isOpen = false;
                                extension.options.onHide?.();
                            }
                        },
                    };
                },
            }),
        ];
    },

    addCommands() {
        return {
            executeSlashCommand: (commandTitle: string) => ({ editor }: { editor: any }) => {
                const cmd = this.options.commands.find(
                    (c: SlashCommand) => c.title === commandTitle
                );
                if (cmd) {
                    const { selection } = editor.state;
                    const from = selection.$from;
                    const start = from.start();
                    editor.chain().deleteRange({ from: start, to: from.pos }).run();
                    cmd.command(editor);
                    return true;
                }
                return false;
            },
        } as any;
    },
});

export { DEFAULT_COMMANDS as defaultSlashCommands };
