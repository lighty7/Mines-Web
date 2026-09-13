import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelRight?: React.ReactNode
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  suffix?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelRight, error, leftIcon, rightIcon, suffix, className = '', disabled, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col gap-1.5">
        {(label || labelRight) && (
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
            {label && <label htmlFor={inputId}>{label}</label>}
            {labelRight && <div>{labelRight}</div>}
          </div>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-text-secondary">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full bg-surface-3 border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
              error
                ? 'border-danger focus:border-danger'
                : 'border-border-default focus:border-primary'
            } ${leftIcon ? 'pl-9' : 'pl-3.5'} ${rightIcon || suffix ? 'pr-12' : 'pr-3.5'} py-2.5 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${className}`}
            {...props}
          />

          {suffix && !rightIcon && (
            <span className="absolute right-3 text-xs font-mono font-bold text-text-secondary pointer-events-none">
              {suffix}
            </span>
          )}

          {rightIcon && (
            <div className="absolute right-3 flex items-center text-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-[11px] font-medium text-danger mt-0.5">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
