/**
 * Unified SVG icon set for RK Word Editor.
 *
 * All icons are 16×16 line icons in the spirit of Lucide / Tabler — single
 * stroke colour (`currentColor`), 1.5 stroke width, no fills. Pass them as
 * `innerHTML` of buttons; size and color are controlled by the parent button.
 */

const wrap = (path: string) =>
    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;

export const Icons = {
    // ---- File ----
    fileNew: wrap('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M9 14h6M9 17h4"/>'),
    fileOpen: wrap('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    save: wrap('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>'),
    download: wrap('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>'),
    upload: wrap('<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>'),
    print: wrap('<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M6 17h12v4H6z"/>'),
    pdf: wrap('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><text x="8" y="17" font-size="6" font-weight="700" fill="currentColor" stroke="none">PDF</text>'),
    docx: wrap('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><text x="7" y="18" font-size="6" font-weight="700" fill="currentColor" stroke="none">DOC</text>'),

    // ---- Edit ----
    undo: wrap('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'),
    redo: wrap('<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>'),
    cut: wrap('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>'),
    copy: wrap('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
    paste: wrap('<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/>'),
    clear: wrap('<path d="M21 21H7L3 17l5-5 5 5"/><path d="m12 7 5 5"/><path d="m17 12 4-4-5-5-9 9"/>'),
    formatPainter: wrap('<path d="M3 3h12v5H3z"/><path d="M5 8v2h8V8"/><path d="M9 10v3"/><path d="M7 13h4l-1 5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z"/>'),
    eraser: wrap('<path d="m7 21-4-4L17 3l4 4z"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'),

    // ---- Inline marks ----
    bold: wrap('<path d="M7 5h6a4 4 0 0 1 0 8H7zM7 13h7a4 4 0 0 1 0 8H7z"/>'),
    italic: wrap('<path d="M19 4h-9M14 20H5M15 4 9 20"/>'),
    underline: wrap('<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M5 20h14"/>'),
    strike: wrap('<path d="M16 4h-7a4 4 0 0 0-3.6 5.7"/><path d="M14 12a4 4 0 0 1 0 8H8"/><path d="M3 12h18"/>'),
    // X with a small "2" floating above (superscript) or below (subscript).
    // Drawn as paths so they render identically across browsers without depending on a font.
    superscript: wrap('<path d="M4 7l8 12M12 7l-8 12"/><path d="M16 8a1.6 1.6 0 0 1 3 0c0 1-3 1.5-3 3h3"/>'),
    subscript: wrap('<path d="M4 5l8 12M12 5l-8 12"/><path d="M16 17a1.6 1.6 0 0 1 3 0c0 1-3 1.5-3 3h3"/>'),
    code: wrap('<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4 10 20"/>'),
    link: wrap('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
    unlink: wrap('<path d="m18 8 4-4M16 4l4 4M2 20l4-4M6 16l-4 4"/><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>'),
    highlight: wrap('<path d="m9 11 6 6"/><path d="M3 21h6"/><path d="M5 19l4-7 9-9 4 4-9 9-7 4z"/>'),
    color: wrap('<path d="M4 20h16"/><path d="m6 17 6-13 6 13"/><path d="M8 13h8"/>'),
    fontColor: wrap('<path d="M4 20h16"/><path d="m6 17 6-13 6 13"/><path d="M8 13h8"/>'),
    fillColor: wrap('<path d="m6 11 6-6 8 8-6 6-6 0z"/><path d="m12 5-2-2"/><path d="M2 22h20"/><path d="m18 16 2 2"/>'),

    // ---- Alignment & lists ----
    alignLeft: wrap('<path d="M3 6h18M3 12h12M3 18h18M3 24"/>'),
    alignCenter: wrap('<path d="M3 6h18M6 12h12M3 18h18"/>'),
    alignRight: wrap('<path d="M3 6h18M9 12h12M3 18h18"/>'),
    alignJustify: wrap('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    bulletList: wrap('<circle cx="4" cy="6" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="18" r="1.2" fill="currentColor"/><path d="M9 6h12M9 12h12M9 18h12"/>'),
    orderedList: wrap('<path d="M9 6h12M9 12h12M9 18h12"/><path d="M3 5h2v3M3 11h2.5L3 14h2.5M3 18h2v.5l-2 1V20h2"/>'),
    nepaliList: wrap('<path d="M9 6h12M9 12h12M9 18h12"/><text x="2" y="9" font-size="7" fill="currentColor" stroke="none">१</text><text x="2" y="15" font-size="7" fill="currentColor" stroke="none">२</text>'),
    taskList: wrap('<rect x="3" y="4" width="6" height="6" rx="1"/><path d="m4 7 1 1 2-2"/><rect x="3" y="14" width="6" height="6" rx="1"/><path d="M12 7h9M12 17h9"/>'),
    indentRight: wrap('<path d="M3 6h18M11 12h10M3 18h18"/><path d="m3 9 4 3-4 3"/>'),
    indentLeft: wrap('<path d="M3 6h18M11 12h10M3 18h18"/><path d="m9 9-4 3 4 3"/>'),

    // ---- Headings & paragraph ----
    heading: wrap('<path d="M6 4v16M18 4v16M6 12h12"/>'),
    h1: wrap('<path d="M4 4v16M4 12h10M14 4v16"/><text x="17" y="20" font-size="6" font-weight="700" fill="currentColor" stroke="none">1</text>'),
    h2: wrap('<path d="M4 4v16M4 12h10M14 4v16"/><text x="17" y="20" font-size="6" font-weight="700" fill="currentColor" stroke="none">2</text>'),
    h3: wrap('<path d="M4 4v16M4 12h10M14 4v16"/><text x="17" y="20" font-size="6" font-weight="700" fill="currentColor" stroke="none">3</text>'),
    paragraph: wrap('<path d="M13 4v16M17 4v16M9 4h8M9 4v8M9 4a4 4 0 0 0 0 8M9 12h4"/>'),
    blockquote: wrap('<path d="M3 21V11l5-7M9 21V11l5-7"/><path d="M3 11h6M9 11h6"/>'),
    horizontalRule: wrap('<path d="M3 12h18"/>'),

    // ---- Insert ----
    image: wrap('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 21"/>'),
    table: wrap('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'),
    math: wrap('<path d="M5 4h14M5 4 12 12 5 20h14M9 12h6"/>'),
    citation: wrap('<path d="M7 7v4a3 3 0 0 0 3 3h0V7zM14 7v4a3 3 0 0 0 3 3h0V7z"/>'),
    footnote: wrap('<path d="M5 5h12v12H5z" opacity="0"/><path d="M4 4h6v6H4zm10 0h6v6h-6z" opacity="0"/><path d="M4 4v16M4 4h16M4 12h12M4 20h16"/>'),
    pageBreak: wrap('<path d="M5 6h14M5 18h14"/><path d="M3 12h2M9 12h2M13 12h2M19 12h2"/>'),
    pageNumber: wrap('<path d="M5 4h12l3 3v13a2 2 0 0 1-2 2H5z"/><text x="8" y="16" font-size="7" font-weight="700" fill="currentColor" stroke="none">#</text>'),
    toc: wrap('<path d="M3 6h2M3 12h2M3 18h2M8 6h13M8 12h13M8 18h13"/>'),
    template: wrap('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/>'),
    emoji: wrap('<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r=".8" fill="currentColor"/><circle cx="15" cy="10" r=".8" fill="currentColor"/><path d="M8 14a4 4 0 0 0 8 0"/>'),
    textbox: wrap('<rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M7 10h10M7 14h6"/>'),

    // ---- Layout & view ----
    pageSize: wrap('<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 3v6M15 3v6M9 21v-6M15 21v-6"/>'),
    margins: wrap('<rect x="3" y="3" width="18" height="18"/><rect x="6" y="6" width="12" height="12" stroke-dasharray="2 2"/>'),
    orientation: wrap('<rect x="4" y="3" width="16" height="11" rx="1"/><rect x="6" y="16" width="9" height="5" rx="1"/>'),
    zoomIn: wrap('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>'),
    zoomOut: wrap('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/>'),
    eye: wrap('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: wrap('<path d="M3 3l18 18"/><path d="M10.6 5.1A11 11 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-2.6 3.4M6.5 6.5C3.7 8.4 2 12 2 12s4 7 10 7c2 0 3.7-.5 5.1-1.3"/><path d="M14.1 14.1A3 3 0 0 1 9.9 9.9"/>'),
    sun: wrap('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: wrap('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    panelLeft: wrap('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>'),
    panelRight: wrap('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>'),

    // ---- Misc & status ----
    search: wrap('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'),
    replace: wrap('<path d="M14 4 18 8 14 12"/><path d="M18 8H8a4 4 0 0 0-4 4v0"/><path d="m10 20-4-4 4-4"/><path d="M6 16h10a4 4 0 0 0 4-4v0"/>'),
    settings: wrap('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    info: wrap('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>'),
    keyboard: wrap('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M8 14h8"/>'),
    github: wrap('<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-4a3 3 0 0 0-1-2c3 0 6-2 6-6 0-1.6-.6-3-1.5-4 .4-1 .4-2.5-.5-4 0 0-1.6 0-3 1.4-1.5-.4-3-.5-4.5 0C7 1.4 5.5 1 5.5 1c-1 1.5-1 3-.5 4-1 1-1.5 2.4-1.5 4 0 4 3 6 6 6a3 3 0 0 0-1 2v4"/>'),
    chevronDown: wrap('<path d="m6 9 6 6 6-6"/>'),
    chevronUp: wrap('<path d="m18 15-6-6-6 6"/>'),
    chevronRight: wrap('<path d="m9 6 6 6-6 6"/>'),
    chevronLeft: wrap('<path d="m15 6-6 6 6 6"/>'),
    close: wrap('<path d="M18 6 6 18M6 6l12 12"/>'),
    check: wrap('<path d="m5 12 5 5L20 7"/>'),
    plus: wrap('<path d="M12 5v14M5 12h14"/>'),
    minus: wrap('<path d="M5 12h14"/>'),
    moreHorizontal: wrap('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'),
    track: wrap('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>'),
    comment: wrap('<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1 4.7-12.3 8.4 8.4 0 0 1 3.6-.9h.5a8.5 8.5 0 0 1 8 8z"/>'),
    drag: wrap('<circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/>'),
};

export type IconName = keyof typeof Icons;

export function icon(name: IconName): string {
    return Icons[name];
}
