import SearchInput from '@/components/ui/SearchInput'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'

const TAB_ITEMS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'n1', label: 'N1' },
    { value: 'n2', label: 'N2' },
    { value: 'n3', label: 'N3' },
    { value: 'n4', label: 'N4' },
    { value: 'n5', label: 'N5' },
]

export default function ExamHeading({ onCreateExam, search, onSearchChange }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text">Quản lý đề thi</h1>
                    <p className="mt-0.5 text-sm text-text-light">
                        Tạo và quản lý các đề thi JLPT của bạn
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <SearchInput
                        value={search}
                        onChange={onSearchChange}
                        placeholder="Tìm đề thi..."
                        className="w-56"
                    />
                    <button
                        type="button"
                        onClick={onCreateExam}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark transition-colors cursor-pointer shrink-0"
                    >
                        <Plus className="size-4" />
                        Tạo đề thi
                    </button>
                </div>
            </div>

            <div className="-mx-1 overflow-x-auto pb-1">
                <TabsList
                    variant="line"
                    className="inline-flex h-auto min-w-max gap-1 bg-transparent px-1 py-0"
                >
                    {TAB_ITEMS.map(({ value, label }) => (
                        <TabsTrigger
                            key={value}
                            value={value}
                            className="shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                        >
                            {label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
        </div>
    )
}