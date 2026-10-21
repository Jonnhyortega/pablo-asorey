import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type FieldExtras = { label?: string; error?: string };

const control =
  "w-full bg-surface border border-line rounded-panel px-3.5 text-sm text-text placeholder:text-muted/70 transition-colors focus:outline-none focus:border-gold disabled:opacity-50";

function Wrapper({ id, label, error, children }: FieldExtras & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {label && (
        <label htmlFor={id} className="text-[11px] uppercase tracking-[0.2em] text-muted">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & FieldExtras>(
  function Input({ label, error, className, id, ...props }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Wrapper id={fieldId} label={label} error={error}>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(control, "h-11", error && "border-danger", className)}
          {...props}
        />
      </Wrapper>
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & FieldExtras>(
  function Select({ label, error, className, id, children, ...props }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Wrapper id={fieldId} label={label} error={error}>
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          className={cn(control, "h-11 pr-8", error && "border-danger", className)}
          {...props}
        >
          {children}
        </select>
      </Wrapper>
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldExtras>(
  function Textarea({ label, error, className, id, ...props }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Wrapper id={fieldId} label={label} error={error}>
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(control, "py-3 min-h-28 resize-y", error && "border-danger", className)}
          {...props}
        />
      </Wrapper>
    );
  }
);
