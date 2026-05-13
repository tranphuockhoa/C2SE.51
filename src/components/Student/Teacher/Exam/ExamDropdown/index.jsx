'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { EyeIcon, Flag, MoreHorizontal, PencilIcon, TrashIcon } from 'lucide-react'
import { Fragment } from 'react'

export default function ExamDropdown({ onView, onEdit, onReport, onDelete }) {
    const menuItems = [
        { label: 'Chi tiết đề thi', icon: EyeIcon, action: onView },
        { label: 'Chỉnh sửa thông tin', icon: PencilIcon, action: onEdit },
        { label: 'Báo cáo / Phản hồi', icon: Flag, action: onReport },
        { label: 'Xóa đề thi', icon: TrashIcon, action: onDelete, variant: 'danger' },
    ]

    return (
        <Fragment>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="rounded-full p-1.5 text-text-muted transition hover:bg-background hover:text-text cursor-pointer">
                        <MoreHorizontal className="size-5" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="min-w-55 py-2">
                    {menuItems.map(item => (
                        <DropdownMenuItem
                            inset={false}
                            key={item.label}
                            onSelect={() => item.action?.()}
                            className={cn(
                                'h-11 text-sm cursor-pointer',
                                'flex items-center gap-3 text-sm',
                                item.variant === 'danger' && 'text-destructive'
                            )}
                        >
                            <item.icon className="size-5" />
                            <span>{item.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </Fragment>
    )
}