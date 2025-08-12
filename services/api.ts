
import { User } from './types';

const API_BASE_URL = 'http://127.0.0.1:5000';

async function apiFetch<T,>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('thecheck_token');
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // A small delay to simulate network latency for better UX on loading states
    await new Promise(res => setTimeout(res, 500));

    // MOCK API RESPONSES FOR DEMONSTRATION
    console.log(`Mock API call: ${options.method || 'GET'} ${path}`);
    if (path.startsWith('/users/login')) {
      return { token: 'mock-jwt-token', user_id: 'mock-user-id-123', message: 'Login successful' } as T;
    }
    if (path.startsWith('/users/register')) {
      return { message: 'User registered successfully', user_id: 'mock-user-id-456' } as T;
    }
    if (path.startsWith('/users/profile/')) {
        return {
            user_id: 'mock-user-id-123',
            name: 'Kai Lenny',
            email: 'kai@example.com',
            surf_level: 'Expert',
            stance: 'Goofy',
            preferred_wave_direction: 'Right',
            bio: 'Just trying to have fun out there.'
        } as T;
    }
    if (path.startsWith('/spots')) {
        return [
            { spot_id: 1, spot_name: 'Pipeline', latitude: 21.664, longitude: -158.053, timezone: 'Pacific/Honolulu' },
            { spot_id: 2, spot_name: 'Jaws (Peahi)', latitude: 20.950, longitude: -156.300, timezone: 'Pacific/Honolulu' },
            { spot_id: 3, spot_name: 'Trestles', latitude: 33.385, longitude: -117.593, timezone: 'America/Los_Angeles' },
            { spot_id: 4, spot_name: 'Jeffreys Bay', latitude: -34.048, longitude: 24.922, timezone: 'Africa/Johannesburg' },
        ] as T;
    }
    if (path.startsWith('/recommendations')) {
        const recommendations = [
            {
                spot_name: 'Pipeline', spot_id: 1, day_offsets: [
                    { day_offset: 0, recommendations: [
                        { timestamp_utc: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), suitability_score: 88, detailed_scores: { wave_height_score: 90, swell_direction_score: 95, swell_period_score: 85, wind_score: 75, tide_score: 90, water_temperature_score: 100, air_temperature_score: 100, secondary_swell_impact: -5 }, forecast_conditions: { wave_height_sg: 2.5, wave_direction_sg: 310, wave_period_sg: 14, swell_height_sg: 2.4, swell_direction_sg: 310, swell_period_sg: 15, wind_speed_sg: 5, wind_direction_sg: 90, water_temperature_sg: 25, air_temperature_sg: 27, sea_level_sg: 1.2, tide_phase: 'Rising' }, spot_characteristics: {} },
                        { timestamp_utc: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), suitability_score: 95, detailed_scores: { wave_height_score: 95, swell_direction_score: 95, swell_period_score: 90, wind_score: 95, tide_score: 95, water_temperature_score: 100, air_temperature_score: 100, secondary_swell_impact: -2 }, forecast_conditions: { wave_height_sg: 2.8, wave_direction_sg: 310, wave_period_sg: 15, swell_height_sg: 2.7, swell_direction_sg: 310, swell_period_sg: 16, wind_speed_sg: 3, wind_direction_sg: 85, water_temperature_sg: 25, air_temperature_sg: 28, sea_level_sg: 1.8, tide_phase: 'High' }, spot_characteristics: {} },
                    ]},
                ]
            },
            {
                spot_name: 'Trestles', spot_id: 3, day_offsets: [
                    { day_offset: 0, recommendations: [
                        { timestamp_utc: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), suitability_score: 65, detailed_scores: { wave_height_score: 70, swell_direction_score: 80, swell_period_score: 70, wind_score: 50, tide_score: 60, water_temperature_score: 100, air_temperature_score: 100, secondary_swell_impact: -10 }, forecast_conditions: { wave_height_sg: 1.5, wave_direction_sg: 220, wave_period_sg: 12, swell_height_sg: 1.4, swell_direction_sg: 220, swell_period_sg: 13, wind_speed_sg: 12, wind_direction_sg: 270, water_temperature_sg: 20, air_temperature_sg: 22, sea_level_sg: 0.8, tide_phase: 'Rising' }, spot_characteristics: {} },
                    ]}
                ]
            }
        ];
        return recommendations as T;
    }
     if (path.startsWith('/presets')) {
        return [
            { preset_id: 1, user_id: 'mock-user-id-123', preset_name: 'Dawn Patrol', spot_ids: [1, 3], start_time: '06:00', end_time: '09:00', day_offset_default: [0], is_default: true, is_active: true },
            { preset_id: 2, user_id: 'mock-user-id-123', preset_name: 'Weekend Waves', spot_ids: [2, 4], start_time: '09:00', end_time: '15:00', day_offset_default: [0, 1], is_default: false, is_active: true },
        ] as T;
    }


    // This is a fallback for unmocked endpoints.
    // In a real app, this would be the actual fetch call.
    try {
        const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
export const loginUser = (data: object) => apiFetch('/users/login', { method: 'POST', body: JSON.stringify(data) });
export const registerUser = (data: object) => apiFetch('/users/register', { method: 'POST', body: JSON.stringify(data) });
export const getUserProfile = (userId: string) => apiFetch<User>(`/users/profile/${userId}`);
export const updateUserProfile = (userId: string, data: object) => apiFetch(`/users/profile/${userId}`, { method: 'PUT', body: JSON.stringify(data) });

// Spot Endpoints
export const getSpots = () => apiFetch<any[]>('/spots');

// Recommendation Endpoints
export const getRecommendations = (data: object) => apiFetch<any[]>('/recommendations', { method: 'POST', body: JSON.stringify(data) });

// Preset Endpoints
export const getPresets = (userId: string) => apiFetch<any[]>(`/presets?user_id=${userId}`);
export const createPreset = (data: object) => apiFetch('/presets', { method: 'POST', body: JSON.stringify(data) });
export const updatePreset = (presetId: number, data: object) => apiFetch(`/presets/${presetId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePreset = (presetId: number, userId: string) => apiFetch(`/presets/${presetId}?user_id=${userId}`, { method: 'DELETE' });
