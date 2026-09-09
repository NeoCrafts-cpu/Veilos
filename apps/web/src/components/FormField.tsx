import type { InputHTMLAttributes, ReactNode } from "react";

export function FormField({
  id,
  label,
  hint,
  error,
  children,
  ...input
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children ?? (
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          {...input}
        />
      )}
      {hint ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
