# Avatar

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from 'turkishcoffee'
```

Round user image with a fallback while it loads or when it fails.
Defaults to `size-8`; resize with `className`. For several people, use AvatarGroup.

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
