import { cn } from '@/lib/utils'

const variants = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-cta/10 text-cta-dark',
    warning: 'bg-warning-light text-amber-700',
    destructive: 'bg-destructive-light text-destructive',
    info: 'bg-info-light text-info',
    outline: 'border border-border text-text bg-transparent',
    secondary: 'bg-secondary/20 text-primary-dark',
}

const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
}

export default function Badge({
    variant = 'default',
    size = 'md',
    className = '',
    children,
    ...props
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full whitespace-nowrap',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}