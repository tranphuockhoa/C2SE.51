import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(/** @type {any} */ _props, ref) {
    const { label, error, hint, className, id, ...props } = _props
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-text">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                className={cn(
                    'w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-text placeholder:text-text-muted',
                    'transition-colors duration-200',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                    error &&
                        'border-destructive focus:border-destructive focus:ring-destructive/20',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
         </div>
    )
})            

Input.displayName = 'Input'
export default Input