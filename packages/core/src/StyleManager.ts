export interface StyleDefinition {
    name: string;
    parent?: string;
    attributes: Record<string, any>;
}

export class StyleManager {
    private styles: Map<string, StyleDefinition> = new Map();

    constructor() {
        this.setupDefaultStyles();
    }

    private setupDefaultStyles() {
        this.addStyle({
            name: 'Normal',
            attributes: {
                fontFamily: 'Inter',
                fontSize: '11pt',
                color: '#000000',
                textAlign: 'left',
                lineHeight: '1.2',
                spacingAfter: '8pt',
            },
        });

        this.addStyle({
            name: 'Heading 1',
            parent: 'Normal',
            attributes: {
                fontSize: '24pt',
                fontWeight: 'bold',
                spacingBefore: '12pt',
                spacingAfter: '12pt',
            },
        });

        this.addStyle({
            name: 'Heading 2',
            parent: 'Normal',
            attributes: {
                fontSize: '18pt',
                fontWeight: 'bold',
                spacingBefore: '10pt',
                spacingAfter: '10pt',
            },
        });

        this.addStyle({
            name: 'Quote',
            parent: 'Normal',
            attributes: {
                fontStyle: 'italic',
                indent: 1,
                color: '#666666',
            },
        });
    }

    public addStyle(style: StyleDefinition) {
        this.styles.set(style.name, style);
    }

    public getStyle(name: string): StyleDefinition | undefined {
        return this.styles.get(name);
    }

    /**
     * Resolves a style by merging it with all its parents.
     */
    public resolveStyle(name: string): Record<string, any> {
        const style = this.getStyle(name);
        if (!style) return {};

        let resolved = { ...style.attributes };
        let currentParent = style.parent;

        while (currentParent) {
            const parentStyle = this.getStyle(currentParent);
            if (parentStyle) {
                // Merge attributes, keeping existing child attributes
                resolved = { ...parentStyle.attributes, ...resolved };
                currentParent = parentStyle.parent;
            } else {
                currentParent = undefined;
            }
        }

        return resolved;
    }

    public getAllStyles(): StyleDefinition[] {
        return Array.from(this.styles.values());
    }
}
