import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react"

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "style"> {
  label?: string
  error?: string
  hint?: string
  /** Optional leading glyph (e.g. a search icon) — purely decorative, aria-hidden. */
  leadingIcon?: ReactNode
  /** Optional trailing slot (e.g. a clear button) — interactive elements inside must handle their own a11y. */
  trailingSlot?: ReactNode
}

/** 50-54px tall, radius 9-11px, subtle border, blue focus ring, red ring + message slot on error. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className = "", leadingIcon, trailingSlot, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-[length:var(--type-label-size)] font-[var(--type-label-weight)] text-[var(--navy-950)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-[52px] w-full border bg-[var(--canvas)] text-[15px] text-[var(--navy-950)] outline-none transition placeholder:text-[var(--text-muted)] focus:ring-2 ${
            leadingIcon ? "pl-11" : "pl-4"
          } ${trailingSlot ? "pr-11" : "pr-4"} ${
            error
              ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/25"
              : "border-[var(--border)] focus:border-[var(--blue-600)] focus:ring-[var(--blue-600)]/25"
          } ${className}`}
          style={{ borderRadius: "var(--radius-input)" }}
          {...props}
        />
        {trailingSlot && <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailingSlot}</span>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-[length:var(--type-label-size)] font-medium text-[var(--error)]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-[length:var(--type-label-size)] text-[var(--text-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
