// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/hooks/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';
import { ProfileUpdate, PresetCreate, PresetUpdate, PreferenceUpdate, RecommendationRequest } from '../types';

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
  staleTime: 60 * 60 * 1000, // Cache spots for 1 hour
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
    enabled: !!spotId, // Only run if spotId is valid
});

export const useUpdateSpotPreferences = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ spotId, updates }: { spotId: number; updates: PreferenceUpdate }) =>
            api.updateSpotPreferences(spotId, updates),
        onSuccess: (_, { spotId }) => {
            queryClient.invalidateQueries({ queryKey: ['preferences', spotId] });
            queryClient.invalidateQueries({ queryKey: ['recommendations'] }); // Invalidate recommendations as well
        },
    });
};


// ===== RECOMMENDATIONS HOOKS (Mutation for on-demand fetching) =====
export const useGetRecommendations = () => {
    return useMutation({
        mutationFn: (request: RecommendationRequest) => api.getRecommendations(request),
    });
};