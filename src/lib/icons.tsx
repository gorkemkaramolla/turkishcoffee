import type * as React from 'react'

/**
 * Minimal inline icons so the package pins no icon library on consumers.
 * Anything richer should be passed in as a ReactNode prop.
 *
 * Icons marked "Tabler Icons" are copied from https://tabler.io/icons (MIT);
 * see THIRD_PARTY_LICENSES.md.
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

/** Tabler Icons `x` (MIT). */
export function XIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </Icon>
  )
}

/** Tabler Icons `check` (MIT). */
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12l5 5l10 -10" />
    </Icon>
  )
}

/** Tabler Icons `chevron-down` (MIT). */
export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6l6 -6" />
    </Icon>
  )
}

/** Tabler Icons `chevron-up` (MIT). */
export function ChevronUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 15l6 -6l6 6" />
    </Icon>
  )
}

/** Tabler Icons `chevron-right` (MIT). */
export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6l6 6l-6 6" />
    </Icon>
  )
}

/** Tabler Icons `chevron-left` (MIT). */
export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 6l-6 6l6 6" />
    </Icon>
  )
}

/** Tabler Icons `selector` (MIT). */
export function ChevronsUpDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 9l4 -4l4 4" />
      <path d="M16 15l-4 4l-4 -4" />
    </Icon>
  )
}

/** Tabler Icons `dots` (MIT). */
export function EllipsisIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    </Icon>
  )
}

/** Tabler Icons `calendar` (MIT). */
export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M4 11h16" />
      <path d="M11 15h1" />
      <path d="M12 15v3" />
    </Icon>
  )
}

/** One person, for a single employee's details. Tabler Icons `user` (MIT). */
export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
      <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    </Icon>
  )
}

/** Folder with a person, for a personnel file. Tabler Icons `folder-user` (MIT). */
export function FolderUserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12.75 19h-7.75a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2.5" />
      <path d="M17 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M22 22a2 2 0 0 0 -2 -2h-2a2 2 0 0 0 -2 2" />
    </Icon>
  )
}

/** Two people, for staff/team/member lists. Tabler Icons `users` (MIT). */
export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
      <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
    </Icon>
  )
}

/**
 * Filled status icons: a fill rather than a stroke, so they share their own
 * wrapper. Drawn on a 36-unit grid; a Tabler icon passes `viewBox="0 0 24 24"`.
 */
function FilledIcon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

/**
 * Filled circle with an "i". The default icon of `<Alert tone="info">`.
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

/** Tabler Icons `plus` (MIT). */
export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </Icon>
  )
}

/** Tabler Icons `mail` (MIT). */
export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
      <path d="M3 7l9 6l9 -6" />
    </Icon>
  )
}

/** Tabler Icons `trash` (MIT). */
export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7l16 0" />
      <path d="M10 11l0 6" />
      <path d="M14 11l0 6" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    </Icon>
  )
}

/** Tabler Icons `info-circle` (MIT). The outline "i" of InfoLabel's button. */
export function InfoCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
      <path d="M12 9h.01" />
      <path d="M11 12h1v4h1" />
    </Icon>
  )
}

/** Filled triangle with an "!". The default icon of a `warning` or `danger` Alert. */
export function ErrorIcon(props: IconProps) {
  return (
    <FilledIcon {...props}>
      <path d="M17.127 2.579.4 32.512A1 1 0 0 0 1.272 34h33.456a1 1 0 0 0 .872-1.488L18.873 2.579a1 1 0 0 0-1.746 0ZM20 29.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5Zm0-6a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5Z" />
    </FilledIcon>
  )
}

/**
 * Filled circle with a check. The default icon of `<Alert tone="success">`.
 * Tabler Icons `circle-check-filled` (MIT), on Tabler's 24-unit grid.
 */
export function SuccessIcon(props: IconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" {...props}>
      <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
    </FilledIcon>
  )
}

/** Tabler Icons `arrow-up` (MIT). DataTable's ascending sort indicator. */
export function ArrowUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5l0 14" />
      <path d="M18 11l-6 -6" />
      <path d="M6 11l6 -6" />
    </Icon>
  )
}

/** Tabler Icons `arrow-down` (MIT). DataTable's descending sort indicator. */
export function ArrowDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5l0 14" />
      <path d="M18 13l-6 6" />
      <path d="M6 13l6 6" />
    </Icon>
  )
}

/** Tabler Icons `columns-3` (MIT). DataTable's column chooser. */
export function ColumnsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 3m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1zm6 -1v18m6 -18v18" />
    </Icon>
  )
}

/** Tabler Icons `arrow-autofit-width` (MIT). Fit a column to its content. */
export function AutofitWidthIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12v-6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6" />
      <path d="M10 18h-7" />
      <path d="M21 18h-7" />
      <path d="M6 15l-3 3l3 3" />
      <path d="M18 15l3 3l-3 3" />
    </Icon>
  )
}

/** Tabler Icons `eye-off` (MIT). */
export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
      <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
      <path d="M3 3l18 18" />
    </Icon>
  )
}

/** Tabler Icons `rotate` (MIT). Reset to defaults. */
export function RotateIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />
    </Icon>
  )
}

/** Tabler Icons `filter` (MIT). A column filter; add `fill-current` for an active one. */
export function FilterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" />
    </Icon>
  )
}

/** Tabler Icons `chevron-left-pipe` (MIT). First page. */
export function ChevronLeftPipeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 6v12" />
      <path d="M18 6l-6 6l6 6" />
    </Icon>
  )
}

/** Tabler Icons `chevron-right-pipe` (MIT). Last page. */
export function ChevronRightPipeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l6 6l-6 6" />
      <path d="M17 5v13" />
    </Icon>
  )
}

/** Tabler Icons `download` (MIT). */
export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
      <path d="M7 11l5 5l5 -5" />
      <path d="M12 4l0 12" />
    </Icon>
  )
}
