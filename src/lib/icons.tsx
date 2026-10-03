import type * as React from 'react'

/**
 * Minimal inline icons so the package pins no icon library on consumers.
 * Anything richer should be passed in as a ReactNode prop.
 */
type IconProps = React.ComponentProps<'svg'>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  )
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m18 15-6-6-6 6" />
    </Icon>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  )
}

export function ChevronsUpDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
    </Icon>
  )
}

export function EllipsisIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </Icon>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
  )
}

/**
 * Filled status icons. Drawn on a 36-unit grid with a fill rather than the
 * 24-unit stroke grid above, so they share their own wrapper.
 */
function FilledIcon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

/**
 * Filled circle with an "i". The default icon of `<Alert variant="info">`.
 *
 * @example
 * <Alert icon={<InfoIcon />}>
 *   <AlertTitle>Heads up</AlertTitle>
 * </Alert>
 */
export function InfoIcon(props: IconProps) {
  return (
    <FilledIcon {...props}>
      <path d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2Zm-.3 4.3a2.718 2.718 0 0 1 2.864 2.824 2.664 2.664 0 0 1-2.864 2.863 2.705 2.705 0 0 1-2.864-2.864A2.717 2.717 0 0 1 17.7 6.3ZM22 27a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1v-6h-1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v9h1a1 1 0 0 1 1 1Z" />
    </FilledIcon>
  )
}

/** Filled triangle with an "!". The default icon of `<Alert variant="destructive">`. */
export function ErrorIcon(props: IconProps) {
  return (
    <FilledIcon {...props}>
      <path d="M17.127 2.579.4 32.512A1 1 0 0 0 1.272 34h33.456a1 1 0 0 0 .872-1.488L18.873 2.579a1 1 0 0 0-1.746 0ZM20 29.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5Zm0-6a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5Z" />
    </FilledIcon>
  )
}

/** Filled circle with a check. The default icon of `<Alert variant="success">`. */
export function SuccessIcon(props: IconProps) {
  return (
    <FilledIcon {...props}>
      <path d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2Zm10.666 9.08L16.018 27.341a1.208 1.208 0 0 1-.875.461c-.024.002-.05.002-.073.002a1.2 1.2 0 0 1-.85-.351l-7.784-7.795a1.2 1.2 0 0 1 0-1.698l1.326-1.325a1.201 1.201 0 0 1 1.695 0l5.346 5.347L25.314 8.473A1.203 1.203 0 0 1 27 8.263l1.455 1.133a1.205 1.205 0 0 1 .211 1.684Z" />
    </FilledIcon>
  )
}
