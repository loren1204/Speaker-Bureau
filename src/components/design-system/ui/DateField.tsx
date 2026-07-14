import { forwardRef, useId, type InputHTMLAttributes } from "react"
import { Calendar } from "lucide-react"

export interface DateFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "type"> {
  label?: string
  error?: string
  hint?: string
}

/** Same input shell, type="date", with a leading calendar glyph. */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField(
  { label, error, hint, id, className = "", ...props },
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
        <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
        <input
          ref={ref}
          id={inputId}
          type="date"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-[52px] w-full border bg-[var(--canvas)] pl-11 pr-4 text-[15px] text-[var(--navy-950)] outline-none transition focus:ring-2 ${
            error
              ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/25"
              : "border-[var(--border)] focus:border-[var(--blue-600)] focus:ring-[var(--blue-600)]/25"
          } ${className}`}
          style={{ borderRadius: "var(--radius-input)" }}
          {...props}
        />
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
