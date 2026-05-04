---
name: Collaboration Feedback Rules
description: How the user wants Claude to behave in this project
type: feedback
---

**Do not write code unless explicitly asked.** User said "dont write the code please" at the start of the session. The work here is documentation, design specs, and architectural planning — not implementation.

**Why:** User uses separate AI coding sessions to implement. The docs/specs produced here are the input to those coding sessions. Mixing documentation work with actual code implementation creates confusion.

**How to apply:** When fixing docs or creating specs, produce markdown documentation only. If something would naturally involve a code snippet as an example in documentation, that is acceptable (code blocks in .md files). But do not create `.py`, `.tsx`, `.ts`, `.sol` source files unless the user explicitly asks to start coding.

---

**Be thorough when auditing — fix everything found, not just what's asked.** User asked to audit docs for flaws, then was pleased when multiple interconnected issues were caught and fixed (brand name, wrong backend language, broken links, fake stats, wrong test frameworks).

**Why:** The purpose of the audit was to ensure AI coding tools get correct implementations. Leaving any Node.js/Mocha/Chai references in any doc would cause the AI to implement the wrong stack.

**How to apply:** When auditing a set of files, read all of them before declaring done. Cross-check for consistency. Fix all instances of the same error, not just the first one found.
