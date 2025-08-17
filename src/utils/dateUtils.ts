/**
 * Date utilities that respect the configured timezone
 */

/**
 * Get the configured timezone from environment variables
 */
export function getConfiguredTimezone(): string {
    return import.meta.env.VITE_TIMEZONE || 'UTC';
}

/**
 * Get the current date in the configured timezone
 */
export function getCurrentDateInTimezone(): Date {
    const timezone = getConfiguredTimezone();
    const now = new Date();

    // Convert to the target timezone
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + getTimezoneOffset(timezone));

    return targetTime;
}

/**
 * Create a Date object from a date string, interpreting it in the configured timezone
 */
export function createDateInTimezone(dateString: string): Date {
    const timezone = getConfiguredTimezone();

    // Parse the date string as if it's in the target timezone
    const date = new Date(dateString + 'T00:00:00');
    const utc = date.getTime() - getTimezoneOffset(timezone);

    return new Date(utc);
}

/**
 * Format a date to YYYY-MM-DD string in the configured timezone
 */
export function formatDateInTimezone(date: Date): string {
    const timezone = getConfiguredTimezone();

    // Get the date in the target timezone
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetDate = new Date(utc + getTimezoneOffset(timezone));

    return targetDate.toISOString().split('T')[0];
}

/**
 * Get timezone offset in milliseconds for a given timezone
 * This is a simplified implementation - for production, consider using a library like date-fns-tz
 */
function getTimezoneOffset(timezone: string): number {
    // Map of common Asian timezones to their UTC offsets in milliseconds
    const timezoneOffsets: Record<string, number> = {
        'Asia/Jakarta': 7 * 60 * 60 * 1000,      // UTC+7
        'Asia/Singapore': 8 * 60 * 60 * 1000,    // UTC+8
        'Asia/Tokyo': 9 * 60 * 60 * 1000,        // UTC+9
        'Asia/Manila': 8 * 60 * 60 * 1000,       // UTC+8
        'Asia/Bangkok': 7 * 60 * 60 * 1000,      // UTC+7
        'Asia/Kuala_Lumpur': 8 * 60 * 60 * 1000, // UTC+8
        'UTC': 0,
    };

    return timezoneOffsets[timezone] || 0;
}

/**
 * Get the start of the week (Monday) for a given date in the configured timezone
 */
export function getWeekStartInTimezone(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    d.setDate(diff);
    return formatDateInTimezone(d);
}

/**
 * Get all days of the week starting from a given week start date in the configured timezone
 */
export function getWeekDaysInTimezone(weekStart: string): string[] {
    const days = [];
    const start = createDateInTimezone(weekStart);

    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days.push(formatDateInTimezone(day));
    }
    return days;
}
