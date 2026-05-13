import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(/** @type {any} */ _props, ref) {
    const { label, error, hint, className, id, ...props } = _props
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-text">
                    {label}
                </label>
            )}
         </div>
    )
})            

Input.displayName = 'Input'
export default Input