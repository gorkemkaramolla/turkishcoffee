---
"turkishcoffee": minor
---

Ship docs for AI agents inside the package: `AGENTS.md` (setup, import map,
differences from shadcn/ui, rules), `docs/<component>.md` for every component,
and `llms.txt` / `llms-full.txt`. Every export now carries JSDoc with an
example, so hover and go-to-definition explain the API.

Point your agent at it with one line in your project's `CLAUDE.md` or `AGENTS.md`:
`UI: use turkishcoffee — read node_modules/turkishcoffee/AGENTS.md before writing components.`
