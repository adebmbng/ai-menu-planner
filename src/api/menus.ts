import { apiGet, apiPost, apiPut } from './client';
import type {
    MenuWeekDTO,
    CreateMenuRequest,
    UpdateMenuDayRequest,
    Recipe
} from '../types/menu';

const MENUS_BASE = '/api/v1/meal-planner/menus';

/**
 * Get all menu weeks
 */
export async function getMenuWeeks(): Promise<MenuWeekDTO[]> {
    return apiGet(`${MENUS_BASE}/weeks`);
}

/**
 * Get a specific menu week by week_start date
 */
export async function getMenuWeek(weekStart: string): Promise<MenuWeekDTO> {
    return apiGet(`${MENUS_BASE}/weeks/${weekStart}`);
}

/**
 * Create a new menu week
 */
export async function createMenuWeek(menu: MenuWeekDTO): Promise<MenuWeekDTO> {
    return apiPost(`${MENUS_BASE}/weeks`, { menu } as CreateMenuRequest);
}

/**
 * Update or append a day in a menu week
 */
export async function updateMenuDay(
    weekStart: string,
    dayRequest: UpdateMenuDayRequest
): Promise<MenuWeekDTO> {
    return apiPut(`${MENUS_BASE}/weeks/${weekStart}/days`, dayRequest);
}

/**
 * Get or create a menu week - handles auto-creation for non-existent weeks
 */
export async function getOrCreateMenuWeek(weekStart: string): Promise<MenuWeekDTO> {
    try {
        return await getMenuWeek(weekStart);
    } catch (error) {
        // If week doesn't exist (404), create an empty one
        if (error instanceof Error && error.message.includes('404')) {
            const emptyWeek: MenuWeekDTO = {
                week_start: weekStart,
                days: [],
                notes: ''
            };
            return await createMenuWeek(emptyWeek);
        }
        throw error;
    }
}

// Recipe-related API functions (from existing recipes endpoint)
const RECIPES_BASE = '/api/v1/meal-planner/recipes';

/**
 * Get all recipes
 */
export async function getRecipes(q?: string, tags?: string): Promise<Recipe[]> {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (tags) params.append('tags', tags);

    const queryString = params.toString();
    return apiGet(`${RECIPES_BASE}${queryString ? '?' + queryString : ''}`);
}

/**
 * Get a single recipe by ID
 */
export async function getRecipe(recipeId: string): Promise<Recipe> {
    return apiGet(`${RECIPES_BASE}/${recipeId}`);
}

/**
 * Ingest a new recipe from raw text
 */
export async function ingestRecipe(rawText: string, tags: string[] = []): Promise<Recipe> {
    return apiPost(`${RECIPES_BASE}/ingest`, {
        raw_text: rawText,
        tags
    });
}
