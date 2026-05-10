'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EyeIcon, MoreHorizontal, TrashIcon } from 'lucide-react'
import { Fragment } from 'react'

export default function DropdownExamQuestion({ onView, onDelete }) {
    const dropdownList = [
        { label: 'Chi tiết', icon: <EyeIcon className="size-5" />, action: onView },
        { label: 'Xóa', icon: <TrashIcon className="size-5" />, action: onDelete },
    ]

    return (
        <Fragment>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <MoreHorizontal className="size-5" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8} className="min-w-55 py-3">
                    {dropdownList.map(item => (
                        <DropdownMenuItem
                            inset={false}
                            key={item.label}
                            onSelect={() => item.action?.()}
                            className="h-11 text-sm cursor-pointer"
                        >
                            <span className="mr-3">{item.icon}</span>
                            <span>{item.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </Fragment>
    )
}