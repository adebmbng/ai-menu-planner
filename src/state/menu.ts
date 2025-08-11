import { create } from 'zustand';
import type { MenuWeek, Recipe } from '../types/menu';

interface MenuState {
    // Current week being viewed/edited
    currentWeek: MenuWeek | null;
    currentWeekStart: string | null;

    // Recipe cache for quick lookups
    recipeMap: Map<string, Recipe>;

    // UI state
    isLoading: boolean;
    error: string | null;

    // Actions
    setCurrentWeek: (week: MenuWeek) => void;
    setCurrentWeekStart: (weekStart: string) => void;
    setRecipeMap: (recipes: Recipe[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Optimistic updates for meal assignments
    addMealToDay: (date: string, recipe: Recipe) => void;
    removeMealFromDay: (date: string, recipeId: string) => void;
    clearDay: (date: string) => void;
}

export const useMenuStore = create<MenuState>()((set, get) => ({
    // Initial state
    currentWeek: null,
    currentWeekStart: null,
    recipeMap: new Map(),
    isLoading: false,
    error: null,

    // Actions
    setCurrentWeek: (week) => set({ currentWeek: week }),
    setCurrentWeekStart: (weekStart) => set({ currentWeekStart: weekStart }),

    setRecipeMap: (recipes) => {
        const map = new Map();
        recipes.forEach(recipe => map.set(recipe.id, recipe));
        set({ recipeMap: map });
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Optimistic meal management
    addMealToDay: (date, recipe) => {
        const { currentWeek } = get();
        if (!currentWeek) return;

        const updatedWeek = { ...currentWeek };
        updatedWeek.days = currentWeek.days.map(day => {
            if (day.date === date) {
                return {
                    ...day,
                    meals: [...day.meals, recipe]
                };
            }
            return day;
        });

        // If day doesn't exist yet, create it
        if (!updatedWeek.days.find(d => d.date === date)) {
            updatedWeek.days.push({
                date,
                meals: [recipe]
            });
            // Sort days by date
            updatedWeek.days.sort((a, b) => a.date.localeCompare(b.date));
        }

        set({ currentWeek: updatedWeek });
    },

    removeMealFromDay: (date, recipeId) => {
        const { currentWeek } = get();
        if (!currentWeek) return;

        const updatedWeek = { ...currentWeek };
        updatedWeek.days = currentWeek.days.map(day => {
            if (day.date === date) {
                return {
                    ...day,
                    meals: day.meals.filter(meal => meal.id !== recipeId)
                };
            }
            return day;
        });

        set({ currentWeek: updatedWeek });
    },

    clearDay: (date) => {
        const { currentWeek } = get();
        if (!currentWeek) return;

        const updatedWeek = { ...currentWeek };
        updatedWeek.days = currentWeek.days.map(day => {
            if (day.date === date) {
                return {
                    ...day,
                    meals: []
                };
            }
            return day;
        });

        set({ currentWeek: updatedWeek });
    }
}));
