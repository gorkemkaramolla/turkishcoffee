import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { ErrorIcon, InfoIcon, SuccessIcon } from "../../lib/icons";

/** Alert classes as a function, for building alert-like elements. */
export const alertVariants = cva(
    [
        "relative grid w-full gap-y-1 rounded-lg border px-4 py-3 text-sm",
        "has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3",
        "[&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:row-span-2 [&>svg]:text-current",
    ],
    {
        variants: {
            tone: {
                neutral: "border-border bg-card text-card-foreground",
                info: "border-primary/50 bg-card text-primary-text",
                success: "border-success/50 bg-card text-success-text",
                warning: "border-warning/50 bg-card text-warning-text",
                danger: "border-danger/50 bg-card text-danger-text",
            },
        },
        defaultVariants: {
            tone: "neutral",
        },
    },
);

export type AlertProps = React.ComponentProps<"div"> &
    VariantProps<typeof alertVariants> & {
        /**
         * Icon in its own column before the text. Every tone but `neutral`
         * brings one (InfoIcon, SuccessIcon, ErrorIcon for warning and danger);
         * pass your own node to replace it, or `null` to drop it.
         */
        icon?: React.ReactNode;
    };

const defaultIcons: Partial<
    Record<NonNullable<AlertProps["tone"]>, React.ReactNode>
> = {
    info: <InfoIcon className="!size-5.5" />,
    success: <SuccessIcon className="!size-5.5" />,
    warning: <ErrorIcon className="!size-5.5" />,
    danger: <ErrorIcon className="!size-5.5" />,
};

/**
 * Inline, non-dismissable message inside the page flow (`role="alert"`).
 * `tone`: `neutral` (default) | `info` | `success` | `warning` | `danger`. Pass
 * an `icon` (or put an svg as the first child) and it gets its own column;
 * every tone but `neutral` brings its own. For a transient message use
 * `toast()`; for a blocking question use AlertDialog.
 *
 * @example
 * <Alert tone="warning">
 *   <AlertTitle>Trial ends soon</AlertTitle>
 *   <AlertDescription>Add a payment method to keep your projects.</AlertDescription>
 * </Alert>
 *
 * <Alert tone="info">
 *   <AlertTitle>Leave requests close on Friday</AlertTitle>
 * </Alert>
 */
export function Alert({
    className,
    tone,
    icon,
    children,
    ...props
}: AlertProps) {
    const shown =
        icon === undefined ? defaultIcons[tone ?? "neutral"] : icon;

    return (
        <div
            data-slot="alert"
            role="alert"
            className={cn(alertVariants({ tone }), className)}
            {...props}
        >
            {shown}
            {children}
        </div>
    );
}

/** Heading line of an Alert. */
export function AlertTitle({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="alert-title"
            className={cn("col-start-2 font-medium tracking-tight", className)}
            {...props}
        />
    );
}

/**
 * Body text of an Alert. Inherits the tone's colour at 80% rather than
 * always going muted, so a danger alert stays readable as one block of colour.
 */
export function AlertDescription({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                "col-start-2 text-sm text-current/80 [&_p]:leading-relaxed",
                className,
            )}
            {...props}
        />
    );
}
