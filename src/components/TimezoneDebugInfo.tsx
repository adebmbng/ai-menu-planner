import { getCurrentDateInTimezone, getConfiguredTimezone, formatDateInTimezone } from '../utils/dateUtils';

/**
 * Component to display current timezone information for debugging
 */
export function TimezoneDebugInfo() {
    const currentDate = getCurrentDateInTimezone();
    const timezone = getConfiguredTimezone();
    const formattedDate = formatDateInTimezone(currentDate);

    // Also show system timezone for comparison
    const systemDate = new Date();
    const systemFormattedDate = systemDate.toISOString().split('T')[0];

    return (
        <div className="p-4 bg-gray-100 border rounded-md text-sm">
            <h3 className="font-semibold mb-2">Timezone Debug Info</h3>
            <p><strong>Configured Timezone:</strong> {timezone}</p>
            <p><strong>Current Date (Configured TZ):</strong> {formattedDate}</p>
            <p><strong>System Date (UTC):</strong> {systemFormattedDate}</p>
            <p><strong>Raw Current Date Object:</strong> {currentDate.toISOString()}</p>
            <p><strong>System Raw Date:</strong> {systemDate.toISOString()}</p>
        </div>
    );
}
