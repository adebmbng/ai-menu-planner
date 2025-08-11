import { create } from 'zustand'

interface UIState {
    currentWeek: string
    selectedRecipe: string | null
    isShoppingListOpen: boolean
    isRecipeModalOpen: boolean
    searchQuery: string
    setCurrentWeek: (week: string) => void
    setSelectedRecipe: (id: string | null) => void
    setShoppingListOpen: (open: boolean) => void
    setRecipeModalOpen: (open: boolean) => void
    setSearchQuery: (query: string) => void
}

export const useUIStore = create<UIState>((set) => ({
    currentWeek: '',
    selectedRecipe: null,
    isShoppingListOpen: false,
    isRecipeModalOpen: false,
    searchQuery: '',
    setCurrentWeek: (week) => set({ currentWeek: week }),
    setSelectedRecipe: (id) => set({ selectedRecipe: id }),
    setShoppingListOpen: (open) => set({ isShoppingListOpen: open }),
    setRecipeModalOpen: (open) => set({ isRecipeModalOpen: open }),
    setSearchQuery: (query) => set({ searchQuery: query }),
}))
