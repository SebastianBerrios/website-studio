import { cloneElement, isValidElement, type ReactElement } from "react";

/**
 * Label + control + error slot for one brief-form field. Task 6.5.
 *
 * No client directive — this component has no interactivity of its own (no
 * hooks, no event handlers), so it renders identically whether imported
 * into a Server Component tree or, as here, into `components/brief/
 * brief-form.tsx`'s Client Component bundle (the one Client Component this
 * change set permits — design D10). Bundling a few extra bytes of pure
 * markup logic into that one client boundary costs nothing; it does not
 * turn `Field` itself into a client-only module.
 *
 * Owns the `id`/`htmlFor`/`aria-describedby`/`aria-invalid` wiring in one
 * place so `brief-form.tsx` never hand-writes it per field — the exact kind
 * of repeated, easy-to-forget wiring the change set's own hard constraints
 * call out (see the already-fixed nested `<a><button>` defect). `children`
 * must be a single control element (`<input>`/`<select>`/`<textarea>`); it
 * is cloned with the accessibility attributes injected, so a field that
 * forgets `aria-describedby` is structurally impossible rather than merely
 * a review checklist item.
 */
export function Field({
  id,
  label,
  error,
  required = false,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly children: ReactElement;
}) {
  const errorId = `${id}-error`;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-card-foreground">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {control}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
