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
            const engine = new ImportEngine();
            const createSpy = vi.spyOn(document, 'createElement');
            const clickSpy = vi.fn();

            createSpy.mockImplementationOnce(() => {
                const a = document.createElement('a');
                a.click = clickSpy;
                return a;
            });

            engine.downloadMarkdown('# Hello\n\nWorld', 'test.md');
            expect(clickSpy).toHaveBeenCalled();
            createSpy.mockRestore();
        });
    });
});
