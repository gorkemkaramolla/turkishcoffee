# AlertDialog

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from 'turkishcoffee'
```

Modal that interrupts the user to confirm a consequential action. Unlike
Dialog it does not close on outside click; the user must pick Action or Cancel.
AlertDialogTitle is required for accessibility.

## Example

```tsx
<AlertDialog>
  <AlertDialogTrigger render={<Button variant="secondary" />}>Delete project</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete this project?</AlertDialogTitle>
      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={remove}>Delete project</AlertDialogAction>
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
- `AlertDialogAction` — The confirming button; closes the dialog after its `onClick`. Styled as a primary Button. Action and Cancel are pre-styled with buttonVariants: an alert dialog is a decision, so the two choices should never drift apart visually. A destructive action stays primary; its label names the consequence ("Delete project", not "OK").
- `AlertDialogCancel` — The dismissing button; closes the dialog. Styled as a secondary Button.
