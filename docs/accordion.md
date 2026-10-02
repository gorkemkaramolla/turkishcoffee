# Accordion

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from 'turkishcoffee'
```

Vertically stacked sections that expand one (`type="single"`) or several
(`type="multiple"`) at a time. For a single show/hide region use Collapsible.

## Example

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="shipping">
    <AccordionTrigger>Shipping</AccordionTrigger>
    <AccordionContent>Ships in 2–3 days.</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Parts

- `AccordionItem` — One section of an Accordion. `value` must be unique within the Accordion.
- `AccordionTrigger` — The clickable heading of an AccordionItem; renders its own chevron.
- `AccordionContent` — The collapsible body of an AccordionItem. `className` lands on an inner padding wrapper, not on the animated element, so the height animation stays intact.
