import { create } from 'zustand'

interface UIState {
    currentWeek: string
    selectedRecipe: string | null
    isShoppingListOpen: boolean
    isRecipeModalOpen: boolean
    isRecipeDetailModalOpen: boolean
    selectedRecipeId: string | null
    searchQuery: string
    setCurrentWeek: (week: string) => void
    setSelectedRecipe: (id: string | null) => void
    setShoppingListOpen: (open: boolean) => void
    setRecipeModalOpen: (open: boolean) => void
    setRecipeDetailModalOpen: (open: boolean) => void
    setSelectedRecipeId: (id: string | null) => void
    setSearchQuery: (query: string) => void
}

export const useUIStore = create<UIState>((set) => ({
    currentWeek: '',
    selectedRecipe: null,
    isShoppingListOpen: false,
    isRecipeModalOpen: false,
    isRecipeDetailModalOpen: false,
    selectedRecipeId: null,
    searchQuery: '',
    setCurrentWeek: (week) => set({ currentWeek: week }),
    setSelectedRecipe: (id) => set({ selectedRecipe: id }),
    setShoppingListOpen: (open) => set({ isShoppingListOpen: open }),
    setRecipeModalOpen: (open) => set({ isRecipeModalOpen: open }),
    setRecipeDetailModalOpen: (open) => set({ isRecipeDetailModalOpen: open }),
    setSelectedRecipeId: (id) => set({ selectedRecipeId: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),
}))
