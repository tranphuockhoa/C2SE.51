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
}) {
    const [local, setLocal] = useState(value ?? '')
    const timerRef = useRef(null)

    useEffect(() => {
        setLocal(value ?? '')
    }, [value])

    const handleChange = e => {
        const v = e.target.value
        setLocal(v)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => onChange?.(v), debounce)
    }

    useEffect(() => () => clearTimeout(timerRef.current), [])