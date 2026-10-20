import React, { useId } from 'react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  /** Recebe o id gerado e os ids de descrição para ligar o controle ao rótulo e às mensagens. */
  children: (props: { id: string; 'aria-describedby'?: string; invalid: boolean }) => React.ReactNode;
}

/** Rótulo + controle + dica/erro, com associação acessível entre eles. */
export const FormField: React.FC<FormFieldProps> = ({ label, hint, error, required, className, children }) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-action" aria-hidden>*</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-bold text-warning">
          {error}
        </p>
      )}
    </div>
  );
};

FormField.displayName = 'FormField';
