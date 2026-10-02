# Tabs

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'turkishcoffee'
```

Switches between views in the same place. Uncontrolled with `defaultValue`,
controlled with `value` + `onValueChange`.

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
