import type { PageLayoutOptions } from './extensions/PageLayout';

export interface PrintOptions {
  /** Document title shown in print preview / saved PDF. */
  title?: string;
  /** Override the editor's page layout for this print only. */
  pageLayout?: Partial<PageLayoutOptions>;
  /** Extra CSS to inject into the print iframe. */
  extraCss?: string;
  /** Optional header HTML printed at the top of every page. */
  headerHtml?: string;
  /** Optional footer HTML printed at the bottom of every page. */
  footerHtml?: string;
  /** Show page numbers in the footer (defaults to true). */
  pageNumbers?: boolean;
  /** Auto-close the print iframe after the print dialog (default true). */
  autoClose?: boolean;
}

const DEFAULT_PRINT_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 12pt;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .rk-print-root {
    width: 100%;
    margin: 0;
    padding: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Calibri', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 700;
    line-height: 1.25;
    margin: 1em 0 0.4em;
    page-break-after: avoid;
    break-after: avoid;
  }
  h1 { font-size: 22pt; }
  h2 { font-size: 18pt; }
  h3 { font-size: 14pt; }
  h4 { font-size: 12pt; }
  p { margin: 0 0 0.6em; orphans: 3; widows: 3; }
  a { color: #1a73e8; text-decoration: underline; }
  ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
  blockquote {
    border-left: 4px solid #c8ccd0;
    padding-left: 1em;
    margin: 1em 0;
    color: #444;
    font-style: italic;
  }
  pre {
    background: #f5f5f5;
    border: 1px solid #ddd;
    padding: 0.6em;
    border-radius: 4px;
    overflow: auto;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    page-break-inside: avoid;
  }
  code {
    background: #f5f5f5;
    border: 1px solid #ddd;
    padding: 1px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    page-break-inside: auto;
  }
  table, th, td { border: 1px solid #888; }
  th, td { padding: 6px 10px; vertical-align: top; }
  th { background: #f3f4f6; text-align: left; font-weight: 700; }
  tr { page-break-inside: avoid; page-break-after: auto; }
  img {
    max-width: 100%;
    height: auto;
    page-break-inside: avoid;
  }
  figcaption, .rk-caption {
    text-align: center;
    font-size: 10pt;
    color: #555;
    font-style: italic;
    margin: 0.4em 0 1em;
  }
  .rk-page-break, [data-type="page-break"] {
    display: block;
    height: 0;
    page-break-after: always;
    break-after: page;
    border: none;
  }
  .rk-toc {
    margin: 1em 0 1.4em;
    padding: 0.6em 0 0.4em;
    border-top: 1px solid #d0d4d8;
    border-bottom: 1px solid #d0d4d8;
    page-break-inside: auto;
  }
  .rk-toc-header {
    display: flex;
    align-items: baseline;
    margin: 0 0 0.6em;
  }
  .rk-toc-title {
    margin: 0;
    font-size: 14pt;
    font-weight: 700;
    font-family: 'Calibri', 'Helvetica Neue', Arial, sans-serif;
  }
  .rk-toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .rk-toc-item {
    margin: 0.15em 0;
    padding: 0;
    list-style: none;
  }
  .rk-toc-link {
    display: flex;
    align-items: baseline;
    gap: 0.4em;
    color: #000;
    text-decoration: none;
  }
  .rk-toc-text { flex: 0 1 auto; }
  .rk-toc-leader {
    flex: 1 1 auto;
    border-bottom: 1px dotted #777;
    transform: translateY(-3px);
    margin: 0 0.25em;
    min-width: 1em;
  }
  .rk-toc-page {
    flex: 0 0 auto;
    font-variant-numeric: tabular-nums;
    color: #333;
  }
  .rk-toc-l1 .rk-toc-link { padding-left: 0;     font-weight: 600; }
  .rk-toc-l2 .rk-toc-link { padding-left: 1.2em; }
  .rk-toc-l3 .rk-toc-link { padding-left: 2.4em; font-size: 0.95em; }
  .rk-toc-l4 .rk-toc-link { padding-left: 3.6em; font-size: 0.9em;  color: #444; }
  .rk-toc-l5 .rk-toc-link { padding-left: 4.8em; font-size: 0.85em; color: #555; }
  .rk-toc-l6 .rk-toc-link { padding-left: 6em;   font-size: 0.85em; color: #666; }
  .rk-toc-empty { color: #888; font-style: italic; margin: 0.5em 0; }
  .rk-track-insert { color: #0a7c2f; text-decoration: underline; text-decoration-color: #0a7c2f; }
  .rk-track-delete { color: #b3261e; text-decoration: line-through; }
  ul[data-type="taskList"] { list-style: none; padding-left: 0.5em; }
  ul[data-type="taskList"] li { display: flex; gap: 0.5em; align-items: baseline; }
  ul[data-type="taskList"] li > label > input { margin-top: 0.15em; }
  .rk-image-resize-wrapper {
    display: inline-block;
    position: relative;
    max-width: 100%;
  }
  .rk-image-resize-wrapper img {
    display: block;
    max-width: 100%;
    height: auto;
  }
  .rk-textbox {
    border: 1px solid #c8ccd0;
    background: #fff;
    padding: 0.6em 0.8em;
    margin: 0.6em 0;
    border-radius: 4px;
    page-break-inside: avoid;
  }
  .rk-textbox-content > p:first-child { margin-top: 0; }
  .rk-textbox-content > *:last-child { margin-bottom: 0; }
`;

/**
 * Renders the editor content in an isolated, hidden iframe and triggers the
 * browser's print dialog. The user may then "Save as PDF" with proper
 * pagination, no editor chrome, no page-overflow scrollbars, and the configured
 * page size / orientation.
 */
export class PrintEngine {
  public print(html: string, options: PrintOptions = {}): void {
    const layout = mergePageLayout(options.pageLayout);
    const pageSize = printPageSize(layout);
    const margin = `${layout.margins.top} ${layout.margins.right} ${layout.margins.bottom} ${layout.margins.left}`;
    const showPageNumbers = options.pageNumbers !== false;
    const title = options.title || 'Document';

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument!;
    const docHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escape(title)}</title>
  <style>
    @page {
      size: ${pageSize};
      margin: ${margin};
      ${showPageNumbers ? `@bottom-right { content: counter(page) " / " counter(pages); font-family: sans-serif; font-size: 9pt; color: #666; }` : ''}
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    ${DEFAULT_PRINT_CSS}
    ${options.extraCss || ''}
  </style>
</head>
<body>
  ${options.headerHtml ? `<header class="rk-print-header">${options.headerHtml}</header>` : ''}
  <main class="rk-print-root">${html}</main>
  ${options.footerHtml ? `<footer class="rk-print-footer">${options.footerHtml}</footer>` : ''}
</body>
</html>`;

    doc.open();
    doc.write(docHtml);
    doc.close();

    const cleanup = () => {
      try { document.body.removeChild(iframe); } catch { /* already gone */ }
    };

    const trigger = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('[PrintEngine] print failed', e);
      } finally {
        if (options.autoClose !== false) {
          // Slight delay to allow print dialog to read the document.
          setTimeout(cleanup, 1000);
        }
      }
    };

    // Wait for images to load before triggering print so they appear in PDF.
    const waitForImages = async () => {
      const images = Array.from(doc.images || []);
      await Promise.all(
        images.map(img => img.complete
          ? Promise.resolve()
          : new Promise<void>(resolve => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            })
        )
      );
    };

    if (doc.readyState === 'complete') {
      waitForImages().then(trigger);
    } else {
      iframe.addEventListener('load', () => waitForImages().then(trigger), { once: true });
    }
  }
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function printPageSize(layout: PageLayoutOptions): string {
  const size = (layout.pageSize || 'A4').toLowerCase();
  const orient = layout.orientation === 'landscape' ? 'landscape' : 'portrait';
  const known = ['a3', 'a4', 'a5', 'letter', 'legal', 'tabloid'];
  if (known.includes(size)) return `${size} ${orient}`;
  if (layout.width && layout.height) return `${layout.width} ${layout.height}`;
  return `A4 ${orient}`;
}

function mergePageLayout(layout?: Partial<PageLayoutOptions>): PageLayoutOptions {
  const base: PageLayoutOptions = {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
  };
  if (!layout) return base;
  return {
    ...base,
    ...layout,
    margins: { ...base.margins, ...(layout.margins || {}) },
  };
}
