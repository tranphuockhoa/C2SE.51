import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

const SelectContext = createContext({
    value: '',
    onValueChange: Function.prototype,
    open: false,
    setOpen: Function.prototype,
})