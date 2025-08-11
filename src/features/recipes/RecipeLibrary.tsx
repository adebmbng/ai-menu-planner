import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Modal } from '@/components/Modal'
import { MagnifyingGlassIcon, PlusIcon, BookOpenIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { useUIStore } from '@/state/ui'
import { useMenus } from '../../hooks/useMenus'
import { ingestRecipe } from '../../api/menus'
import type { Recipe } from '../../types/menu'

export function RecipeLibrary() {
    const { searchQuery, setSearchQuery, isRecipeModalOpen, setRecipeModalOpen } = useUIStore()
    const { recipeMap, loadRecipes } = useMenus()
    const [rawText, setRawText] = useState('')
    const [isIngesting, setIsIngesting] = useState(false)

    // Convert recipe map to array for display
    const recipes = Array.from(recipeMap.values()).filter(recipe => {
        if (!searchQuery) return true
        return recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    })

    const handleIngestRecipe = async () => {
        if (!rawText.trim()) return

        setIsIngesting(true)
        try {
            await ingestRecipe(rawText.trim())
            await loadRecipes() // Reload recipes to get the new one
            setRecipeModalOpen(false)
            setRawText('')
        } catch (error) {
            console.error('Failed to add recipe:', error)
            // TODO: Show error toast
        } finally {
            setIsIngesting(false)
        }
    }

    return (
        <>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                        <BookOpenIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Recipe Library</h3>
                        <p className="text-xs text-gray-500">Drag recipes to your meal plan</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search recipes..."
                    />
                </div>

                {/* Add button */}
                <button
                    className="w-full modern-button-primary-xs gap-2 justify-center"
                    onClick={() => setRecipeModalOpen(true)}
                >
                    <PlusIcon className="h-3 w-3" />
                    Add New Recipe
                </button>

                {/* Recipe list */}
                <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
                    {recipes.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-sm mb-1">No recipes found</div>
                            <div className="text-gray-300 text-xs">Add your first recipe above</div>
                        </div>
                    ) : (
                        recipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))
                    )}
                </div>
            </div>

            <Modal open={isRecipeModalOpen} onClose={() => setRecipeModalOpen(false)} title="Add New Recipe">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recipe Content
                        </label>
                        <textarea
                            className="w-full min-h-[160px] rounded-lg border border-gray-300 p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Paste your recipe here... Include ingredients, instructions, and any notes."
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            className="modern-button-secondary-xs"
                            onClick={() => {
                                setRecipeModalOpen(false)
                                setRawText('')
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="modern-button-primary-xs"
                            onClick={handleIngestRecipe}
                            disabled={!rawText.trim() || isIngesting}
                        >
                            {isIngesting ? 'Adding...' : 'Add Recipe'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

interface RecipeCardProps {
    recipe: Recipe
}

function RecipeCard({ recipe }: RecipeCardProps) {
    const { setRecipeDetailModalOpen, setSelectedRecipeId } = useUIStore()

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: `recipe-${recipe.id}`,
        data: {
            type: 'recipe',
            recipeId: recipe.id,
            title: recipe.title,
            source: 'library' as const,
        },
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    const handleTitleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setSelectedRecipeId(recipe.id)
        setRecipeDetailModalOpen(true)
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                group bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 transition-all duration-200 cursor-grab active:cursor-grabbing
                ${isDragging ? 'draggable dragging shadow-2xl z-50 rotate-3' : 'draggable hover:shadow-md hover:border-blue-300 hover:scale-[1.01]'}
            `}
            {...listeners}
            {...attributes}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                    <h4
                        className="font-medium text-gray-900 text-sm truncate mb-1 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1"
                        onClick={handleTitleClick}
                        title="Click to view recipe details"
                    >
                        {recipe.title}
                        <InformationCircleIcon className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {recipe.raw_text.slice(0, 80)}...
                    </p>
                    {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {recipe.tags.slice(0, 2).map((tag: string) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs bg-blue-50 text-blue-600 border border-blue-200"
                                >
                                    {tag}
                                </span>
                            ))}
                            {recipe.tags.length > 2 && (
                                <span className="text-xs text-gray-400">+{recipe.tags.length - 2}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Drag indicator - always visible in sidebar */}
                <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-70">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
            </div>
        </div>
    )
}
