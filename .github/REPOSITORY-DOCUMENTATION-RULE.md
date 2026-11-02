# Repository Documentation Linking Rule

This repository follows **REPO-DOC-001 — Repository Documentation Linking Standard**.

Canonical rule: [Read the full standard in the central rules repository](https://github.com/1kmsbrass/rules/blob/main/rules/repository-work/knowledge-linking-standard.md).

## Required practice

Before creating or substantially updating a substantive documentation or knowledge file:

1. Search the repository for existing documents covering the same subject, aliases and related concepts.
2. Reuse or update the existing authoritative document when appropriate; do not create duplicate sources of truth.
3. Add a **Related Documents** section containing direct, relative Markdown links to all meaningfully related files, with a short explanation of each relationship.
4. Consider reciprocal links in existing related documents where useful.
5. Verify every relative link and update links when files move or are renamed.

Use standard Markdown links, not Obsidian-only wikilinks as the sole link format. This supports GitHub navigation and Obsidian backlinks/graph views.

Apply this to documentation, specifications, architecture notes, operational instructions, research and project knowledge. Do not add link noise to source code, generated files, raw data rows or every individual content page. Respect existing repository-specific navigation conventions and preserve the current structure.

The goal is discoverable, connected knowledge—not more files or more links for their own sake.
