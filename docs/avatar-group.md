# AvatarGroup

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { AvatarGroup, AvatarGroupItem } from 'turkishcoffee'
```

A stack of overlapping avatars for the people on a record. It spreads apart
on hover and keyboard focus. Shows `max` avatars (4 by default); the rest
collapse into a `+N` button that lists them by name. Children must be
AvatarGroupItems, passed directly (an array from `.map()` is fine). Give the
group an `aria-label` saying who they are.

## Example

```tsx
<AvatarGroup aria-label="Reviewers">
  {reviewers.map((r) => (
    <AvatarGroupItem key={r.id} name={r.name} src={r.avatarUrl} />
  ))}
</AvatarGroup>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `AvatarGroup`

- `max?: number` — How many avatars show before the rest collapse into `+N`.
- `size?: Size` — `sm` 28px · `md` 32px · `lg` 36px.
- `overflowLabel?: (count: number) => string` — Accessible name of the `+N` button.

### `AvatarGroupItem`

- `name: string` — The person's full name.
- `src?: string` — Image URL; initials show without one.
- `initials?: string` — Overrides the initials taken from `name`.
- `render?: React.ReactElement` — An element to render the avatar as, usually a link to the person.

## Parts

- `AvatarGroupItem` — One person in an AvatarGroup: their image, or their initials while it loads or when there is none. `name` is what screen readers announce, what the hover tooltip and the overflow list show. Pass `render` to make the avatar a link, e.g. to a profile: `render={<Link href="/people/42" />}`.
