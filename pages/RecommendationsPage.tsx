import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSpots, getRecommendations, getPresets } from '../services/api';
import { Spot, SpotRecommendation, Preset, RecommendationFilters } from '../types';
import { RecommendationFilter } from '../components/recommendation/RecommendationFilter';
import { RecommendationList } from '../components/recommendation/RecommendationList';

// Chaves de cache
const RECOMMENDATIONS_CACHE_KEY = 'thecheck_recommendations';
const DEFAULT_PRESET_CACHE_KEY = 'thecheck_default_preset';

const RecommendationsPage: React.FC = () => {
    const { userId } = useAuth();
    
    // Estados principais gerenciados pela página
    const [spots, setSpots] = useState<Spot[]>([]);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [recommendations, setRecommendations] = useState<SpotRecommendation[]>([]);
    const [activeFilters, setActiveFilters] = useState<RecommendationFilters | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Função para buscar as recomendações, chamada pelo componente de filtro
    const handleSearch = useCallback(async (filters: RecommendationFilters) => {
        if (!userId) return;
        
        setActiveFilters(filters);
        setLoading(true);
        setError(null);
        
        try {
            const data = {
                user_id: userId,
                spot_ids: filters.selectedSpotIds,
                day_offset: filters.dayOffset,
                start_time: filters.startTime,
                end_time: filters.endTime
            };
            const result = await getRecommendations(data);
            setRecommendations(result);
            sessionStorage.setItem(RECOMMENDATIONS_CACHE_KEY, JSON.stringify(result));
        } catch (err: any) {
            setError(err.message || "Failed to fetch recommendations.");
            setRecommendations([]); // Limpa recomendações em caso de erro
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Efeito para carregar dados iniciais e definir filtros padrão
    useEffect(() => {
        if (!userId) return;

        const initialize = async () => {
            setLoading(true);
            try {
                // Carrega spots e presets da API
                const [spotsData, presetsData] = await Promise.all([getSpots(), getPresets(userId)]);
                setSpots(spotsData);
                setPresets(presetsData);

                // Carrega recomendações do cache da sessão, se existirem
                const cachedRecs = sessionStorage.getItem(RECOMMENDATIONS_CACHE_KEY);
                if (cachedRecs) {
                    setRecommendations(JSON.parse(cachedRecs));
                }

                // Define os filtros iniciais (do cache de preset ou do padrão da API)
                let initialFilters: RecommendationFilters | null = null;
                const cachedPresetStr = localStorage.getItem(DEFAULT_PRESET_CACHE_KEY);
                const serverDefaultPreset = presetsData.find(p => p.is_default);

                if (serverDefaultPreset) {
                    localStorage.setItem(DEFAULT_PRESET_CACHE_KEY, JSON.stringify(serverDefaultPreset));
                }
                
                const presetToUse = cachedPresetStr ? JSON.parse(cachedPresetStr) : serverDefaultPreset;

                if (presetToUse) {
                    initialFilters = {
                        selectedSpotIds: presetToUse.spot_ids,
                        dayOffset: presetToUse.day_offset_default,
                        startTime: presetToUse.start_time,
                        endTime: presetToUse.end_time,
                    };
                } else if (spotsData.length > 0) {
                     initialFilters = {
                        selectedSpotIds: [spotsData[0].spot_id],
                        dayOffset: [0],
                        startTime: '06:00',
                        endTime: '18:00',
                    };
                }
                
                setActiveFilters(initialFilters);

                // Se não houver cache de recomendações e houver filtros, busca na API
                if (!cachedRecs && initialFilters) {
                    await handleSearch(initialFilters);
                } else {
                    setLoading(false);
                }

            } catch (err) {
                setError('Failed to load initial data.');
                setLoading(false);
            }
        };

        initialize();
    }, [userId, handleSearch]);
    
    return (
        <div className="space-y-8">
            <RecommendationFilter
                spots={spots}
                presets={presets}
                initialFilters={activeFilters}
                onSearch={handleSearch}
                loading={loading && recommendations.length === 0} // Mostra loading no botão apenas na busca inicial
            />
            <RecommendationList
                recommendations={recommendations}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default RecommendationsPage;