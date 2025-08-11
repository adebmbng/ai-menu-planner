const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_KEY = import.meta.env.VITE_API_KEY || 'api-key'

/**
 * Creates default headers for API requests including the Bearer token
 */
function getDefaultHeaders(): HeadersInit {
    return {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
    }
}

/**
 * Enhanced fetch wrapper with Bearer token authentication
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
        ...options,
        headers: {
            ...getDefaultHeaders(),
            ...options.headers,
        },
    }

    const response = await fetch(url, config)

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response
}

/**
 * Convenience method for GET requests
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
    const response = await apiFetch(endpoint)
    return response.json()
}

/**
 * Convenience method for POST requests
 */
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
    const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    })
    return response.json()
}

/**
 * Convenience method for PUT requests
 */
export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
    const response = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
    return response.json()
}

/**
 * Convenience method for DELETE requests
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
    const response = await apiFetch(endpoint, {
        method: 'DELETE',
    })
    return response.json()
}
