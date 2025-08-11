import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { WeeklyPlanner } from '@/features/menu/WeeklyPlanner'
import { RecipeLibrary } from '@/features/recipes/RecipeLibrary'
import { RecipeDetailModal } from '@/features/recipes/RecipeDetailModal'
import { ShoppingListDrawer } from '@/features/shopping/ShoppingListDrawer'
import { PlusCircleIcon, ShoppingCartIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useDragStore } from '@/state/dnd'
import { useUIStore } from '@/state/ui'
import { useMenus } from '@/hooks/useMenus'
import type { Recipe } from '@/types/menu'

export default function App() {
    const { isShoppingListOpen, setShoppingListOpen, setRecipeModalOpen } = useUIStore()
    const { draggedItem, setActiveId, setDraggedItem, clearDrag } = useDragStore()
    const { recipeMap, assignRecipeToDay } = useMenus()

    // Configure sensors to prevent accidental drags on click
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px of movement before drag starts
            },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)

        // Set dragged item based on the active element's data
        if (active.data?.current) {
            setDraggedItem(active.data.current as {
                recipeId?: string
                title: string
                source: 'library' | 'meal'
                sourceDate?: string
                sourceKey?: string
            })
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.data?.current && over.data?.current) {
            const draggedData = active.data.current as {
                type: string
                recipeId?: string
                recipe?: Recipe
                title: string
                source: 'library' | 'meal'
                sourceDate?: string
                sourceKey?: string
            }

            const dropData = over.data.current as {
                type: string
                date?: string
            }

            // Handle dropping a recipe from library to a day
            if (draggedData.source === 'library' && dropData.type === 'day' && dropData.date) {
                const recipeId = draggedData.recipeId
                if (recipeId) {
                    const recipe = recipeMap.get(recipeId)
                    if (recipe) {
                        assignRecipeToDay(dropData.date, recipe)
                    }
                }
            }

            // Handle moving meals between days or reordering within same day
            if (draggedData.source === 'meal' && dropData.type === 'day') {
                // This is already handled by the WeeklyPlanner component's optimistic updates
                // The meal item drag contains the full recipe object
                if (draggedData.recipe && dropData.date && draggedData.sourceDate !== dropData.date) {
                    assignRecipeToDay(dropData.date, draggedData.recipe)
                }
            }
        }

        clearDrag()
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="min-h-screen">
                {/* Modern gradient header with glassmorphism */}
                <header className="sticky top-0 z-40 border-b border-white/20 glass-card">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                                    <SparklesIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        AI Menu Planner
                                    </h1>
                                    <p className="text-sm text-gray-500">Smart meal planning made easy</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="modern-button-secondary-xs gap-1.5"
                                    onClick={() => setRecipeModalOpen(true)}
                                >
                                    <PlusCircleIcon className="h-3 w-3" />
                                    Add Recipe
                                </button>
                                <button
                                    className="modern-button-primary-xs gap-1.5"
                                    onClick={() => setShoppingListOpen(!isShoppingListOpen)}
                                >
                                    <ShoppingCartIcon className="h-3 w-3" />
                                    Shopping List
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main layout with sidebar */}
                <div className="flex min-h-[calc(100vh-5rem)]">
                    {/* Recipe Library Sidebar */}
                    <aside className="w-80 bg-gray-50/50 border-r border-gray-200/50 overflow-y-auto">
                        <div className="p-4">
                            <RecipeLibrary />
                        </div>
                    </aside>

                    {/* Main content area */}
                    <main className="flex-1 overflow-x-auto">
                        <div className="p-6">
                            {/* Instructions card */}
                            <div className="glass-card rounded-xl p-4 mb-6">
                                <div className="text-center">
                                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                                        🎯 Drag & Drop Meal Planning
                                    </h2>
                                    <p className="text-gray-600 text-xs">
                                        Drag recipes from the sidebar to your daily meal plan. You can also drag meals between days to reorganize your week.
                                    </p>
                                </div>
                            </div>

                            {/* Weekly Planner */}
                            <WeeklyPlanner />
                        </div>
                    </main>
                </div>

                {/* Drag overlay */}
                <DragOverlay>
                    {draggedItem && (
                        <div className="glass-card p-3 rounded-lg shadow-2xl ring-2 ring-blue-500 ring-opacity-50 transform rotate-3">
                            <div className="text-sm font-medium text-gray-900">{draggedItem.title}</div>
                            <div className="text-xs text-gray-500">Drop to assign to meal</div>
                        </div>
                    )}
                </DragOverlay>

                <ShoppingListDrawer open={isShoppingListOpen} onOpenChange={setShoppingListOpen} />
                <RecipeDetailModal />
            </div>
        </DndContext>
    )
}
