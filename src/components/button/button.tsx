"use client";

import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/** Button classes as a function — style a non-Button element (e.g. a Base UI trigger) like a Button. */
export const buttonVariants = cva(
    [
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none transition-all",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    ],
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20",
                success:
                    "bg-success text-success-foreground shadow-xs hover:bg-success/90",
                outline:
                    "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
                md: "h-9 px-4 py-2 has-[>svg]:px-3",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    },
);

export type ButtonProps = useRender.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants>;

/**
 * A button. Variants: `default` | `secondary` | `destructive` | `success` |
 * `outline` | `ghost` | `link`. Sizes: `sm` | `md` (default) | `lg` | `icon` —
 * there is no `size="default"`. Pass `render` to style another element, such
 * as your router's link, as a button. Client component.
 *
 * @example
 * <Button variant="destructive" size="sm">Delete</Button>
 *
 * <Button render={<Link href="/settings" />} variant="outline">
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
