# Security Policy

Thanks for taking the time to make RK Word Editor more secure. This document
explains how to report a vulnerability, what you can expect from us, and which
versions are currently supported.

## Supported versions

Only the latest **4.x** release line receives security fixes. Older releases
are best-effort — please upgrade before reporting an issue against them.

| Version | Supported          |
| ------- | ------------------ |
| 4.x     | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security reports.** Public
issues let an attacker weaponise the bug before users have had a chance to
upgrade.

You have two private channels:

1. **GitHub private vulnerability reports (preferred).** From the repo's
   [Security tab](https://github.com/raazkhnl/rk-word-editor/security)
   click **Report a vulnerability**. This goes straight to the maintainer
   and is the fastest path.
2. **Email.** Send the details to **raazkhnl@gmail.com**. Use the subject
   line `[rk-word-editor] security` so it isn't lost.

In your report, please include:

- The affected package(s) and version(s) (e.g. `@raazkhnl/rk-editor-core@4.6.0`).
- A clear description of the issue and its impact.
- Reproduction steps, ideally a minimal code sample or a hosted demo.
- The browser / runtime / OS where you observed the issue.
- Any mitigations or workarounds you've already identified.

If you'd like to share files that don't fit in an email, attach them as a
zip — please don't paste large binary payloads inline.

## What you can expect

| Stage                        | Target SLA                  |
| ---------------------------- | --------------------------- |
| Acknowledgement of receipt   | within **48 hours**         |
| Initial severity assessment  | within **5 business days**  |
| Fix released (high severity) | within **14 days**          |
| Fix released (low/medium)    | within the next minor cycle |

You'll be kept in the loop while we triage and patch. With your permission,
we'll credit you in the release notes (CHANGELOG and the GitHub Security
Advisory) once the fix ships. If you'd rather stay anonymous, just say so.

## Scope

In scope:

- Cross-site scripting through the editor (paste, link insertion, slash
  commands, find &amp; replace, content import, content export).
- Prototype pollution / arbitrary-property-set issues in the public APIs.
- HTML/Markdown/DOCX import or export round-trips that lead to code
  execution or data exfiltration.
- Issues in any package shipped to npm: `@raazkhnl/rk-editor-core`,
  `@raazkhnl/rk-editor-ui`, `@raazkhnl/rk-editor-cli`.

Out of scope:

- Bugs that require an attacker to already control the host page (a
  malicious page can always replace the editor with their own JS).
- Findings against the `apps/demo` deployment that are clearly upstream
  Tiptap / ProseMirror issues — please report those to the relevant
  upstream project; we'll happily co-coordinate.
- "Best-practice" deviations with no demonstrable security impact (e.g.
  a missing `Content-Security-Policy` on the static demo).

## Coordinated disclosure

If you've already disclosed (or plan to disclose) the issue to a third-party
security database (CVE, Snyk, OSV, GitHub Advisories), please mention this
in your report so we can coordinate timing and CVE assignment.

---

Maintained by **[RaaZ Khanal](https://github.com/raazkhnl)** — thanks for
helping keep the project safe.
