'use client'

import { useId } from 'react'
import type * as React from 'react'
import { InfoCircleIcon, InfoIcon } from '../../lib/icons'
import { Label } from '../label/label'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'
import { inLanguage } from '../../lib/i18n'
import { MESSAGES } from '../../lib/messages'
import { useLocale } from '../locale-provider/locale-provider'

export type InfoLabelProps = React.ComponentProps<typeof Label> & {
  /** The explanation behind the info button: what the field is for, its format, where the value goes. */
  info: React.ReactNode
  /** The info button's accessible name; screen readers read it before the label text. */
  infoLabel?: string
}

/**
 * A Label with an info button beside it that opens a short explanation. The
 * explanation opens on click, tap and Enter, so unlike a Tooltip it reaches
 * touch and keyboard users and may hold a link. While it is open the button's
 * icon fills in primary.
 * Every prop except `info` and `infoLabel` goes to the Label. Inside a
 * `turkishcoffee/form` field pass `info` to FormLabel instead.
 *
 * @example
 * <InfoLabel htmlFor="iban" info="Salaries are paid into this account.">IBAN</InfoLabel>
 * <Input id="iban" />
 */
export function InfoLabel({ info, infoLabel, id, ...props }: InfoLabelProps) {
  const locale = useLocale()
  const generatedId = useId()
  const labelId = id ?? generatedId
  const buttonId = useId()

  return (
    <div data-slot="info-label" className="flex items-center gap-1">
      <Label id={labelId} {...props} />
      <Popover>
        <PopoverTrigger
          id={buttonId}
          aria-label={infoLabel ?? inLanguage(MESSAGES.moreInformation, locale)}
          // Reads as "More information, IBAN", so each button is distinct in a list of controls.
          aria-labelledby={`${buttonId} ${labelId}`}
          // Pressed and open, the icon fills in primary, so it shows the explanation is open.
          className="group/info inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:text-primary-text data-popup-open:text-primary-text"
        >
          <InfoCircleIcon className="size-3.5 group-active/info:hidden group-data-popup-open/info:hidden" />
          <InfoIcon className="hidden size-3.5 group-active/info:block group-data-popup-open/info:block" />
        </PopoverTrigger>
        <PopoverContent side="top" className="w-auto max-w-64 px-3 py-2 text-xs">
          {info}
        </PopoverContent>
      </Popover>
    </div>
  )
}
