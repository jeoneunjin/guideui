export const SANDBOX_COMPONENT_FILES: Record<string, string> = {
  '/components/ui/button.tsx': `import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-fg-inverse hover:bg-brand-700 active:bg-brand-800',
  secondary: 'bg-surface text-fg-primary border border-line-input hover:bg-surface-subtle',
  ghost: 'bg-transparent text-fg-brand hover:bg-brand-50',
  danger: 'bg-danger-600 text-fg-inverse hover:bg-danger-700',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', type = 'button', className = '', children, ...props }: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-inline rounded-button font-medium transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ].filter(Boolean).join(' ')
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
`,
  '/components/ui/input.tsx': `import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { error?: boolean }

export function Input({ error = false, className = '', ...props }: InputProps) {
  const classes = [
    'h-11 w-full rounded-input border bg-surface px-3 text-base text-fg-primary placeholder:text-fg-muted',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus',
    'disabled:bg-surface-muted disabled:cursor-not-allowed',
    error ? 'border-line-error' : 'border-line-input focus-visible:border-line-focus',
    className,
  ].filter(Boolean).join(' ')
  return <input aria-invalid={error || undefined} className={classes} {...props} />
}
`,
  '/components/ui/label.tsx': `import type { LabelHTMLAttributes, ReactNode } from 'react'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean; children?: ReactNode }

export function Label({ required = false, className = '', children, ...props }: LabelProps) {
  const classes = ['text-sm font-medium text-fg-primary', className].filter(Boolean).join(' ')
  return (
    <label className={classes} {...props}>
      {children}
      {required && <span className="text-fg-error"> *</span>}
    </label>
  )
}
`,
  '/components/ui/card.tsx': `import type { HTMLAttributes, ReactNode } from 'react'

type DivProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode }

export function Card({ className = '', children, ...props }: DivProps) {
  const classes = ['rounded-card border border-line bg-surface', className].filter(Boolean).join(' ')
  return <div className={classes} {...props}>{children}</div>
}

export function CardHeader({ className = '', children, ...props }: DivProps) {
  const classes = ['flex flex-col gap-1 p-component', className].filter(Boolean).join(' ')
  return <div className={classes} {...props}>{children}</div>
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  const classes = ['text-lg font-bold text-fg-primary', className].filter(Boolean).join(' ')
  return <h3 className={classes} {...props}>{children}</h3>
}

export function CardContent({ className = '', children, ...props }: DivProps) {
  const classes = ['px-component pb-component', className].filter(Boolean).join(' ')
  return <div className={classes} {...props}>{children}</div>
}

export function CardFooter({ className = '', children, ...props }: DivProps) {
  const classes = ['flex justify-end gap-inline border-t border-line px-component py-4', className].filter(Boolean).join(' ')
  return <div className={classes} {...props}>{children}</div>
}
`,
  '/components/ui/badge.tsx': `import type { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surface-muted text-fg-secondary',
  brand: 'bg-brand-50 text-fg-brand',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  info: 'bg-info-50 text-info-700',
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant; children?: ReactNode }

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const classes = [
    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
    VARIANT_CLASSES[variant],
    className,
  ].filter(Boolean).join(' ')
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
`,
}
