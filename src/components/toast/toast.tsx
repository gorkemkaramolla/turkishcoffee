"use client";

import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "../../lib/cn";
import { ErrorIcon, InfoIcon, SuccessIcon, XIcon } from "../../lib/icons";

/** Re-exported from sonner: `toast()` plus `toast.success`, `.error`, `.promise`, `.dismiss`. */
export {
    toast,
    useSonner,
    type ExternalToast,
    type ToasterProps,
} from "sonner";

/**
 * Mount once, near the root of the app. Then call `toast()` from anywhere.
 * Renders through a portal, so placement in the tree does not matter.
 *
 * Colors come from the theme tokens, so it follows `.dark` without a `theme` prop.
 * Pass `richColors` to render `toast.success` / `toast.error` in solid token colors.
 *
 * `toast.success`, `toast.error` and `toast.info` carry the library's filled
 * SuccessIcon, ErrorIcon and InfoIcon; `toast.warning` shares ErrorIcon in the
 * warning colour. Override any of them with the `icons` prop (`null` removes one).
 *
 * A plain `toast()` is white on the `--inverse` grey, the same surface Tooltip
 * uses; its action button sits on that grey with a lighter outline.
 *
 * @example
 * // app/layout.tsx
 * <body>
 *   {children}
 *   <Toaster />
 * </body>
 *
 * // anywhere in a client component
 * toast.success('Saved', { description: 'Your changes are live.' })
 */
export function Toaster({
    className,
    style,
    toastOptions,
    icons,
    richColors,
    ...props
}: ToasterProps) {
    // On a rich toast the background already carries the type's colour, so the
    // icon follows the text; on a plain one the icon is what tells the types apart.
    const tone = (color: string) => cn("size-5", !richColors && color);

    return (
        <Sonner
            data-slot="toaster"
            className={cn("toaster group", className)}
            style={
                {
                    "--normal-bg": "var(--inverse)",
                    "--normal-text": "var(--inverse-foreground)",
                    "--normal-border": "var(--border)",
                    "--success-bg": "var(--success)",
                    "--success-text": "var(--success-foreground)",
                    "--success-border": "var(--success)",
                    "--error-bg": "var(--destructive)",
                    "--error-text": "var(--destructive-foreground)",
                    "--error-border": "var(--destructive)",
                    "--warning-bg": "var(--warning)",
                    "--warning-text": "var(--warning-foreground)",
                    "--warning-border": "var(--warning)",
                    "--info-bg": "var(--primary)",
                    "--info-text": "var(--primary-foreground)",
                    "--info-border": "var(--primary)",
                    "--border-radius": "var(--radius)",
                    ...style,
                } as React.CSSProperties
            }
            richColors={richColors}
            icons={{
                success: <SuccessIcon className={tone("text-success")} />,
                error: <ErrorIcon className={tone("text-destructive")} />,
                info: <InfoIcon className={tone("text-primary")} />,
                warning: <ErrorIcon className={tone("text-warning")} />,
                close: <XIcon className="size-3" />,
                ...icons,
            }}
            toastOptions={{
                ...toastOptions,
                classNames: {
                    description: "opacity-90",
                    // sonner sizes the icon box to 16px with an attribute selector; the
                    // filled icons read better at 20px, which needs the important modifier.
                    icon: "!size-5",
                    // sonner paints the action button in the inverse of the toast
                    // (--normal-text behind --normal-bg), so white toast text would
                    // make a white button. Keep it on the inverse grey and set it apart
                    // with a lighter shade of that grey.
                    actionButton:
                        "!bg-inverse !outline-2 !outline-white/20 !text-primary-foreground",
                    ...toastOptions?.classNames,
                },
            }}
            {...props}
        />
    );
}
