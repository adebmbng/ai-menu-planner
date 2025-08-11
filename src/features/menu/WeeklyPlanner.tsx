import { addDays, format, startOfWeek } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { apiGet, apiPost } from '@/api/client'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useUIStore } from '@/state/ui'

interface MenuDayDTO { date: string; meals?: Record<string, string> }
interface MenuWeekDTO { id: string; week_start: string; days?: MenuDayDTO[]; notes?: string | null }

function monToFri(start: Date) {
    return Array.from({ length: 5 }, (_, i) => addDays(start, i))
}

export function WeeklyPlanner() {
    const qc = useQueryClient()
    const { currentWeek, setCurrentWeek } = useUIStore()
    const [weekStart, setWeekStart] = useState(() => {
        const defaultWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
        return currentWeek || defaultWeek
    })

    // Sync with store
    useEffect(() => {
        setCurrentWeek(weekStart)
    }, [weekStart, setCurrentWeek])

    const { data: week } = useQuery({
        queryKey: ['week', weekStart],
        queryFn: async (): Promise<MenuWeekDTO | null> => {
            const weeks: MenuWeekDTO[] = await apiGet('/api/v1/meal-planner/menus/weeks')
            const hit = weeks.find((w) => w.week_start === weekStart)
            if (hit) return hit
            return null
        },
        staleTime: 30_000,
    })

    const createOrReplace = useMutation({
        mutationFn: async (payload: MenuWeekDTO) => {
            return await apiPost<MenuWeekDTO>('/api/v1/meal-planner/menus/weeks', { menu: payload })
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['week', weekStart] }),
    })

    // Ensure a week exists for current weekStart
    useEffect(() => {
        if (week) return
        const start = new Date(weekStart)
        const days = monToFri(start).map((d) => ({ date: format(d, 'yyyy-MM-dd'), meals: {} }))
        createOrReplace.mutate({ id: `week_${weekStart}`, week_start: weekStart, days })
    }, [weekStart, week])

    const days = useMemo(() => {
        const start = new Date(weekStart)
        const desired = monToFri(start).map((d) => format(d, 'yyyy-MM-dd'))
        const existing = new Map((week?.days ?? []).map((d) => [d.date, d]))
        return desired.map((d) => existing.get(d) ?? { date: d, meals: {} })
    }, [weekStart, week])

    function setDayMeals(date: string, meals: Record<string, string>) {
        const nextDays = days.map((d) => (d.date === date ? { ...d, meals } : d))
        const payload: MenuWeekDTO = { id: week?.id ?? `week_${weekStart}`, week_start: weekStart, days: nextDays }
        createOrReplace.mutate(payload)
    }

    function addMeal(date: string, value: string) {
        const d = days.find((x) => x.date === date)!
        const keys = Object.keys(d.meals ?? {})
        const nextKey = `m${keys.length + 1}`
        setDayMeals(date, { ...(d.meals ?? {}), [nextKey]: value })
    }

    function removeMeal(date: string, key: string) {
        const d = days.find((x) => x.date === date)!
        const { [key]: _, ...rest } = d.meals ?? {}
        setDayMeals(date, rest)
    }

    function moveMeal(srcDate: string, srcKey: string, dstDate: string, dstIndex: number) {
        if (srcDate === dstDate) {
            const d = days.find((x) => x.date === srcDate)!
            const entries = Object.entries(d.meals ?? {})
            const fromIdx = entries.findIndex(([k]) => k === srcKey)
            const [item] = entries.splice(fromIdx, 1)
            entries.splice(dstIndex, 0, item)
            const rekeyed: Record<string, string> = {}
            entries.forEach(([_, v], i) => (rekeyed[`m${i + 1}`] = v))
            setDayMeals(srcDate, rekeyed)
        } else {
            const sd = days.find((x) => x.date === srcDate)!
            const dd = days.find((x) => x.date === dstDate)!
            const srcEntries = Object.entries(sd.meals ?? {})
            const fromIdx = srcEntries.findIndex(([k]) => k === srcKey)
            const [item] = srcEntries.splice(fromIdx, 1)
            const dstEntries = Object.entries(dd.meals ?? {})
            dstEntries.splice(dstIndex, 0, item)
            const reSrc: Record<string, string> = {}
            srcEntries.forEach(([_, v], i) => (reSrc[`m${i + 1}`] = v))
            const reDst: Record<string, string> = {}
            dstEntries.forEach(([_, v], i) => (reDst[`m${i + 1}`] = v))
            setDayMeals(srcDate, reSrc)
            setDayMeals(dstDate, reDst)
        }
    }

    return (
        <div className="space-y-4">
            {/* Compact header with better navigation */}
            <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                            <CalendarIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Weekly Menu</h2>
                            <p className="text-sm text-gray-500">Week starting {format(new Date(weekStart), 'MMM d, yyyy')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="modern-button-secondary-sm"
                            onClick={() => setWeekStart(format(addDays(new Date(weekStart), -7), 'yyyy-MM-dd'))}
                        >
                            <ChevronLeftIcon className="h-3 w-3" />
                        </button>
                        <button
                            className="modern-button-secondary-sm"
                            onClick={() => setWeekStart(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'))}
                        >
                            Today
                        </button>
                        <button
                            className="modern-button-secondary-sm"
                            onClick={() => setWeekStart(format(addDays(new Date(weekStart), 7), 'yyyy-MM-dd'))}
                        >
                            <ChevronRightIcon className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Horizontal calendar layout */}
            <div className="glass-card rounded-xl overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-5 bg-gray-50/50 border-b border-gray-200/50">
                    {days.map((d) => {
                        const dayName = format(new Date(d.date), 'EEEE')
                        const dayNumber = format(new Date(d.date), 'd')
                        const monthDay = format(new Date(d.date), 'MMM d')
                        const isToday = format(new Date(), 'yyyy-MM-dd') === d.date

                        return (
                            <div
                                key={d.date}
                                className={`p-3 text-center border-r border-gray-200/50 last:border-r-0 ${isToday ? 'bg-blue-50/70' : ''
                                    }`}
                            >
                                <div className={`font-semibold text-sm ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {dayName}
                                </div>
                                <div className="text-xs text-gray-500 mb-1">{monthDay}</div>
                                <div className={`
                                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                    ${isToday
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600'
                                    }
                                `}>
                                    {dayNumber}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Meal slots */}
                <div className="grid grid-cols-5 min-h-[400px]">
                    {days.map((d) => (
                        <DayColumn
                            key={d.date}
                            date={d.date}
                            meals={d.meals ?? {}}
                            onAdd={addMeal}
                            onRemove={removeMeal}
                            onMove={moveMeal}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

interface DayColumnProps {
    date: string
    meals: Record<string, string>
    onAdd: (date: string, value: string) => void
    onRemove: (date: string, key: string) => void
    onMove: (srcDate: string, srcKey: string, dstDate: string, dstIndex: number) => void
}

function DayColumn({ date, meals, onAdd, onRemove }: DayColumnProps) {
    const [input, setInput] = useState('')
    const list = Object.entries(meals)
    const isToday = format(new Date(), 'yyyy-MM-dd') === date

    const { setNodeRef, isOver } = useDroppable({
        id: `day-${date}`,
        data: {
            type: 'day',
            date,
        },
    })

    return (
        <div
            ref={setNodeRef}
            className={`
                p-4 border-r border-gray-200/50 last:border-r-0 min-h-[400px] transition-all duration-200 relative
                ${isOver ? 'drop-zone drag-over bg-blue-50' : 'drop-zone'}
                ${isToday ? 'bg-blue-50/30' : ''}
            `}
        >
            {/* Meals list */}
            <div className="space-y-2 mb-4">
                <SortableContext items={list.map(([k]) => k)} strategy={verticalListSortingStrategy}>
                    {list.map(([k, v], index) => (
                        <MealItem
                            key={k}
                            id={k}
                            date={date}
                            value={v}
                            index={index}
                            onRemove={() => onRemove(date, k)}
                        />
                    ))}
                </SortableContext>

                {list.length === 0 && (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="text-center">
                            <div className="text-gray-400 text-xs mb-1">Drop recipe here</div>
                            <div className="text-gray-300 text-xs">or add below</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add meal input - compact */}
            <div className="space-y-2 mt-auto">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add meal..."
                    className="w-full text-xs p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && input.trim()) {
                            onAdd(date, input.trim())
                            setInput('')
                        }
                    }}
                />
                <button
                    className="w-full modern-button-secondary-xs"
                    onClick={() => {
                        if (!input.trim()) return
                        onAdd(date, input.trim())
                        setInput('')
                    }}
                    disabled={!input.trim()}
                >
                    Add
                </button>
            </div>
        </div>
    )
} interface MealItemProps {
    id: string
    date: string
    value: string
    index: number
    onRemove: () => void
}

function MealItem({ id, date, value, onRemove }: MealItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: {
            type: 'meal',
            recipeId: id,
            title: value,
            source: 'meal' as const,
            sourceDate: date,
            sourceKey: id,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-2 transition-all duration-200
                ${isDragging ? 'draggable dragging shadow-lg z-50' : 'draggable hover:shadow-sm hover:border-blue-300'}
            `}
            {...attributes}
            {...listeners}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{value}</div>
                </div>
                <button
                    className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-red-100 text-red-500 transition-all duration-200"
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove()
                    }}
                >
                    <XMarkIcon className="h-3 w-3" />
                </button>
            </div>
        </div>
    )
}
