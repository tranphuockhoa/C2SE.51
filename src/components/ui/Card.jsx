import { cn } from '@/lib/utils'

export default function Card({ className, hover = false, children, ...props }) {
    return (
        <div
            className={cn(
                'rounded-xl bg-white border border-border-light p-6 shadow-sm',
                'transition-all duration-200',
                hover && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

function CardHeader({ className, children, ...props }) {
    return (
        <div className={cn('mb-4', className)} {...props}>
            {children}
        </div>
    )
}

function CardBody({ className, children, ...props }) {
    return (
        <div className={cn(className)} {...props}>
            {children}
        </div>
    )
}

function CardFooter({ className, children, ...props }) {
    return (
        <div className={cn('mt-4 flex items-center gap-3', className)} {...props}>
            {children}
        </div>
    )
}
