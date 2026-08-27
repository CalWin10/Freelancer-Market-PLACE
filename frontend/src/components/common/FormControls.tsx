import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { classNames } from "../../utils/classNames";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  hideLabel = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={classNames("form-field", error && "form-field--invalid", className)}>
      {label && (
        <label className={classNames("form-field__label", hideLabel && "sr-only")} htmlFor={htmlFor}>
          {label}
          {required && <span className="form-field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="form-field__hint" id={htmlFor ? `${htmlFor}-hint` : undefined}>{hint}</p>}
      {error && <p className="form-field__error" id={htmlFor ? `${htmlFor}-error` : undefined} role="alert">{error}</p>}
    </div>
  );
}

interface SharedControlProps {
  label?: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  fieldClassName?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, SharedControlProps {
  leadingIcon?: ReactNode;
  trailingElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    error,
    hint,
    hideLabel,
    fieldClassName,
    leadingIcon,
    trailingElement,
    className,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? `input-${generatedId}`;
  const descriptionId = error ? `${controlId}-error` : hint ? `${controlId}-hint` : undefined;

  return (
    <FormField
      label={label}
      htmlFor={controlId}
      error={error}
      hint={hint}
      required={required}
      hideLabel={hideLabel}
      className={fieldClassName}
    >
      <div className={classNames("control-wrap", Boolean(leadingIcon) && "control-wrap--leading", Boolean(trailingElement) && "control-wrap--trailing")}>
        {leadingIcon && <span className="control-wrap__leading" aria-hidden="true">{leadingIcon}</span>}
        <input
          {...props}
          ref={ref}
          id={controlId}
          required={required}
          className={classNames("form-control", error && "form-control--invalid", className)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={descriptionId}
        />
        {trailingElement && <span className="control-wrap__trailing">{trailingElement}</span>}
      </div>
    </FormField>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, SharedControlProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, label, error, hint, hideLabel, fieldClassName, className, required, children, ...props },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? `select-${generatedId}`;
  const descriptionId = error ? `${controlId}-error` : hint ? `${controlId}-hint` : undefined;

  return (
    <FormField label={label} htmlFor={controlId} error={error} hint={hint} required={required} hideLabel={hideLabel} className={fieldClassName}>
      <div className="select-wrap">
        <select
          {...props}
          ref={ref}
          id={controlId}
          required={required}
          className={classNames("form-control", "form-select", error && "form-control--invalid", className)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={descriptionId}
        >
          {children}
        </select>
      </div>
    </FormField>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, SharedControlProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, error, hint, hideLabel, fieldClassName, className, required, ...props },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? `textarea-${generatedId}`;
  const descriptionId = error ? `${controlId}-error` : hint ? `${controlId}-hint` : undefined;

  return (
    <FormField label={label} htmlFor={controlId} error={error} hint={hint} required={required} hideLabel={hideLabel} className={fieldClassName}>
      <textarea
        {...props}
        ref={ref}
        id={controlId}
        required={required}
        className={classNames("form-control", "form-textarea", error && "form-control--invalid", className)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={descriptionId}
      />
    </FormField>
  );
});
