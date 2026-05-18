import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

const SelectContext = createContext({
    value: '',
    onValueChange: Function.prototype,
    open: false,
    setOpen: Function.prototype,
})

function Select({ value, onValueChange, children }) {
    const [open, setOpen] = useState(false)
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    )
}

function SelectTrigger({ className, children }) {
    const { open, setOpen } = useContext(SelectContext)
    return (
        <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className={cn(
                'flex h-10 w-full items-center justify-between text-sm outline-none cursor-pointer',
                className
            )}
            aria-expanded={open}
        >
            {children}
            <ChevronDown
                className={cn(
                    'size-4 shrink-0 text-gray-400 transition-transform',
                    open && 'rotate-180'
                )}
            />
        </button>
    )
}

function SelectValue({ placeholder }) {
    const { value } = useContext(SelectContext)
    return <span className={cn('truncate', !value && 'text-gray-400')}>{value || placeholder}</span>
}

function SelectContent({ children }) {
    const { open, setOpen } = useContext(SelectContext)
    const ref = useRef(null)

    useEffect(() => {
        if (!open) return
        const handler = e => {
            if (ref.current && !ref.current.parentElement?.contains(e.target)) setOpen(false)
        }
        document.addEventListener('pointerdown', handler)
        return () => document.removeEventListener('pointerdown', handler)
    }, [open, setOpen])

    if (!open) return null
    return (
        <div
            ref={ref}
            className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
            {children}
        </div>
    )
}

function SelectItem({ value, children }) {
    const { value: selected, onValueChange, setOpen } = useContext(SelectContext)
    const isActive = selected === value
    return (
        <button
            type="button"
            onClick={() => {
                onValueChange?.(value)
                setOpen(false)
            }}
            className={cn(
                'flex w-full items-center px-3 py-2 text-sm transition-colors cursor-pointer',
                isActive ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            )}
        >
            {children}
        </button>
    )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
