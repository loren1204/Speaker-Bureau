import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react"
import { ChevronDown } from "lucide-react"

export interface SelectFieldOption {
  label: string
  value: string
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "style" | "children"> {
  label?: string
  error?: string
  hint?: string
  options: SelectFieldOption[]
  placeholder?: string
  children?: ReactNode
}

/** Same shell as Input, with a trailing chevron — native <select> for full accessibility/keyboard support. */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, options, placeholder, id, className = "", children, ...props },
  ref
) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-[length:var(--type-label-size)] font-[var(--type-label-weight)] text-[var(--navy-950)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-[52px] w-full appearance-none border bg-[var(--canvas)] px-4 pr-10 text-[15px] text-[var(--navy-950)] outline-none transition focus:ring-2 ${
            error
              ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/25"
              : "border-[var(--border)] focus:border-[var(--blue-600)] focus:ring-[var(--blue-600)]/25"
          } ${className}`}
          style={{ borderRadius: "var(--radius-input)" }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
      </div>
      {error ? (
        <p id={`${selectId}-error`} role="alert" className="mt-1.5 text-[length:var(--type-label-size)] font-medium text-[var(--error)]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="mt-1.5 text-[length:var(--type-label-size)] text-[var(--text-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
