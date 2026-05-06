import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'

const variants = {
    primary: 'bg-cta text-white hover:bg-cta-dark shadow-sm',
    secondary:
        'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white',
    outline: 'bg-transparent text-text border border-border hover:bg-background',
    ghost: 'bg-transparent text-text hover:bg-background',
    destructive: 'bg-destructive text-white hover:bg-red-600',
    link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
}