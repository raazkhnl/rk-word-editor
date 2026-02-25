import { WordEditor } from '@rk-editor/core';
import { WordToolbar } from '@rk-editor/ui';
import '@rk-editor/styles';

const editorContainer = document.querySelector('#editor-container') as HTMLElement;
const toolbarContainer = document.querySelector('#toolbar-container') as HTMLElement;

if (editorContainer && toolbarContainer) {
  const editor = new WordEditor({
    element: editorContainer,
    content: `
      <h1>RK-Word-Editor Demo</h1>
      <p>Welcome to the <b>RK-Word-Editor</b>, a production-ready, open-source web Word editor.</p>
      
      <h2>Core Features</h2>
      <ul>
        <li><b>Rich Character Formatting</b> (Bold, Italic, Color, Size)</li>
        <li><b>Paragraph Control</b> (Alignment, Line Height, Indentation)</li>
        <li><b>Lists</b> (Bullet, Numbered, Checklists)</li>
        <li><b>Professional Tables</b> (Resizable, Row/Col management)</li>
        <li><b>Page System</b> (Visual Page Breaks)</li>
        <li><b>References</b> (Footnotes & TOC)</li>
      </ul>

      <div data-type="page-break" class="rk-page-break"></div>

      <h2>Enhanced Layouts</h2>
      <table>
        <tbody>
          <tr>
            <th>Module</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
          <tr>
            <td>@rk-editor/core</td>
            <td>Headless Engine</td>
            <td>Ready</td>
          </tr>
          <tr>
            <td>@rk-editor/ui</td>
            <td>Premium UI Layer</td>
            <td>Ready</td>
          </tr>
        </tbody>
      </table>

      <p>Try inserting an image from the toolbar, or generated a Table of Contents!</p>
    `,
    onUpdate: ({ editor }) => {
      // console.log('Content updated:', editor.getHTML());
    }
  });

  new WordToolbar(editor, toolbarContainer);
}
