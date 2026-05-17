import { cn } from '@/lib/utils'
import { createContext, useContext } from 'react'

const TabsContext = createContext({
    value: '',
    onValueChange: /** @type {function(string): void} */ _v => {},
})

function Tabs({ value, onValueChange, className = '', children, ...props }) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn(className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

function TabsList({ className = '', children, ...props }) {
    return (
        <div
            role="tablist"
            className={cn('inline-flex items-center gap-1 rounded-lg bg-background p-1', className)}
            {...props}
        >
            {children}
        </div>
    )
}

function TabsTrigger({ value, className = '', children, ...props }) {
    const ctx = useContext(TabsContext)
    const isActive = ctx.value === value
    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => ctx.onValueChange?.(value)}
            className={cn(
                'inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap',
                isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-light hover:text-text hover:bg-white/60',
                className
            )}
            data-state={isActive ? 'active' : 'inactive'}
            {...props}
        >
            {children}
        </button>
    )
}

function TabsContent({ value, className, children, ...props }) {
    const ctx = useContext(TabsContext)
    if (ctx.value !== value) return null
    return (
        <div role="tabpanel" className={cn('mt-3', className)} {...props}>
            {children}
        </div>
    )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
