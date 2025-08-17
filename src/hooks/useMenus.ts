import { useCallback } from 'react';
import {
    getOrCreateMenuWeek,
    updateMenuDay,
    removeRecipeFromDay as apiRemoveRecipeFromDay,
    getRecipes,
} from '../api/menus';
import { useMenuStore } from '../state/menu';
import type { Recipe } from '../types/menu';
import {
    fromMenuWeekDTO,
    toUpdateMenuDayRequest,
    getWeekStart,
    getWeekDays
} from '../types/menu';
import { getCurrentDateInTimezone } from '../utils/dateUtils';

/**
 * Hook for managing menu operations
 */
export function useMenus() {
    const {
        currentWeek,
        currentWeekStart,
        recipeMap,
        isLoading,
        error,
        setCurrentWeek,
        setCurrentWeekStart,
        setRecipeMap,
        setLoading,
        setError,
        addMealToDay,
        removeMealFromDay,
        clearDay
    } = useMenuStore();

    /**
     * Load recipes and cache them
     */
    const loadRecipes = useCallback(async () => {
        try {
            setLoading(true);
            const recipes = await getRecipes();
            setRecipeMap(recipes);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load recipes');
        } finally {
            setLoading(false);
        }
    }, [setRecipeMap, setLoading, setError]);

    /**
     * Load a specific week
     */
    const loadWeek = useCallback(async (weekStart: string) => {
        try {
            setLoading(true);
            setCurrentWeekStart(weekStart);

            // Get or create the week
            const weekDTO = await getOrCreateMenuWeek(weekStart);

            // Transform to internal format (API returns full Recipe objects now)
            const week = fromMenuWeekDTO(weekDTO);

            // Ensure all 7 days exist in the week
            const allDays = getWeekDays(weekStart);
            const existingDayDates = new Set(week.days.map(d => d.date));

            // Add missing days as empty days
            allDays.forEach(date => {
                if (!existingDayDates.has(date)) {
                    week.days.push({
                        date,
                        meals: []
                    });
                }
            });

            // Sort days by date
            week.days.sort((a, b) => a.date.localeCompare(b.date));

            setCurrentWeek(week);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load week');
        } finally {
            setLoading(false);
        }
    }, [setCurrentWeek, setCurrentWeekStart, setLoading, setError]);

    /**
     * Add a recipe to a specific day
     */
    const assignRecipeToDay = useCallback(async (date: string, recipe: Recipe) => {
        if (!currentWeekStart) return;

        // Optimistic update
        addMealToDay(date, recipe);

        try {
            // Get the fresh state after optimistic update
            const freshWeek = useMenuStore.getState().currentWeek;
            const updatedDay = freshWeek?.days.find(d => d.date === date);
            if (!updatedDay) return;

            // Send to API
            const request = toUpdateMenuDayRequest(updatedDay);
            await updateMenuDay(currentWeekStart, request);
            setError(null);
        } catch (err) {
            // Rollback optimistic update
            removeMealFromDay(date, recipe.id);
            setError(err instanceof Error ? err.message : 'Failed to assign recipe');
        }
    }, [currentWeekStart, addMealToDay, removeMealFromDay, setError]);

    /**
     * Remove a recipe from a specific day
     */
    const removeRecipeFromDay = useCallback(async (date: string, recipeId: string) => {
        if (!currentWeekStart) return;

        // Find the recipe for rollback
        const recipe = recipeMap.get(recipeId);
        if (!recipe) return;

        // Optimistic update
        removeMealFromDay(date, recipeId);

        try {
            // Call the delete API
            await apiRemoveRecipeFromDay(currentWeekStart, date, recipeId);

            // Refresh the menu week to get the complete updated data
            const updatedWeek = await getOrCreateMenuWeek(currentWeekStart);
            setCurrentWeek(fromMenuWeekDTO(updatedWeek));
            setError(null);
        } catch (err) {
            // Rollback optimistic update
            addMealToDay(date, recipe);
            setError(err instanceof Error ? err.message : 'Failed to remove recipe');
        }
    }, [currentWeekStart, recipeMap, removeMealFromDay, addMealToDay, setCurrentWeek, setError]);

    /**
     * Clear all meals from a day
     */
    const clearDayMeals = useCallback(async (date: string) => {
        if (!currentWeekStart) return;

        // Store current meals for rollback
        const currentDay = currentWeek?.days.find(d => d.date === date);
        const originalMeals = currentDay?.meals || [];

        // Optimistic update
        clearDay(date);

        try {
            // Send to API (empty meals)
            const request = toUpdateMenuDayRequest({ date, meals: [] });
            await updateMenuDay(currentWeekStart, request);
            setError(null);
        } catch (err) {
            // Rollback optimistic update
            originalMeals.forEach(recipe => addMealToDay(date, recipe));
            setError(err instanceof Error ? err.message : 'Failed to clear day');
        }
    }, [currentWeek, currentWeekStart, clearDay, addMealToDay, setError]);

    /**
     * Navigation helpers
     */
    const goToWeek = useCallback((weekStart: string) => {
        loadWeek(weekStart);
    }, [loadWeek]);

    const goToCurrentWeek = useCallback(() => {
        const today = getCurrentDateInTimezone();
        const weekStart = getWeekStart(today);
        loadWeek(weekStart);
    }, [loadWeek]);

    const goToPreviousWeek = useCallback(() => {
        if (!currentWeekStart) return;
        const current = new Date(currentWeekStart);
        current.setDate(current.getDate() - 7);
        const previousWeekStart = getWeekStart(current);
        loadWeek(previousWeekStart);
    }, [currentWeekStart, loadWeek]);

    const goToNextWeek = useCallback(() => {
        if (!currentWeekStart) return;
        const current = new Date(currentWeekStart);
        current.setDate(current.getDate() + 7);
        const nextWeekStart = getWeekStart(current);
        loadWeek(nextWeekStart);
    }, [currentWeekStart, loadWeek]);

    return {
        // State
        currentWeek,
        currentWeekStart,
        recipeMap,
        isLoading,
        error,

        // Actions
        loadRecipes,
        loadWeek,
        assignRecipeToDay,
        removeRecipeFromDay,
        clearDayMeals,

        // Navigation
        goToWeek,
        goToCurrentWeek,
        goToPreviousWeek,
        goToNextWeek
    };
}
