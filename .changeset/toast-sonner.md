---
'turkishcoffee': major
---

Toast is now built on [sonner](https://sonner.emilkowal.ski). `Toaster` wraps sonner's `Toaster` with theme tokens, and `toast` is sonner's API: `toast('Saved', { description })`, `toast.success(...)`, `toast.error(...)`, `toast.dismiss(id)`.

Removed: `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `dismissToast`, `useToasts`, and the `ToastProps` / `ToastOptions` / `ToastRecord` / `ToastVariant` types. Migrate `toast({ title, description })` to `toast(title, { description })` and `dismissToast(id)` to `toast.dismiss(id)`. Pass `richColors` to `<Toaster />` for solid success/error colors like the old variants.
