import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { controlClasses } from '../TextInput/TextInput';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  invalid?: boolean;
}

/** Select nativo estilizado (acessível em teclado e leitores de tela, sem dependências de UI). */
export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ options, invalid, className, ...rest }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          controlClasses,
          'appearance-none pr-10',
          invalid ? 'border-warning' : 'border-input hover:border-primary/40',
          className,
        )}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  ),
);

SelectInput.displayName = 'SelectInput';
