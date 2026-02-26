import { Extension } from '@tiptap/core';
import { StyleManager } from '../StyleManager';
export interface StylesEngineOptions {
    manager: StyleManager;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        stylesEngine: {
            /**
             * Apply a named style to the selection.
             */
            applyNamedStyle: (name: string) => ReturnType;
            /**
             * Update a named style definition.
             */
            updateNamedStyle: (name: string, attributes: Record<string, any>) => ReturnType;
        };
    }
}
export declare const StylesEngine: Extension<StylesEngineOptions, any>;
