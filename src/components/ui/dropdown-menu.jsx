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

function DropdownMenuContent({ children, align = 'end', className, sideOffset = 4, ...props }) {
    const { open, setOpen } = useContext(DropdownCtx)
    const ref = useRef(null)

    useEffect(() => {
        if (!open) return
        const handler = e => {
            if (ref.current && !ref.current.parentElement?.contains(e.target)) setOpen(false)
        }
        document.addEventListener('pointerdown', handler)
        return () => document.removeEventListener('pointerdown', handler)
    }, [open, setOpen])

    useEffect(() => {
        if (!open) return
        const handler = e => e.key === 'Escape' && setOpen(false)
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, setOpen])

    if (!open) return null

    return (
        <div
            ref={ref}
            role="menu"
            className={cn(
                'absolute z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg',
                align === 'end' ? 'right-0' : 'left-0',
                className
            )}
            style={{ marginTop: sideOffset }}
            {...props}
        >
            {children}
        </div>
    )
}

function DropdownMenuItem({ children, onSelect, className, inset, ...props }) {
    const { setOpen } = useContext(DropdownCtx)
    return (
        <button
            type="button"
            role="menuitem"
            onClick={() => {
                onSelect?.()
                setOpen(false)
            }}
            className={cn(
                'flex w-full items-center px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer',
                inset && 'pl-8',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger }