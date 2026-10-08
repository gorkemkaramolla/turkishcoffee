---
"turkishcoffee": major
---

Every component now answers two questions with two props, using the same names everywhere. `tone` says what something means: `neutral` · `info` · `success` · `warning` · `danger`. `variant` says how loud it is. Before, Badge, Alert, Toast and DropdownMenu each had their own names for the same meaning (`destructive`, `error`, `inverse`, `outline`), and Badge mixed meaning and emphasis in one list of seven.

Button drops its `destructive` and `success` variants, so a screen has one coloured action. For a dangerous action keep the button primary, name the consequence in its label and confirm in an AlertDialog. `outline` and the grey `secondary` were the same emphasis, so they merge into one bordered `secondary`.

| Before | After |
|---|---|
| `<Button variant="default">` / `buttonVariants({ variant: 'default' })` | `variant="primary"` (still the default) |
| `<Button variant="outline">` | `variant="secondary"` |
| `<Button variant="secondary">` (grey fill) | `variant="secondary"` (now bordered) |
| `<Button variant="destructive">` / `"success"` | `variant="primary"` |
| `<SplitButton variant="default" \| "outline">` | `"primary"` \| `"secondary"` |
| `<Badge variant="default">` | `<Badge tone="info" variant="solid">` |
| `<Badge variant="secondary">` / `"outline"` | `<Badge>` (`tone="neutral"`, `variant="soft"`) |
| `<Badge variant="inverse">` | `<Badge variant="solid">` |
| `<Badge variant="success" \| "warning" \| "destructive">` | `<Badge tone="success" \| "warning" \| "danger">` (soft); add `variant="solid"` for the old filled look |
| `<Alert variant="default">` | `<Alert>` (`tone="neutral"`) |
| `<Alert variant="info" \| "success" \| "warning" \| "destructive">` | `<Alert tone="info" \| "success" \| "warning" \| "danger">` |
| `<DropdownMenuItem variant="destructive">` | `<DropdownMenuItem tone="danger">` |

Tokens: `--destructive` / `--destructive-foreground` are renamed `--danger` / `--danger-foreground` (`bg-destructive` → `bg-danger`). Each tone gains a soft tint and a readable text colour: `--primary-soft`, `--danger-soft`, `--danger-text`, `--success-soft`, `--success-text`, `--warning-soft`, `--warning-text`. The `-text` colours are at least 4.5:1 on the page and on their tint, so a warning Alert now colours its text and gets a default icon like the other status tones.
