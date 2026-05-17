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