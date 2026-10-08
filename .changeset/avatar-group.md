---
"turkishcoffee": minor
---

AvatarGroup: overlapping avatars that spread on hover and keyboard focus. Past `max` (4) the rest collapse into a `+N` button that lists them by name. Each AvatarGroupItem takes a `name`, which screen readers announce and which supplies the initials.

The avatar under the pointer or keyboard focus grows above its neighbours and shows the person's name in a tooltip. Pass `render={<Link href="…" />}` to AvatarGroupItem to make it a profile link, in the stack and in the `+N` list.
