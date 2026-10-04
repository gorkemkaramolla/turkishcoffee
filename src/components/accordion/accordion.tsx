"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cn, cnState } from "../../lib/cn";
import { ChevronDownIcon } from "../../lib/icons";

/**
 * Vertically stacked sections. One opens at a time and can be closed again;
 * pass `multiple` to let several stay open. `value` / `defaultValue` are always
 * arrays of item values. For a single show/hide region use Collapsible.
 *
 * @example
 * <Accordion defaultValue={['shipping']}>
 *   <AccordionItem value="shipping">
 *     <AccordionTrigger>Shipping</AccordionTrigger>
 *     <AccordionContent>Ships in 2–3 days.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
export const Accordion = AccordionPrimitive.Root;

/** One section of an Accordion. `value` must be unique within the Accordion. */
export function AccordionItem({
    className,
    ...props
}: AccordionPrimitive.Item.Props) {
    return (
        <AccordionPrimitive.Item
            data-slot="accordion-item"
            className={cnState(
                "border-b border-border last:border-b-0  first:[&>h3]:rounded-t-sm ",
                className,
            )}
            {...props}
        />
    );
}

/** The clickable heading of an AccordionItem; renders its own chevron. */
export function AccordionTrigger({
    className,
    children,
    ...props
}: AccordionPrimitive.Trigger.Props) {
    return (
        <AccordionPrimitive.Header
            className="
          flex
          focus-within:ring-2
          focus-within:ring-primary/50
          data-open:bg-primary/5
          outline-1  outline-secondary"
        >
            <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className={cnState(
                    "flex flex-1 items-start justify-between gap-4 text-left text-sm font-medium outline-none",
                    "hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 px-4 py-2",
                    "data-disabled:pointer-events-none data-disabled:opacity-50",
                    "[&[data-panel-open]>svg]:rotate-180",
                    className,
                )}
                {...props}
            >
                {children}
                <ChevronDownIcon className="pointer-events-none size-6 shrink-0 text-muted-foreground " />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

/**
 * The collapsible body of an AccordionItem. `className` lands on an inner
 * padding wrapper, not on the animated element, so the height animation stays intact.
 */
export function AccordionContent({
    className,
    children,
    ...props
}: Omit<AccordionPrimitive.Panel.Props, "className"> & { className?: string }) {
    return (
        <AccordionPrimitive.Panel
            data-slot="accordion-content"
            className={cn(
                "overflow-hidden text-sm",
                // Base UI measures the panel into --accordion-panel-height. No
                // padding here: it would stop the height transition short of 0.
                "h-(--accordion-panel-height) transition-[height] duration-50 ease-out data-ending-style:ease-in data-starting-style:h-0 data-ending-style:h-0",
            )}
            {...props}
        >
            <div className={cn("px-4 pt-2 pb-6", className)}>{children}</div>
        </AccordionPrimitive.Panel>
    );
}
