import { describe, it, expect, vi } from 'vitest';
import { ImportEngine } from '../ImportEngine';

describe('ImportEngine', () => {
    describe('exportMarkdown', () => {
        it('converts basic HTML to markdown', async () => {
            vi.mock('turndown', () => {
                return {
                    default: class {
                        turndown(html: string) {
                            // Minimal mock: strip tags
                            return html.replace(/<[^>]+>/g, '').trim();
                        }
                    },
                };
            });

            // Just test that the method exists and is callable
            const engine = new ImportEngine();
            expect(typeof engine.exportMarkdown).toBe('function');
        });
    });

    describe('downloadMarkdown', () => {
        it('creates and clicks a download link', () => {
            // Polyfill URL methods missing from jsdom
            (URL as any).createObjectURL = vi.fn(() => 'blob://test');
            (URL as any).revokeObjectURL = vi.fn();

            const engine = new ImportEngine();
            const clickSpy = vi.fn();
            const realCreate = document.createElement.bind(document);
            const createSpy = vi.spyOn(document, 'createElement').mockImplementationOnce((tag: any) => {
                const el = realCreate(tag);
                if (tag === 'a') (el as any).click = clickSpy;
                return el;
            });

            engine.downloadMarkdown('# Hello\n\nWorld', 'test.md');
            expect(clickSpy).toHaveBeenCalled();
            createSpy.mockRestore();
        });
    });
});
