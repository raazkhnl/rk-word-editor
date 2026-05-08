# Notice — Third-party software

RK Word Editor is a free, open-source project distributed under the
[MIT License](LICENSE) by [RaaZ Khanal](https://github.com/raazkhnl).

> **You can use it for any purpose** — personal, commercial, internal,
> SaaS, paid products, large enterprise — without paying or asking
> permission. The only requirement is to keep the MIT licence text and
> copyright notice intact when you redistribute the source code (modern
> bundlers do this automatically).
>
> An acknowledgement to the original developer (RaaZ Khanal) in your
> product credits, "About" page, or release notes is appreciated but
> **not legally required**.

---

## Direct dependencies

The packages below are bundled into `@raazkhnl/rk-editor-core`,
`@raazkhnl/rk-editor-ui`, or `@raazkhnl/rk-editor-cli`. Every one of
them carries a permissive licence (MIT, BSD-2-Clause, BSD-3-Clause,
ISC, Apache-2.0, or BlueOak), so the combined work stays MIT-compatible
and free for commercial use.

| Package | Version | Licence |
| --- | --- | --- |
| @tiptap/core | 2.27.2 | MIT |
| @tiptap/starter-kit | 2.27.2 | MIT |
| @tiptap/pm | 2.27.2 | MIT |
| @tiptap/extension-color | 2.27.2 | MIT |
| @tiptap/extension-font-family | 2.27.2 | MIT |
| @tiptap/extension-highlight | 2.27.2 | MIT |
| @tiptap/extension-image | 2.27.2 | MIT |
| @tiptap/extension-placeholder | 2.27.2 | MIT |
| @tiptap/extension-subscript | 2.27.2 | MIT |
| @tiptap/extension-superscript | 2.27.2 | MIT |
| @tiptap/extension-table | 2.27.2 | MIT |
| @tiptap/extension-table-cell | 2.27.2 | MIT |
| @tiptap/extension-table-header | 2.27.2 | MIT |
| @tiptap/extension-table-row | 2.27.2 | MIT |
| @tiptap/extension-task-item | 2.27.2 | MIT |
| @tiptap/extension-task-list | 2.27.2 | MIT |
| @tiptap/extension-text-align | 2.27.2 | MIT |
| @tiptap/extension-text-style | 2.27.2 | MIT |
| @tiptap/extension-underline | 2.27.2 | MIT |
| docx | 9.6.1 | MIT |
| file-saver | 2.0.5 | MIT |
| mammoth | 1.12.0 | BSD-2-Clause |
| marked | 17.0.6 | MIT |
| turndown | 7.2.4 | MIT |
| turndown-plugin-gfm | 1.0.2 | MIT |
| chalk | 5.6.2 | MIT |
| commander | 12.1.0 | MIT |
| fs-extra | 11.3.4 | MIT |
| prompts | 2.4.2 | MIT |

## Transitive dependency licence audit

A scan of the full `node_modules` tree (318 packages) returned the
following distribution. Zero copyleft (GPL / AGPL / LGPL) and zero
non-commercial licences are present.

| Licence | Count |
| --- | --- |
| MIT | 276 |
| ISC (functionally MIT) | 16 |
| BSD-2-Clause | 7 |
| BSD-3-Clause | 6 |
| BlueOak-1.0.0 (functionally MIT) | 5 |
| Apache-2.0 | 3 |
| MIT-0 (public-domain-equivalent) | 1 |
| (MIT OR Zlib) — both permissive | 1 |
| (MIT OR GPL-3.0-or-later) — choose MIT | 1 |

To regenerate this audit at any time:

```bash
npm ls --all --json --silent --omit=dev | node tools/audit-licences.js
# or any equivalent SBOM/licence tool: license-checker, npm-license-crawler, syft.
```

## Attribution to upstream projects

A heartfelt thank-you to the maintainers of:

- **[Tiptap](https://tiptap.dev)** — the headless editor framework everything
  in this project is built on top of.
- **[ProseMirror](https://prosemirror.net)** — the rendering engine under
  Tiptap.
- **[docx](https://github.com/dolanmiu/docx)** — DOCX export.
- **[Mammoth](https://github.com/mwilliamson/mammoth.js)** — DOCX import.
- **[Marked](https://marked.js.org)** and **[Turndown](https://github.com/mixmark-io/turndown)** —
  Markdown round-trips.

Their licences are bundled with the published npm packages and reproduced
in the source distributions of those projects.
