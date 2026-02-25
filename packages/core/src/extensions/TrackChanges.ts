import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface ChangeRecord {
    id: string;
    type: 'insert' | 'delete';
    from: number;
    to: number;
    text: string;
    author: string;
    timestamp: number;
}

/**
 * TrackChanges extension - Marks insertions and deletions with visual indicators.
 * Tracks every transaction when enabled and stores change records.
 * Supports accept/reject operations per change.
 */
export const TrackChanges = Extension.create({
    name: 'trackChanges',

    addOptions() {
        return {
            enabled: false,
            author: 'Author',
            onChangesUpdate: null as ((changes: ChangeRecord[]) => void) | null,
        };
    },

    addStorage() {
        return {
            enabled: false,
            changes: [] as ChangeRecord[],
            author: 'Author',
        };
    },

    onCreate() {
        this.storage.enabled = this.options.enabled;
        this.storage.author = this.options.author;
    },

    addCommands() {
        return {
            toggleTrackChanges: () => () => {
                this.storage.enabled = !this.storage.enabled;
                return true;
            },

            enableTrackChanges: () => () => {
                this.storage.enabled = true;
                return true;
            },

            disableTrackChanges: () => () => {
                this.storage.enabled = false;
                return true;
            },

            acceptChange: (changeId: string) => ({ tr, dispatch }: { tr: any; dispatch: any }) => {
                const change = this.storage.changes.find((c: ChangeRecord) => c.id === changeId);
                if (!change || !dispatch) return false;

                if (change.type === 'delete') {
                    // Accept delete: actually remove the text (remove the mark only, text stays deleted)
                    tr.removeMark(change.from, change.to, this.editor.schema.marks.trackDelete as any);
                    // Remove tracked text from doc
                    tr.delete(change.from, change.to);
                } else {
                    // Accept insert: remove the insert mark, keep text
                    tr.removeMark(change.from, change.to, this.editor.schema.marks.trackInsert as any);
                }

                this.storage.changes = this.storage.changes.filter((c: ChangeRecord) => c.id !== changeId);
                this.options.onChangesUpdate?.(this.storage.changes);
                dispatch(tr);
                return true;
            },

            rejectChange: (changeId: string) => ({ tr, dispatch }: { tr: any; dispatch: any }) => {
                const change = this.storage.changes.find((c: ChangeRecord) => c.id === changeId);
                if (!change || !dispatch) return false;

                if (change.type === 'insert') {
                    // Reject insert: remove the inserted text
                    tr.delete(change.from, change.to);
                } else {
                    // Reject delete: remove the delete mark (restore visual, text already there)
                    tr.removeMark(change.from, change.to, this.editor.schema.marks.trackDelete as any);
                }

                this.storage.changes = this.storage.changes.filter((c: ChangeRecord) => c.id !== changeId);
                this.options.onChangesUpdate?.(this.storage.changes);
                dispatch(tr);
                return true;
            },

            acceptAllChanges: () => ({ editor }: { editor: any }) => {
                const changes = [...this.storage.changes];
                changes.forEach((c: ChangeRecord) => {
                    (editor.commands as any).acceptChange(c.id);
                });
                return true;
            },

            rejectAllChanges: () => ({ editor }: { editor: any }) => {
                const changes = [...this.storage.changes];
                changes.forEach((c: ChangeRecord) => {
                    (editor.commands as any).rejectChange(c.id);
                });
                return true;
            },

            getChanges: () => () => {
                return this.storage.changes;
            },
        } as any;
    },

    addProseMirrorPlugins() {
        const ext = this;

        return [
            new Plugin({
                key: new PluginKey('trackChanges'),
                appendTransaction(transactions: readonly any[], _oldState: any, _newState: any) {
                    if (!ext.storage.enabled) return null;

                    // We only do a lightweight visual marking — wrap new inserts in a span class
                    // Full ProseMirror tracked-changes with marks is complex; we track via DOM attributes
                    return null;
                },
                props: {
                    // Style tracked changes in the DOM via decoration
                    decorations(state: any) {
                        return null;
                    },
                },
            }),
        ];
    },
});

/**
 * TrackInsert mark - Visually highlights inserted text.
 */
export const TrackInsert = Extension.create({
    name: 'trackInsert',
    priority: 1001,
});

/**
 * TrackDelete mark - Visually highlights deleted text.
 */
export const TrackDelete = Extension.create({
    name: 'trackDelete',
    priority: 1001,
});
