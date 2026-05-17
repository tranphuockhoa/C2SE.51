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