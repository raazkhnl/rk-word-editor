import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface FindReplaceStorage {
  query: string;
  results: { from: number; to: number }[];
  current: number;
  caseSensitive: boolean;
  regex: boolean;
}

interface FindOptions {
  caseSensitive?: boolean;
  regex?: boolean;
  wholeWord?: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    findReplace: {
      findText: (query: string, options?: FindOptions) => ReturnType;
      replaceText: (query: string, replacement: string, options?: FindOptions) => ReturnType;
      replaceAllText: (query: string, replacement: string, options?: FindOptions) => ReturnType;
      goToNextMatch: () => ReturnType;
      goToPreviousMatch: () => ReturnType;
      clearSearch: () => ReturnType;
    };
  }
}

const KEY = new PluginKey<DecorationSet>('rkFindReplace');

function buildRegex(query: string, opts: FindOptions): RegExp | null {
  if (!query) return null;
  let pattern = opts.regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (opts.wholeWord && !opts.regex) pattern = `\\b${pattern}\\b`;
  const flags = `g${opts.caseSensitive ? '' : 'i'}`;
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

function findMatches(doc: any, query: string, opts: FindOptions): { from: number; to: number }[] {
  const results: { from: number; to: number }[] = [];
  const regex = buildRegex(query, opts);
  if (!regex) return results;

  doc.descendants((node: any, pos: number) => {
    if (!node.isText) return;
    const text = node.text as string;
    let match: RegExpExecArray | null;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match[0].length === 0) { regex.lastIndex++; continue; }
      results.push({ from: pos + match.index, to: pos + match.index + match[0].length });
    }
  });
  return results;
}

function decorationsFor(results: { from: number; to: number }[], current: number): DecorationSet {
  const decos = results.map((r, i) =>
    Decoration.inline(r.from, r.to, {
      class: i === current ? 'rk-find-match rk-find-match-current' : 'rk-find-match',
    })
  );
  return DecorationSet.create({ size: 0 } as any, decos);
}

export const FindReplace = Extension.create<unknown, FindReplaceStorage>({
  name: 'findReplace',

  addStorage() {
    return {
      query: '',
      results: [],
      current: -1,
      caseSensitive: false,
      regex: false,
    };
  },

  addCommands() {
    return {
      findText:
        (query: string, options: FindOptions = {}) =>
        ({ editor, dispatch }: { editor: any; dispatch?: any }) => {
          this.storage.query = query;
          this.storage.caseSensitive = !!options.caseSensitive;
          this.storage.regex = !!options.regex;
          const results = query ? findMatches(editor.state.doc, query, options) : [];
          this.storage.results = results;
          this.storage.current = results.length ? 0 : -1;
          if (dispatch) editor.view.dispatch(editor.state.tr.setMeta(KEY, true));
          return results.length;
        },

      goToNextMatch:
        () =>
        ({ editor }: { editor: any }) => {
          if (!this.storage.results.length) return false;
          this.storage.current = (this.storage.current + 1) % this.storage.results.length;
          const r = this.storage.results[this.storage.current];
          editor.commands.setTextSelection({ from: r.from, to: r.to });
          editor.commands.scrollIntoView();
          editor.view.dispatch(editor.state.tr.setMeta(KEY, true));
          return true;
        },

      goToPreviousMatch:
        () =>
        ({ editor }: { editor: any }) => {
          if (!this.storage.results.length) return false;
          this.storage.current =
            (this.storage.current - 1 + this.storage.results.length) % this.storage.results.length;
          const r = this.storage.results[this.storage.current];
          editor.commands.setTextSelection({ from: r.from, to: r.to });
          editor.commands.scrollIntoView();
          editor.view.dispatch(editor.state.tr.setMeta(KEY, true));
          return true;
        },

      replaceText:
        (query: string, replacement: string, options: FindOptions = {}) =>
        ({ editor }: { editor: any }) => {
          if (!query) return 0;
          const results = findMatches(editor.state.doc, query, options);
          if (!results.length) return 0;
          const target = results[this.storage.current >= 0 ? this.storage.current : 0];
          editor
            .chain()
            .focus()
            .insertContentAt({ from: target.from, to: target.to }, replacement)
            .run();
          (editor.commands as any).findText(query, options);
          return 1;
        },

      replaceAllText:
        (query: string, replacement: string, options: FindOptions = {}) =>
        ({ editor }: { editor: any }) => {
          if (!query) return 0;
          const results = findMatches(editor.state.doc, query, options);
          if (!results.length) return 0;
          const tr = editor.state.tr;
          for (let i = results.length - 1; i >= 0; i--) {
            tr.insertText(replacement, results[i].from, results[i].to);
          }
          editor.view.dispatch(tr);
          (editor.commands as any).findText(query, options);
          return results.length;
        },

      clearSearch:
        () =>
        ({ editor }: { editor: any }) => {
          this.storage.query = '';
          this.storage.results = [];
          this.storage.current = -1;
          editor.view.dispatch(editor.state.tr.setMeta(KEY, true));
          return true;
        },
    } as any;
  },

  addProseMirrorPlugins() {
    const ext = this;
    return [
      new Plugin<DecorationSet>({
        key: KEY,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, oldSet) {
            if (tr.getMeta(KEY) || tr.docChanged) {
              if (ext.storage.query && tr.docChanged) {
                ext.storage.results = findMatches(tr.doc, ext.storage.query, {
                  caseSensitive: ext.storage.caseSensitive,
                  regex: ext.storage.regex,
                });
                if (ext.storage.current >= ext.storage.results.length) {
                  ext.storage.current = ext.storage.results.length - 1;
                }
              }
              return decorationsFor(ext.storage.results, ext.storage.current);
            }
            return oldSet.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state: any) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
