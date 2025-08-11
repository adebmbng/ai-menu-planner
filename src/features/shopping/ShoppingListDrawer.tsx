import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiPost, apiGet } from '@/api/client'
import {
    ShoppingCartIcon,
    XMarkIcon,
    DocumentDuplicateIcon,
    CheckCircleIcon,
    PlusIcon
} from '@heroicons/react/24/outline'

interface ShoppingItemDTO {
    name: string
    qty?: number | null
    unit?: string | null
    aisle?: string | null
    notes?: string | null
}

interface ShoppingListDTO {
    id: string
    week_id: string
    items?: ShoppingItemDTO[]
    status: string
}

export function ShoppingListDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    const [weekId, setWeekId] = useState('')
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

    const { data } = useQuery({
        enabled: !!weekId,
        queryKey: ['shopping-list', weekId],
        queryFn: async (): Promise<ShoppingListDTO> => {
            const generated: ShoppingListDTO = await apiPost('/api/v1/meal-planner/shopping-lists/generate', { week_id: weekId })
            return await apiGet<ShoppingListDTO>(`/api/v1/meal-planner/shopping-lists/${generated.id}`)
        },
        staleTime: 0,
    })

    const toggleItem = (index: number) => {
        const newChecked = new Set(checkedItems)
        if (newChecked.has(index)) {
            newChecked.delete(index)
        } else {
            newChecked.add(index)
        }
        setCheckedItems(newChecked)
    }

    const copyToClipboard = () => {
        if (!data?.items) return

        const text = data.items
            .map((item, index) => {
                const checked = checkedItems.has(index) ? '✅' : '⬜'
                const qty = item.qty ? `${item.qty} ` : ''
                const unit = item.unit ? `${item.unit} ` : ''
                const aisle = item.aisle ? ` (${item.aisle})` : ''
                const notes = item.notes ? ` - ${item.notes}` : ''
                return `${checked} ${qty}${unit}${item.name}${aisle}${notes}`
            })
            .join('\n')

        navigator.clipboard.writeText(`Shopping List\n\n${text}`)
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[480px]">
            {/* Backdrop for mobile */}
            <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

            {/* Drawer content */}
            <div className="relative h-full glass-card lg:rounded-l-2xl lg:border-l lg:shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
                            <ShoppingCartIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Shopping List</h3>
                            <p className="text-sm text-gray-500">Generated from your meal plan</p>
                        </div>
                    </div>
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        onClick={() => onOpenChange(false)}
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Week ID input */}
                <div className="p-6 border-b border-gray-200/50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Week ID
                    </label>
                    <div className="flex gap-3">
                        <input
                            className="modern-input flex-1 text-sm"
                            placeholder="Enter week ID (e.g., week_2025-08-11)"
                            value={weekId}
                            onChange={(e) => setWeekId(e.target.value)}
                        />
                        <button
                            className="modern-button-primary-xs px-3"
                            disabled={!weekId.trim()}
                            onClick={() => {
                                // Trigger refetch by updating the query key
                                setCheckedItems(new Set())
                            }}
                        >
                            Load
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {!weekId && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No shopping list loaded</h4>
                            <p className="text-gray-500">Enter a week ID above to generate your shopping list</p>
                        </div>
                    )}

                    {weekId && !data && (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <div className="text-sm text-gray-500">Generating shopping list...</div>
                            </div>
                        </div>
                    )}

                    {data && (
                        <div className="p-6">
                            {/* Actions */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    className="modern-button-secondary-xs gap-1.5 flex-1"
                                    onClick={copyToClipboard}
                                >
                                    <DocumentDuplicateIcon className="h-3 w-3" />
                                    Copy
                                </button>
                                <button
                                    className="modern-button-secondary-xs gap-1.5 flex-1"
                                    onClick={() => setCheckedItems(new Set())}
                                >
                                    <XMarkIcon className="h-3 w-3" />
                                    Clear
                                </button>
                            </div>

                            {/* Items list */}
                            <div className="space-y-3">
                                {(data.items ?? []).map((item, index) => (
                                    <div
                                        key={index}
                                        className={`
                                            flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer
                                            ${checkedItems.has(index)
                                                ? 'bg-green-50 border-green-200 opacity-75'
                                                : 'bg-white/60 backdrop-blur-sm border-gray-200 hover:shadow-md hover:border-blue-300'
                                            }
                                        `}
                                        onClick={() => toggleItem(index)}
                                    >
                                        <button className="mt-0.5">
                                            {checkedItems.has(index) ? (
                                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors" />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className={`font-medium ${checkedItems.has(index) ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                                {item.qty && <span>{item.qty} </span>}
                                                {item.unit && <span>{item.unit} </span>}
                                                {item.name}
                                            </div>
                                            {(item.aisle || item.notes) && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {item.aisle && <span className="bg-gray-100 px-2 py-1 rounded-full mr-2">{item.aisle}</span>}
                                                    {item.notes && <span>{item.notes}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {(!data.items || data.items.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        <PlusIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <div>No items in this shopping list</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
