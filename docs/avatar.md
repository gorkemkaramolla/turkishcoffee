# Avatar

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from 'turkishcoffee'
```

Round user image with a fallback while it loads or when it fails.
Defaults to `size-8`; resize with `className`.

## Example

```tsx
<Avatar>
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback>GK</AvatarFallback>
</Avatar>
```

## Parts

- `AvatarImage` — The image; hidden until it has loaded.
- `AvatarFallback` — Shown while AvatarImage loads or when it fails — usually initials.
