# Card

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from 'turkishcoffee'
```

Bordered surface that groups related content. Server-renderable by design:
no state, no handlers, no "use client". Compose with the sub-parts rather than
passing title/footer props.

## Example

```tsx
<Card>
  <CardHeader>
    <CardTitle>Team</CardTitle>
    <CardDescription>Invite people to your workspace.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter className="justify-end">
    <Button>Invite</Button>
  </CardFooter>
</Card>
```

## Parts

- `CardHeader` — Top section holding CardTitle and CardDescription.
- `CardTitle` — Card heading; renders an `<h3>`.
- `CardDescription` — Muted text under CardTitle.
- `CardContent` — Main body of the Card.
- `CardFooter` — Bottom row, usually actions. A flex row: align with `justify-*`.
