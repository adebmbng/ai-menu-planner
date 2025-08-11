import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { ClockIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline'
import { useUIStore } from '@/state/ui'
import { getRecipe } from '@/api/menus'
import type { Recipe } from '@/types/menu'

export function RecipeDetailModal() {
    const { isRecipeDetailModalOpen, selectedRecipeId, setRecipeDetailModalOpen } = useUIStore()
    const [recipe, setRecipe] = useState<Recipe | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch recipe details when modal opens
    useEffect(() => {
        const fetchRecipe = async () => {
            if (!selectedRecipeId || !isRecipeDetailModalOpen) {
                setRecipe(null)
                setError(null)
                return
            }

            setIsLoading(true)
            setError(null)
            try {
                const recipeData = await getRecipe(selectedRecipeId)
                setRecipe(recipeData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch recipe')
                setRecipe(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecipe()
    }, [selectedRecipeId, isRecipeDetailModalOpen])

    const handleClose = () => {
        setRecipeDetailModalOpen(false)
        // Clear recipe data when modal closes
        setTimeout(() => {
            setRecipe(null)
            setError(null)
        }, 300) // Delay to avoid flash during close animation
    }

    return (
        <Modal
            open={isRecipeDetailModalOpen}
            onClose={handleClose}
            title={recipe?.title || 'Recipe Details'}
            maxWidth="max-w-4xl"
        >
            <div className="space-y-8">
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {error && (
                    <div className="text-center py-12">
                        <div className="text-red-600">
                            <p className="font-semibold text-lg">Error loading recipe</p>
                            <p className="text-body mt-2">{error}</p>
                        </div>
                    </div>
                )}

                {recipe && !isLoading && (
                    <>
                        {/* Recipe Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 -m-6 p-8 mb-8 border-b border-gray-200/60">
                            <h1 className="text-recipe-title text-gray-900 mb-4">{recipe.title}</h1>

                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {recipe.cuisine && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200/50">
                                        {recipe.cuisine}
                                    </span>
                                )}
                                {recipe.diet && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200/50">
                                        {recipe.diet}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-body text-gray-700">
                                {recipe.time_minutes && (
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="h-5 w-5 text-gray-500" />
                                        <span className="font-medium">{recipe.time_minutes} min</span>
                                    </div>
                                )}
                                {recipe.servings && (
                                    <div className="flex items-center gap-2">
                                        <UserGroupIcon className="h-5 w-5 text-gray-500" />
                                        <span className="font-medium">{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>

                            {recipe.tags && recipe.tags.length > 0 && (
                                <div className="flex items-center gap-3 mt-6">
                                    <TagIcon className="h-5 w-5 text-gray-400" />
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-white/80 text-blue-700 border border-blue-200/60 shadow-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Two-column layout for larger screens */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Ingredients Section */}
                            {recipe.ingredients && recipe.ingredients.length > 0 && (
                                <div>
                                    <h3 className="text-section-header text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            📋
                                        </span>
                                        Ingredients
                                    </h3>
                                    <div className="space-y-3">
                                        {recipe.ingredients.map((ingredient, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-100/80"
                                            >
                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-3"></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-3 flex-wrap">
                                                        <span className="text-body-large font-semibold text-gray-900">
                                                            {ingredient.name}
                                                        </span>
                                                        {ingredient.qty && (
                                                            <span className="text-body font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                                                {ingredient.qty}
                                                                {ingredient.unit && ` ${ingredient.unit}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {ingredient.notes && (
                                                        <div className="text-caption text-gray-600 mt-1 italic">
                                                            {ingredient.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instructions Section */}
                            {recipe.steps && recipe.steps.length > 0 && (
                                <div>
                                    <h3 className="text-section-header text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            👨‍🍳
                                        </span>
                                        Instructions
                                    </h3>
                                    <div className="space-y-4">
                                        {recipe.steps.map((step, index) => (
                                            <div key={index} className="flex gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-sm">
                                                    {index + 1}
                                                </div>
                                                <p className="text-body-large text-gray-800 leading-relaxed pt-1">
                                                    {step}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Original Recipe Section (full width) */}
                        {recipe.raw_text && (
                            <div className="mt-8">
                                <h3 className="text-section-header text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        📝
                                    </span>
                                    Original Recipe
                                </h3>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200/60">
                                    <pre className="whitespace-pre-wrap text-body text-gray-700 font-mono leading-relaxed overflow-x-auto">
                                        {recipe.raw_text}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    )
}
