// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/hooks/index.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';
import { ProfileUpdate, PresetCreate, PresetUpdate, PreferenceUpdate, RecommendationRequest } from '../types';

// ===== PROFILE HOOKS =====
export const useProfile = () => useQuery({
  queryKey: ['profile'],
  queryFn: api.getProfile,
  retry: 2,
  staleTime: 5 * 60 * 1000, // 5 minutos
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
  retry: 2,
});

// Função auxiliar para buscar spots (usado em alguns lugares como LoadingPage)
export const getSpots = api.getAllSpots;

// ===== PRESETS HOOKS =====
export const usePresets = () => useQuery({
  queryKey: ['presets'],
  queryFn: api.getPresets,
  retry: 2,
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
  enabled: !!spotId && spotId > 0, // Só executa se spotId for válido
  retry: 2,
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

// ===== RECOMMENDATIONS HOOKS =====
export const useGetRecommendations = () => {
  return useMutation({
    mutationKey: ['get-recommendations'], // Adiciona mutationKey para aparecer no DevTools
    mutationFn: async (request: RecommendationRequest) => {
      console.log('🔥 useGetRecommendations - Starting request:', request);
      
      try {
        const result = await api.getRecommendations(request);
        console.log('✅ useGetRecommendations - Success:', result);
        return result;
      } catch (error) {
        console.error('❌ useGetRecommendations - Error:', error);
        throw error;
      }
    },
    retry: 1,
    onMutate: (variables) => {
      console.log('⏳ useGetRecommendations - onMutate:', variables);
    },
    onSuccess: (data, variables) => {
      console.log('🎉 useGetRecommendations - onSuccess:', { data: data?.length, variables });
    },
    onError: (error, variables) => {
      console.error('💥 useGetRecommendations - onError:', { error, variables });
    },
    onSettled: (data, error, variables) => {
      console.log('🏁 useGetRecommendations - onSettled:', { 
        hasData: !!data, 
        hasError: !!error, 
        variables 
      });
    }
  });
};

// ===== ALTERNATIVE: Query-based recommendations (caso queira testar) =====
export const useRecommendationsQuery = (request: RecommendationRequest | null) => {
  return useQuery({
    queryKey: ['recommendations', request],
    queryFn: () => {
      if (!request) throw new Error('No request provided');
      console.log('🔥 useRecommendationsQuery - Starting:', request);
      return api.getRecommendations(request);
    },
    enabled: !!request,
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// ===== FORECASTS HOOKS (caso você precise no futuro) =====
export const useSpotForecast = (spotId: number) => useQuery({
  queryKey: ['forecast', spotId],
  queryFn: () => api.getSpotForecast(spotId),
  enabled: !!spotId && spotId > 0,
  retry: 2,
  staleTime: 10 * 60 * 1000, // 10 minutos - forecasts mudam com menos frequência
});

// ===== UTILITY FUNCTIONS (re-exports das funções da API para compatibilidade) =====
export const getPresets = api.getPresets;
export const getRecommendations = api.getRecommendations;
export const createPreset = api.createPreset;
export const updateSpotPreferences = api.updateSpotPreferences;