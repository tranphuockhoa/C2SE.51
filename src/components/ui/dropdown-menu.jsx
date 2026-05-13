import { cn } from '@/lib/utils'
import { cloneElement, createContext, useContext, useEffect, useRef, useState } from 'react'

const DropdownCtx = createContext({ open: false, setOpen: Function.prototype })

function DropdownMenu({ children }) {
    const [open, setOpen] = useState(false)
    return (
        <DropdownCtx.Provider value={{ open, setOpen }}>
            <div className="relative inline-block">{children}</div>
        </DropdownCtx.Provider>
    )
}

function DropdownMenuTrigger({ asChild, children, className = '', ...props }) {
    const { open, setOpen } = useContext(DropdownCtx)

    const handleClick = () => setOpen(v => !v)

    if (asChild && children) {
        return cloneElement(children, {
            onClick: e => {
                children.props.onClick?.(e)
                handleClick()
            },
            'aria-expanded': open,
            'data-state': open ? 'open' : 'closed',
        })
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn('cursor-pointer', className)}
            aria-expanded={open}
            data-state={open ? 'open' : 'closed'}
            {...props}
        >
            {children}
        </button>
    )
}