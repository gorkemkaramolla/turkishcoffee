# Tabs

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'turkishcoffee'
```

Switches between views in the same place. Uncontrolled with `defaultValue`,
controlled with `value` + `onValueChange(value, eventDetails)`.

## Example

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">…</TabsContent>
  <TabsContent value="password">…</TabsContent>
</Tabs>
```

## Parts

- `TabsList` — The row of TabsTriggers.
- `TabsTrigger` — Selects the TabsContent with the same `value`.
- `TabsContent` — Panel shown while its `value` is selected.
