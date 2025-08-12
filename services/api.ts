import { User } from '../types';

const API_BASE_URL = 'http://127.0.0.1:5000'; // Your FastAPI backend URL

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('thecheck_token');
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
            throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
}

// User Endpoints
export const loginUser = (data: object) => {
    console.log("Enviando para /users/login:", JSON.stringify(data, null, 2));
    return apiFetch<{token: string, user_id: string, message: string}>('/users/login', { method: 'POST', body: JSON.stringify(data) });
};

export const registerUser = (data: object) => {
    console.log("Enviando para /users/register:", JSON.stringify(data, null, 2));
    return apiFetch<{message: string, user_id: string}>('/users/register', { method: 'POST', body: JSON.stringify(data) });
};

export const getUserProfile = (userId: string) => {
    console.log(`Buscando perfil para o usuário: ${userId}`);
    return apiFetch<User>(`/users/profile/${userId}`);
};

export const updateUserProfile = (userId: string, data: object) => {
    console.log(`Atualizando perfil para o usuário: ${userId} com dados:`, JSON.stringify(data, null, 2));
    return apiFetch<{message: string, user: User}>(`/users/profile/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
};

// Spot Endpoints
export const getSpots = () => {
    console.log("Buscando todos os spots...");
    return apiFetch<any[]>('/spots'); // Returns an array of spot objects
};

// Forecast Endpoints
export const getForecasts = (data: { spot_ids: number[], day_offset: number[] }) => {
    console.log("Enviando para /forecasts:", JSON.stringify(data, null, 2));
    return apiFetch<any[]>('/forecasts', { method: 'POST', body: JSON.stringify(data) });
};

// Recommendation Endpoints
export const getRecommendations = (data: object) => {
    console.log("Enviando para /recommendations:", JSON.stringify(data, null, 2));
    return apiFetch<any[]>('/recommendations', { method: 'POST', body: JSON.stringify(data) });
};

// Preset Endpoints
export const getPresets = (userId: string) => {
    console.log(`Buscando presets para o usuário: ${userId}`);
    return apiFetch<any[]>(`/presets?user_id=${userId}`);
};

export const createPreset = (data: object) => {
    console.log("Enviando para /presets (create):", JSON.stringify(data, null, 2));
    return apiFetch<{message: string, preset_id: number}>('/presets', { method: 'POST', body: JSON.stringify(data) });
};

export const updatePreset = (presetId: number, data: object) => {
    console.log(`Atualizando preset: ${presetId} com dados:`, JSON.stringify(data, null, 2));
    return apiFetch<{message: string}>(`/presets/${presetId}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const deletePreset = (presetId: number, userId: string) => {
    console.log(`Deletando o preset: ${presetId} para o usuário: ${userId}`);
    return apiFetch<{message: string}>(`/presets/${presetId}?user_id=${userId}`, { method: 'DELETE' });
};