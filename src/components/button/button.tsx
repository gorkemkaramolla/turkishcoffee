"use client";

import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/** Button classes as a function — style a non-Button element (e.g. a Base UI trigger) like a Button. */
export const buttonVariants = cva(
    [
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none transition-all",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
        // A gap between ring and fill, so a solid ring stays visible on a filled button.
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-invalid:border-danger aria-invalid:ring-danger",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    ],
    {
        variants: {
            variant: {
                primary:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                // On hover the icon turns primary, as a breadcrumb step's does. Pressed,
                // or holding its menu open, the fill deepens and the icon stays primary.
                secondary: [
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:[&_svg]:text-primary-text",
                    "active:bg-selection data-popup-open:bg-selection data-popup-open:text-accent-foreground data-popup-open:[&_svg]:text-primary-text",
                ],
                ghost: [
                    "hover:bg-accent hover:text-accent-foreground hover:[&_svg]:text-primary-text",
                    "active:bg-selection data-popup-open:bg-selection data-popup-open:text-accent-foreground data-popup-open:[&_svg]:text-primary-text",
                ],
                link: "text-primary-text underline-offset-4 hover:underline",
            },
            size: {
                sm: "h-control-sm gap-1.5 px-2.5 text-xs has-[>svg]:px-2",
                md: "h-control px-3 has-[>svg]:px-2.5",
                lg: "h-control-lg px-4 has-[>svg]:px-3",
                icon: "size-control",
                "icon-sm": "size-control-sm",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    },
);

export type ButtonProps = useRender.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants>;

/**
 * A button. Variants rank emphasis, not meaning: `primary` (default; one per
 * screen), `secondary` (bordered, for every other action), `ghost` (toolbars
 * and icon buttons) and `link` (inline in text). There is no coloured tone:
 * for a dangerous action say the consequence in the label ("Delete
 * employee") and confirm it in an AlertDialog. Sizes: `sm` (32px) | `md` (36px, default) |
 * `lg` (40px) | `icon` (36px square) | `icon-sm` (32px square, e.g. in a
 * `size="sm"` DataTable row) — from the `--spacing-control*` tokens; there is no
 * `size="default"`. Pass `render` to style another element, such
 * as your router's link, as a button. Client component.
 *
 * @example
 * <Button variant="secondary" size="sm">Export</Button>
 *
 * <Button render={<Link href="/settings" />} variant="ghost">
 *   Settings
 * </Button>
 */
export function Button({
    className,
    variant,
    size,
    render,
    ref,
    ...props
}: ButtonProps) {
    // cn() runs here rather than through useRender's prop merge, which joins
    // class strings without resolving Tailwind conflicts.
    return useRender({
        defaultTagName: "button",
        render,
        ref,
        props: {
            "data-slot": "button",
            className: cn(buttonVariants({ variant, size }), className),
            ...props,
        },
    });
}
