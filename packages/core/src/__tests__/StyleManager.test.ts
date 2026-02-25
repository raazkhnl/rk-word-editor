import { describe, it, expect } from 'vitest';
import { StyleManager } from '../StyleManager';

describe('StyleManager', () => {
    it('initializes with built-in styles', () => {
        const sm = new StyleManager();
        const styles = sm.getAllStyles();
        expect(styles.length).toBeGreaterThan(0);
    });

    it('has a "Normal" style', () => {
        const sm = new StyleManager();
        const normal = sm.getStyle('Normal');
        expect(normal).toBeDefined();
        expect(normal?.name).toBe('Normal');
    });

    it('resolves heading styles', () => {
        const sm = new StyleManager();
        const h1 = sm.getStyle('Heading 1');
        expect(h1).toBeDefined();
    });

    it('adds and retrieves a custom style', () => {
        const sm = new StyleManager();
        sm.addStyle({
            name: 'CustomStyle',
            attributes: { fontSize: '16pt', bold: true },
        } as any);
        const found = sm.getStyle('CustomStyle');
        expect(found).toBeDefined();
        expect(found?.name).toBe('CustomStyle');
    });

    it('getAllStyles returns all styles', () => {
        const sm = new StyleManager();
        const initialCount = sm.getAllStyles().length;
        sm.addStyle({ name: 'TestStyle2', attributes: {} } as any);
        expect(sm.getAllStyles().length).toBe(initialCount + 1);
    });
});
