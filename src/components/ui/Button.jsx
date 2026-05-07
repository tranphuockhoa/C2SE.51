import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'

const variants = {
    primary: 'bg-cta text-white hover:bg-cta-dark shadow-sm',
    secondary:
        'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white',
    outline: 'bg-transparent text-text border border-border hover:bg-background',
    ghost: 'bg-transparent text-text hover:bg-background',
    destructive: 'bg-destructive text-white hover:bg-red-600',
    link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
}

const sizes = {
    sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
    md: 'h-10 px-5 text-sm rounded-lg gap-2',
    lg: 'h-12 px-6 text-base rounded-lg gap-2.5',
    icon: 'h-10 w-10 rounded-lg',
}

const Button = forwardRef(function Button(/** @type {any} */ _props, ref) {
    const {
        variant = 'primary',
        size = 'md',
        loading = false,
        disabled = false,
        className,
        children,
        ...props
    } = _props
    {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'active:scale-[0.98]',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {children}
            </button>
        )
    }
})