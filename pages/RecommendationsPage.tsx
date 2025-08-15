import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, THECHECK_CACHE_KEY } from '../context/AuthContext';
import { getRecommendations } from '../services/api';
import { Spot, SpotRecommendation, Preset, RecommendationFilters } from '../types';
import { RecommendationFilter } from '../components/recommendation/RecommendationFilter';
import { RecommendationList } from '../components/recommendation/RecommendationList';
import { weekdaysToDayOffset } from '../utils/utils';

const CUSTOM_FILTER_CACHE_KEY = 'thecheck_custom_filter_session';

interface TheCheckCache {
    spots: Spot[];
    presets: Preset[];
    recommendations: {
        [presetId: number]: {
            timestamp: number;
            data: SpotRecommendation[];
        }
    };
}

const RecommendationsPage: React.FC = () => {
    const { userId } = useAuth();
    const [spots, setSpots] = useState<Spot[]>([]);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [recommendations, setRecommendations] = useState<SpotRecommendation[]>([]);
    const [activePreset, setActivePreset] = useState<Preset | null>(null);
    const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Função estável que lê o cache e atualiza o estado
    const loadStateFromCache = useCallback(() => {
        const cachedDataStr = localStorage.getItem(THECHECK_CACHE_KEY);
        if (!cachedDataStr) return;

        const cache: TheCheckCache = JSON.parse(cachedDataStr);
        setSpots(cache.spots || []);
        setPresets(cache.presets || []);

        // Usa o updater do setState para acessar o estado 'activePreset' mais recente
        setActivePreset(currentActivePreset => {
            let presetToDisplay = currentActivePreset;
            // Se o preset ativo foi deletado, ou se nenhum está ativo
            if ((presetToDisplay && !cache.presets.some(p => p.preset_id === presetToDisplay!.preset_id)) || !presetToDisplay) {
                 presetToDisplay = cache.presets.find(p => p.is_default) || cache.presets[0] || null;
            }

            if (presetToDisplay) {
                const recData = cache.recommendations?.[presetToDisplay.preset_id];
                if (recData) {
                    setRecommendations(recData.data);
                    setIsRecommendationLoading(false);
                } else {
                    setRecommendations([]);
                    setIsRecommendationLoading(true); // Ativa o loading
                }
            } else {
                setRecommendations([]);
                setIsRecommendationLoading(false);
            }
            return presetToDisplay;
        });
    }, []); // Sem dependências, a função é estável

    // Efeito para carregar na montagem e ouvir nosso evento customizado
    useEffect(() => {
        loadStateFromCache();

        window.addEventListener('thecheck-cache-updated', loadStateFromCache);
        
        return () => {
            window.removeEventListener('thecheck-cache-updated', loadStateFromCache);
        };
    }, [loadStateFromCache]);


    const handleSearch = useCallback((filters: RecommendationFilters) => {
        setError(null);
        const cachedDataStr = localStorage.getItem(THECHECK_CACHE_KEY);
        if (!cachedDataStr) return;
        const cache: TheCheckCache = JSON.parse(cachedDataStr);

        const matchingPreset = cache.presets.find(p => 
            p.start_time === filters.startTime &&
            p.end_time === filters.endTime &&
            JSON.stringify(p.spot_ids.sort()) === JSON.stringify(filters.selectedSpotIds.sort()) &&
            JSON.stringify(weekdaysToDayOffset(p.weekdays).sort()) === JSON.stringify(filters.dayOffset.sort())
        );

        if (matchingPreset) {
            setActivePreset(matchingPreset);
            const recData = cache.recommendations?.[matchingPreset.preset_id];
            if (recData) {
                setRecommendations(recData.data);
                setIsRecommendationLoading(false);
            } else {
                setRecommendations([]);
                setIsRecommendationLoading(true);
            }
            sessionStorage.removeItem(CUSTOM_FILTER_CACHE_KEY);
        } else {
            // Lógica para filtro personalizado
            setActivePreset(null);
            setIsRecommendationLoading(true);
            setRecommendations([]);
            sessionStorage.setItem(CUSTOM_FILTER_CACHE_KEY, JSON.stringify(filters));

            getRecommendations({
                user_id: userId,
                spot_ids: filters.selectedSpotIds,
                day_offset: filters.dayOffset,
                start_time: filters.startTime,
                end_time: filters.endTime,
            }).then(result => {
                setRecommendations(result);
            }).catch(err => {
                setError(err.message || "Failed to fetch recommendations for custom filter.");
            }).finally(() => {
                setIsRecommendationLoading(false);
            });
        }
    }, [userId]);

    return (
        <div className="space-y-8">
            <RecommendationFilter
                spots={spots}
                presets={presets}
                initialFilters={null}
                onSearch={handleSearch}
                loading={isRecommendationLoading && !activePreset}
            />
            <RecommendationList
                recommendations={recommendations}
                loading={isRecommendationLoading}
                error={error}
            />
        </div>
    );
};

export default RecommendationsPage;