// bryanads/thecheck_frontend/TheCheck_FrontEnd-7ed86c7f11db5ca4cd2558f01a919a97b26206f5/hooks/index.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as api from '../services/api';
import { ProfileUpdate, PresetCreate, PresetUpdate, PreferenceUpdate, RecommendationRequest } from '../types';

// ... (mantenha todos os outros hooks existentes: useProfile, useSpots, usePresets, etc.) ...

// ===== PROFILE HOOKS =====
export const useProfile = () => useQuery({
  queryKey: ['profile'],
  queryFn: api.getProfile,
});

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: ProfileUpdate) => api.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// ===== SPOTS HOOKS =====
export const useSpots = () => useQuery({
  queryKey: ['spots'],
  queryFn: api.getAllSpots,
  staleTime: 60 * 60 * 1000,
});

// ===== PRESETS HOOKS =====
export const usePresets = () => useQuery({
  queryKey: ['presets'],
  queryFn: api.getPresets,
});

export const useCreatePreset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preset: PresetCreate) => api.createPreset(preset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
};

export const useUpdatePreset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ presetId, updates }: { presetId: number; updates: PresetUpdate }) =>
            api.updatePreset(presetId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presets'] });
        },
    });
};

export const useDeletePreset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presetId: number) => api.deletePreset(presetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
};

// ===== PREFERENCES HOOKS =====
export const useSpotPreferences = (spotId: number) => useQuery({
    queryKey: ['preferences', spotId],
    queryFn: () => api.getSpotPreferences(spotId),
    enabled: !!spotId,
});

export const useUpdateSpotPreferences = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ spotId, updates }: { spotId: number; updates: PreferenceUpdate }) =>
            api.updateSpotPreferences(spotId, updates),
        onSuccess: (_, { spotId }) => {
            queryClient.invalidateQueries({ queryKey: ['preferences', spotId] });
            queryClient.invalidateQueries({ queryKey: ['recommendations'] });
        },
    });
};

// ===== RECOMMENDATIONS HOOKS =====
export const useRecommendations = (request: RecommendationRequest | null) => {
    return useQuery({
        queryKey: ['recommendations', request],
        queryFn: () => api.getRecommendations(request!),
        enabled: !!request,
        placeholderData: keepPreviousData,
    });
};

// ===== NOVO HOOK PARA FORECASTS =====
export const useSpotForecast = (spotId: number | null) => useQuery({
    queryKey: ['forecast', spotId],
    queryFn: () => api.getSpotForecast(spotId!),
    enabled: !!spotId && spotId > 0, // A query só roda se houver um spotId válido
    staleTime: 10 * 60 * 1000, // Previsões podem ser cacheadas por 10 minutos
});