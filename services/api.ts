// bryanads/thecheck_frontend/TheCheck_FrontEnd-a52b3568a35c7807a1797de0fa3a908a8d5dfe5c/services/api.ts
import { supabase } from '../supabaseClient';
import {
    Profile, ProfileUpdate, Spot, Preset, PresetCreate, PresetUpdate,
    Preference, PreferenceUpdate, SpotForecast, DailyRecommendation, RecommendationRequest
} from '../types';

// const API_BASE_URL = 'https://thecheckapi.onrender.com';
const API_BASE_URL = 'http://localhost:8000';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: 'An unknown error occurred',
                status: response.status
            }));

            const error = new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
            (error as any).status = response.status;
            throw error;
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

// ===== PROFILE API =====
export const getProfile = (): Promise<Profile> => apiFetch('/profile');
export const updateProfile = (updates: ProfileUpdate): Promise<Profile> =>
    apiFetch('/profile', { method: 'PUT', body: JSON.stringify(updates) });

// ===== SPOTS API =====
export const getAllSpots = (): Promise<Spot[]> => apiFetch('/spots');
export const getSpotById = (spotId: number): Promise<Spot> => apiFetch(`/spots/${spotId}`);

// ===== PRESETS API =====
export const getPresets = (): Promise<Preset[]> => apiFetch('/presets');
export const createPreset = (preset: PresetCreate): Promise<Preset> =>
    apiFetch('/presets', { method: 'POST', body: JSON.stringify(preset) });
export const updatePreset = (presetId: number, updates: PresetUpdate): Promise<Preset> =>
    apiFetch(`/presets/${presetId}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deletePreset = (presetId: number): Promise<void> =>
    apiFetch(`/presets/${presetId}`, { method: 'DELETE' });

// ===== PREFERENCES API =====
export const getSpotPreferences = (spotId: number): Promise<Preference> =>
    apiFetch(`/preferences/spot/${spotId}`);
export const updateSpotPreferences = (spotId: number, updates: PreferenceUpdate): Promise<Preference> =>
    apiFetch(`/preferences/spot/${spotId}`, { method: 'PUT', body: JSON.stringify(updates) });

// ===== FORECASTS API =====
export const getSpotForecast = (spotId: number): Promise<SpotForecast> =>
    apiFetch(`/forecasts/spot/${spotId}`);

// ===== RECOMMENDATIONS API =====
// CORREÇÃO: A função agora retorna uma Promise do novo tipo DailyRecommendation[]
export const getRecommendations = (request: RecommendationRequest): Promise<DailyRecommendation[]> =>
    apiFetch('/recommendations', { method: 'POST', body: JSON.stringify(request) });