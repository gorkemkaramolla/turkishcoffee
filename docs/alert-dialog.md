# AlertDialog

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from 'turkishcoffee'
```

Modal that interrupts the user to confirm a consequential action. Unlike
Dialog it does not close on outside click; the user must pick Action or Cancel.
AlertDialogTitle is required for accessibility.

## Example

```tsx
<AlertDialog>
  <AlertDialogTrigger render={<Button variant="destructive" />}>Delete project</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete this project?</AlertDialogTitle>
      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} onClick={remove}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Parts

- `AlertDialogTrigger` — Opens the AlertDialog. Pass `render={<Button />}` to make your own Button the trigger.
- `AlertDialogPortal` — Portal used by AlertDialogContent. Rarely needed directly.
- `AlertDialogOverlay` — Backdrop behind the AlertDialog. Already rendered by AlertDialogContent.
- `AlertDialogContent` — The dialog panel. Renders its own portal and overlay.
- `AlertDialogHeader` — Stacks AlertDialogTitle and AlertDialogDescription.
- `AlertDialogFooter` — Holds AlertDialogCancel and AlertDialogAction; stacks on mobile, right-aligns from `sm`.
- `AlertDialogTitle` — Required: names the dialog for screen readers.
- `AlertDialogDescription` — Explains the consequence of the action.
- `AlertDialogAction` — The confirming button; closes the dialog after its `onClick`. Styled as a default Button. Action and Cancel are pre-styled with buttonVariants: an alert dialog is a decision, so the two choices should never drift apart visually. For a destructive action pass `className={buttonVariants({ variant: 'destructive' })}`.
- `AlertDialogCancel` — The dismissing button; closes the dialog. Styled as an outline Button.
