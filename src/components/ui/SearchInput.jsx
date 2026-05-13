import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    debounce = 400,
    className,
    ...props
})