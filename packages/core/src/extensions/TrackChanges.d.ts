import { Extension } from '@tiptap/core';
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
export declare const TrackChanges: Extension<any, any>;
/**
 * TrackInsert mark - Visually highlights inserted text.
 */
export declare const TrackInsert: Extension<any, any>;
/**
 * TrackDelete mark - Visually highlights deleted text.
 */
export declare const TrackDelete: Extension<any, any>;
