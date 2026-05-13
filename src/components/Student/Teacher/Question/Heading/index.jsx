import { cn } from '@/lib/utils'
import { ChevronDown, FileUp, PenSquare, PlusIcon, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const TAB_ITEMS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'vocabulary', label: 'Từ vựng' },
    { value: 'grammar', label: 'Ngữ pháp' },
    { value: 'reading', label: 'Đọc hiểu' },
    { value: 'listening', label: 'Nghe' },
]

/**
 * QuestionHeading — Claymorphism page header with search, create-dropdown, and section tabs.
 * Zero shadcn — all native HTML + Tailwind.
 */
export default function QuestionHeading({
    activeTab,
    onTabChange,
    onOpenAdd,
    onOpenImport,
    searchValue,
    onSearchChange,
}) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    /* Close dropdown on outside click */
    useEffect(() => {
        if (!menuOpen) return
        const handler = e => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        document.addEventListener('pointerdown', handler)
        return () => document.removeEventListener('pointerdown', handler)
    }, [menuOpen])

    return (
        <div className="flex flex-col gap-4">
            {/* ── Top row ── */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <h1
                        className="text-lg font-bold text-[#1E293B] sm:text-xl"
                        style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                        Quản lý câu hỏi
                    </h1>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:min-w-105 lg:justify-end">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            inputMode="search"
                            placeholder="Tìm kiếm câu hỏi..."
                            aria-label="Tìm kiếm câu hỏi"
                            value={searchValue || ''}
                            onChange={e => onSearchChange?.(e.target.value)}
                            className="h-10 w-full rounded-xl border-2 border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm text-[#1E293B] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)' }}
                        />
                    </div>

                    {/* Create dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen(v => !v)}
                            className={cn(
                                'inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 px-4 text-sm font-bold transition-all duration-200 sm:w-auto cursor-pointer',
                                menuOpen
                                    ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                                    : 'border-[#E2E8F0] bg-white text-[#1E293B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                            )}
                            style={{
                                boxShadow:
                                    '4px 4px 10px rgba(0,0,0,0.04), -2px -2px 6px rgba(255,255,255,0.6)',
                            }}
                        >
                            <PlusIcon className="size-4 shrink-0" />
                            <span>Tạo câu hỏi</span>
                            <ChevronDown
                                className={cn(
                                    'size-3.5 transition-transform',
                                    menuOpen && 'rotate-180'
                                )}
                            />
                        </button>

                        {menuOpen && (
                            <div
                                className="absolute right-0 top-full z-30 mt-1.5 w-55 overflow-hidden rounded-xl border-2 border-[#E2E8F0] bg-white py-1"
                                style={{
                                    boxShadow:
                                        '6px 6px 16px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.5)',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false)
                                        onOpenAdd?.()
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-[#1E293B] transition-colors hover:bg-[#F1F5F9] cursor-pointer"
                                >
                                    <PenSquare className="size-4 text-[#2563EB]" />
                                    Tạo thủ công
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false)
                                        onOpenImport?.()
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-[#1E293B] transition-colors hover:bg-[#F1F5F9] cursor-pointer"
                                >
                                    <FileUp className="size-4 text-[#F97316]" />
                                    Tạo từ file
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Section tabs ── */}
            <div className="-mx-1 overflow-x-auto pb-1">
                <div className="inline-flex min-w-max gap-1 px-1">
                    {TAB_ITEMS.map(({ value, label }) => {
                        const isActive = activeTab === value
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => onTabChange?.(value)}
                                className={cn(
                                    'shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer',
                                    isActive
                                        ? 'bg-[#2563EB] text-white'
                                        : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#475569]'
                                )}
                                style={
                                    isActive
                                        ? { boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }
                                        : undefined
                                }
                                aria-selected={isActive}
                                role="tab"
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}