export interface StyleDefinition {
    name: string;
    parent?: string;
    attributes: Record<string, any>;
}
export declare class StyleManager {
    private styles;
    constructor();
    private setupDefaultStyles;
    addStyle(style: StyleDefinition): void;
    getStyle(name: string): StyleDefinition | undefined;
    /**
     * Resolves a style by merging it with all its parents.
     */
    resolveStyle(name: string): Record<string, any>;
    getAllStyles(): StyleDefinition[];
}
