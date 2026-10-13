import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type TactileButtonVariant =
  | 'default'
  | 'primary'
  | 'tactile'
  | 'terracotta'
  | 'action'
  | 'outline'
  | 'destructive'
  | 'secondary'
  | 'ghost'
  | 'warning'
  | 'gold';
export type TactileButtonSize = 'default' | 'sm' | 'md' | 'lg' | 'icon';

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TactileButtonVariant;
  size?: TactileButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<TactileButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  primary:
    'border border-primary-deep bg-primary text-primary-foreground shadow-tactile hover:-translate-y-0.5 hover:bg-primary-soft active:translate-y-1 active:shadow-none',
  tactile:
    'border border-primary-deep bg-primary text-primary-foreground shadow-tactile hover:-translate-y-0.5 hover:bg-primary-soft active:translate-y-1 active:shadow-none',
  terracotta:
    'border border-action-deep bg-action text-action-foreground shadow-action hover:-translate-y-0.5 hover:bg-action-soft active:translate-y-1 active:shadow-none',
  action:
    'border border-action-deep bg-action text-action-foreground shadow-action hover:-translate-y-0.5 hover:bg-action-soft active:translate-y-1 active:shadow-none',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline:
    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:translate-y-0.5',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
  ghost: 'bg-transparent hover:bg-muted hover:text-accent-foreground',
  warning:
    'bg-warning text-white shadow-tactile hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-1 active:shadow-none',
  gold:
    'bg-gold text-foreground shadow-gold font-bold hover:-translate-y-0.5 hover:bg-amber-400 active:translate-y-1 active:shadow-none',
};

const SIZE_CLASSES: Record<TactileButtonSize, string> = {
  default: 'h-9 px-4 py-2 text-sm font-medium rounded-md',
  sm: 'h-8 px-2.5 py-1 text-xs rounded-md',
  md: 'h-9 px-4 py-2 text-sm font-medium rounded-md',
  lg: 'h-10 px-6 py-3 text-base font-bold rounded-md',
  icon: 'size-10 sm:size-12 p-0 grid place-items-center rounded-full',
};

export const TactileButton = forwardRef<HTMLButtonElement, TactileButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isBusy = loading || isLoading;
    const isDisabled = disabled || isBusy;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isBusy}
        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          VARIANT_CLASSES[variant]
        } ${SIZE_CLASSES[size]} ${
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        } ${className}`}
        {...rest}
      >
        {isBusy ? (
          <Loader2 className="size-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isBusy && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

TactileButton.displayName = 'TactileButton';
