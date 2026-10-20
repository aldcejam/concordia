import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const controlClasses =
  'h-12 w-full rounded-xl border bg-card px-4 text-base font-semibold sm:text-sm text-foreground shadow-sm transition-colors duration-fast placeholder:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Campo de texto base com área de toque de 48px e foco visível. */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ invalid, className, ...rest }, ref) => (
  <input
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(controlClasses, invalid ? 'border-warning' : 'border-input hover:border-primary/40', className)}
    {...rest}
  />
));

TextInput.displayName = 'TextInput';
