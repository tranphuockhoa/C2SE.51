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
