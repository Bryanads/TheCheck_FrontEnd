// bryanads/thecheck_frontend/TheCheck_FrontEnd-99e2816aadc115d87eae7a22675f6dd24cc0b9d9/pages/RecommendationsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePresets, useSpots, useRecommendations } from '../hooks';
import * as api from '../services/api';
import { RecommendationRequest, DailyRecommendation } from '../types';
import { RecommendationFilter } from '../components/recommendation/RecommendationFilter';
import { RecommendationView } from '../components/recommendation/RecommendationView';

const RecommendationsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: spots, isLoading: isLoadingSpots } = useSpots();
    const { data: presets, isLoading: isLoadingPresets } = usePresets();

    const [filters, setFilters] = useState<RecommendationRequest | null>(null);
    const [activePresetName, setActivePresetName] = useState<string | null>(null);

    const recommendationRequest = useMemo(() => filters, [filters]);
    const { data: recommendations, isFetching: isRecommendationLoading, error } = useRecommendations(recommendationRequest);

    // *** LÓGICA DE FILTRO NO FRONTEND ***
    const futureRecommendations = useMemo(() => {
        if (!recommendations) return [];

        const now = new Date();

        // 1. Filtra os spots de cada dia para remover os que já passaram
        const filteredDays = recommendations.map(day => {
            const futureSpots = day.ranked_spots.filter(spot => new Date(spot.best_hour_utc) > now);
            return { ...day, ranked_spots: futureSpots };
        });

        // 2. Filtra os dias que ficaram sem nenhum spot após a limpeza
        return filteredDays.filter(day => day.ranked_spots.length > 0);

    }, [recommendations]);


    // Efeito para carregar o preset padrão na primeira vez
    useEffect(() => {
        if (presets && presets.length > 0 && !filters) {
            const defaultPreset = presets.find(p => p.is_default) || presets[0];
            if (defaultPreset) {
                setActivePresetName(defaultPreset.name);
                setFilters({
                    spot_ids: defaultPreset.spot_ids,
                    day_selection: { type: defaultPreset.day_selection_type, values: defaultPreset.day_selection_values },
                    time_window: { start: defaultPreset.start_time, end: defaultPreset.end_time },
                });
            }
        }
    }, [presets, filters]);

    // Efeito para pré-carregar os dados do gráfico (usa a lista filtrada)
    useEffect(() => {
        if (futureRecommendations && futureRecommendations.length > 0 && futureRecommendations[0]?.ranked_spots?.length > 0) {
            const topSpot = futureRecommendations[0].ranked_spots[0];
            if (topSpot) {
                queryClient.prefetchQuery({
                    queryKey: ['forecast', topSpot.spot_id],
                    queryFn: () => api.getSpotForecast(topSpot.spot_id),
                });
            }
        }
    }, [futureRecommendations, queryClient]);

    const handleSearch = (request: RecommendationRequest) => {
        const matchingPreset = presets?.find(p => 
            p.start_time === request.time_window.start &&
            p.end_time === request.time_window.end &&
            p.day_selection_type === request.day_selection.type &&
            JSON.stringify(p.spot_ids.sort()) === JSON.stringify(request.spot_ids.sort()) &&
            JSON.stringify(p.day_selection_values.sort()) === JSON.stringify(request.day_selection.values.sort())
        );
        setActivePresetName(matchingPreset ? matchingPreset.name : 'Custom Filter');
        setFilters(request);
    };

    if (isLoadingSpots || isLoadingPresets) {
        return <div className="text-center p-10"><div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
    }

    return (
        <div className="space-y-8">
            <RecommendationFilter 
                spots={spots || []} 
                presets={presets || []} 
                onSearch={handleSearch} 
                loading={isRecommendationLoading} 
                activePresetName={activePresetName} 
            />
            
            <div className="mt-8">
                {/* Usa a nova variável com os dados já filtrados */}
                <RecommendationView 
                    dailyRecommendations={futureRecommendations}
                    loading={isRecommendationLoading}
                    error={error}
                />
            </div>
        </div>
    );
};

export default RecommendationsPage;