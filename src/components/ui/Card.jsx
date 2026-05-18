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

function CardTitle({ className, as: Tag = 'h3', children, ...props }) {
    const Component = /** @type {any} */ (Tag)
    return (
        <Component className={cn('text-lg font-bold text-text', className)} {...props}>
            {children}
        </Component>
    )
}

function CardDescription({ className, children, ...props }) {
    return (
        <p className={cn('text-sm text-text-light mt-1', className)} {...props}>
            {children}
        </p>
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

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Body = CardBody
Card.Footer = CardFooter