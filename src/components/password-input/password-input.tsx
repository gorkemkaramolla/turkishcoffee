'use client'

import * as React from 'react'
import { cn } from '../../lib/cn'
import { inLanguage } from '../../lib/i18n'
import { EyeIcon, EyeOffIcon } from '../../lib/icons'
import { MESSAGES } from '../../lib/messages'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../input-group/input-group'
import { useLocale } from '../locale-provider/locale-provider'

export type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  /** The reveal button's name. Defaults to "Show password" in the page's language (see LocaleProvider). */
  showLabel?: string
  /** Classes on the bordered field around the input. `className` styles the input. */
  groupClassName?: string
}

/**
 * A password field with a button that shows what was typed. The button is a
 * toggle (`aria-pressed`) with one name, so a screen reader hears "Show
 * password, pressed" rather than a label that flips under the cursor. Every
 * other prop goes to the `<input>`, so it works as a `FormControl` child and
 * with `autoComplete="current-password"` / `"new-password"`.
 *
 * @example
 * <Label htmlFor="password">Password</Label>
 * <PasswordInput id="password" name="password" autoComplete="current-password" required />
 */
export function PasswordInput({ className, groupClassName, showLabel, disabled, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)
  const locale = useLocale()
  return (
    <InputGroup data-slot="password-input" className={groupClassName}>
      <InputGroupInput type={visible ? 'text' : 'password'} disabled={disabled} className={className} {...props} />
      <InputGroupAddon align="end" className="pr-0.5">
        <InputGroupButton
          size="icon-sm"
          aria-label={showLabel ?? inLanguage(MESSAGES.showPassword, locale)}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((shown) => !shown)}
          className={cn(visible && 'text-foreground')}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
