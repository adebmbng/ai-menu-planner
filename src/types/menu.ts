// Menu-related types matching the API schema but with Recipe objects

export interface Recipe {
    id: string;
    title: string;
    raw_text: string;
    ingredients: IngredientLine[];
    steps: string[];
    tags: string[];
    cuisine?: string;
    diet?: string;
    time_minutes?: number;
    servings?: number;
    extra: Record<string, string>;
}

export interface IngredientLine {
    name: string;
    qty?: number;
    unit?: string;
    notes?: string;
}

// Internal types for frontend use
export interface MenuDay {
    date: string; // YYYY-MM-DD format
    meals: Recipe[]; // Array of full recipe objects
}

export interface MenuWeek {
    week_start: string; // YYYY-MM-DD format (Monday)
    days: MenuDay[];
    notes?: string;
}

// API DTO types (what the backend expects/returns)
export interface MenuDayDTO {
    date: string;
    meals?: Recipe[]; // Array of full recipe objects (API returns full recipes)
}

export interface MenuWeekDTO {
    week_start: string;
    days: MenuDayDTO[];
    notes?: string;
}

export interface UpdateMenuDayRequest {
    date: string;
    recipe_ids: string[];
}

export interface CreateMenuRequest {
    menu: MenuWeekDTO;
}

// Transform functions between API DTOs and internal types
export function fromMenuWeekDTO(dto: MenuWeekDTO): MenuWeek {
    // Generate all 7 days of the week
    const allWeekDays = getWeekDays(dto.week_start);

    // Create a map of existing days from API
    const dayMap = new Map<string, MenuDayDTO>();
    dto.days.forEach(day => {
        dayMap.set(day.date, day);
    });

    // Ensure all 7 days are present
    const days = allWeekDays.map(date => {
        const existingDay = dayMap.get(date);
        return {
            date,
            meals: existingDay?.meals || [] // Use existing meals or empty array
        };
    });

    return {
        week_start: dto.week_start,
        notes: dto.notes,
        days
    };
}

export function toMenuWeekDTO(menu: MenuWeek): MenuWeekDTO {
    return {
        week_start: menu.week_start,
        notes: menu.notes,
        days: menu.days.map(day => ({
            date: day.date,
            meals: day.meals // Send full Recipe objects
        }))
    };
}

export function toUpdateMenuDayRequest(day: MenuDay): UpdateMenuDayRequest {
    return {
        date: day.date,
        recipe_ids: day.meals.map(recipe => recipe.id)
    };
}

// Import timezone-aware date utilities
import { getWeekStartInTimezone, getWeekDaysInTimezone } from '../utils/dateUtils';

// Helper functions
export function getWeekStart(date: Date): string {
    return getWeekStartInTimezone(date);
}

export function getWeekDays(weekStart: string): string[] {
    return getWeekDaysInTimezone(weekStart);
}
