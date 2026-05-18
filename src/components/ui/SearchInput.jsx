import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    debounce = 400,
    className,
    ...props
}) {
    const [local, setLocal] = useState(value ?? '')
    const timerRef = useRef(null)

    useEffect(() => {
        setLocal(value ?? '')
    }, [value])

    const handleChange = e => {
        const v = e.target.value
        setLocal(v)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => onChange?.(v), debounce)
    }

    useEffect(() => () => clearTimeout(timerRef.current), [])

    return (
        <div className={cn('relative', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
                type="text"
                value={local}
                onChange={handleChange}
                placeholder={placeholder}
                className={cn(
                    'w-full rounded-lg border border-border bg-white pl-9 pr-4 py-2.5 text-sm text-text',
                    'placeholder:text-text-muted transition-colors duration-200',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
                {...props}
            />
        </div>
    )
}