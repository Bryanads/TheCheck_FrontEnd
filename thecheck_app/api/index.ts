import { supabase } from './supabaseClient';
import { Profile } from '../types'; // Assumindo que você terá um arquivo de tipos

const API_BASE_URL = 'http://127.0.0.1:8000'; // URL da sua API local

// Função auxiliar para fazer as chamadas à API
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

// Endpoint para buscar o perfil do usuário
export const getUserProfile = () => {
    return apiFetch<Profile>('/profile');
};