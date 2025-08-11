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
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8">
                        <div className="text-red-600">
                            <p className="font-medium">Error loading recipe</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {recipe && !isLoading && (
                    <>
                        {/* Recipe Header */}
                        <div className="border-b border-gray-200 pb-4">
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                                {recipe.cuisine && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        {recipe.cuisine}
                                    </span>
                                )}
                                {recipe.diet && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {recipe.diet}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                {recipe.time_minutes && (
                                    <div className="flex items-center gap-1">
                                        <ClockIcon className="h-4 w-4" />
                                        <span>{recipe.time_minutes} min</span>
                                    </div>
                                )}
                                {recipe.servings && (
                                    <div className="flex items-center gap-1">
                                        <UserGroupIcon className="h-4 w-4" />
                                        <span>{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>

                            {recipe.tags && recipe.tags.length > 0 && (
                                <div className="flex items-center gap-2 mt-3">
                                    <TagIcon className="h-4 w-4 text-gray-400" />
                                    <div className="flex flex-wrap gap-1">
                                        {recipe.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ingredients Section */}
                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                                <div className="space-y-2">
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {ingredient.name}
                                                    </span>
                                                    {ingredient.qty && (
                                                        <span className="text-sm text-gray-600">
                                                            {ingredient.qty}
                                                            {ingredient.unit && ` ${ingredient.unit}`}
                                                        </span>
                                                    )}
                                                </div>
                                                {ingredient.notes && (
                                                    <div className="text-xs text-gray-500 mt-0.5">
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                                <div className="space-y-3">
                                    {recipe.steps.map((step, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                {index + 1}
                                            </div>
                                            <p className="text-gray-700 leading-relaxed pt-0.5">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Raw Text Section (as fallback or additional info) */}
                        {recipe.raw_text && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Recipe</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
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
