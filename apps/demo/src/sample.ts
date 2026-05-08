/**
 * Default sample document loaded the first time the demo is opened.
 * Showcases: title, headings, lists, table, image, blockquote, code block,
 * task list, footnote, callout text box, and a TOC at the top.
 */
export const SAMPLE_DOC_HTML = `
<h1 class="rk-title">Welcome to RK Word Editor</h1>
<p class="rk-subtitle">A free, open-source Word-style editor for the web — try every feature right here.</p>

<p>This is a fully-featured rich-text editor built with Tiptap and ProseMirror. It works on desktop, tablet, and mobile, supports DOCX, PDF, Markdown, HTML, and JSON exports, and ships with dark mode, page layouts, find &amp; replace, draggable text boxes, image resize, slash commands, and a context-aware properties panel — all under MIT.</p>

<blockquote><p>Tip: press <strong>Ctrl/⌘ + /</strong> to open the command palette, or just start typing <code>/</code> on a new line for slash commands.</p></blockquote>

<h2>Quick tour</h2>
<ul>
  <li><strong>Format text</strong> with the toolbar or <code>Ctrl/⌘+B/I/U</code>.</li>
  <li><strong>Insert</strong> images (drag &amp; drop or paste), tables, links, math, and footnotes from the Insert menu.</li>
  <li><strong>Layout</strong> the page (size, orientation, margins) from <em>File → Page layout</em>.</li>
  <li><strong>Find &amp; replace</strong> with <code>Ctrl/⌘+F</code> or <code>Ctrl/⌘+H</code>.</li>
  <li><strong>Theme</strong> toggle in the top-right (☀️ / 🌙).</li>
</ul>

<h2>Tables</h2>
<table>
  <tbody>
    <tr><th><p>Feature</p></th><th><p>Status</p></th><th><p>Notes</p></th></tr>
    <tr><td><p>DOCX export</p></td><td><p>✅</p></td><td><p>Embedded images, tables, lists, footnotes.</p></td></tr>
    <tr><td><p>True PDF / print</p></td><td><p>✅</p></td><td><p>Isolated iframe with page sizes.</p></td></tr>
    <tr><td><p>Track changes</p></td><td><p>✅</p></td><td><p>Authored insert / delete diff marks.</p></td></tr>
    <tr><td><p>Find &amp; replace</p></td><td><p>✅</p></td><td><p>Regex, whole word, case-sensitive.</p></td></tr>
  </tbody>
</table>

<h2>Code &amp; math</h2>
<p>You can drop in code blocks for snippets:</p>
<pre><code>// Mount the editor in any framework
import { EditorShell } from '@raazkhnl/rk-editor-ui';

new EditorShell({
  container: document.getElementById('app'),
  initialContent: '&lt;p&gt;Hello, world!&lt;/p&gt;',
  outline: true,
});</code></pre>

<p>And inline math like <span class="rk-math-inline">E = mc²</span> works too.</p>

<h2>Try a checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked /></label><div><p>Open the demo</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Edit something</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Export to DOCX (File → Save copy as DOCX)</p></div></li>
</ul>

<h2>Get involved</h2>
<p>RK Word Editor is open source. Star the repo, file issues, or send a PR — we'd love your feedback.</p>
<p><a href="https://github.com/raazkhnl/rk-word-editor" target="_blank" rel="noopener">github.com/raazkhnl/rk-word-editor</a></p>
`;
