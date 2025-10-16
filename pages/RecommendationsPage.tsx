// src/pages/RecommendationsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePresets, useRecommendations } from '../hooks';
import * as api from '../services/api';
import { RecommendationRequest, SpotDailySummary } from '../types';
import { RecommendationView } from '../components/recommendation/RecommendationView';
import { DashboardHighlight } from '../components/recommendation/DashboardHighlight';
import { QuickFilters, QuickFilterOption } from '../components/recommendation/QuickFilters';

const RecommendationsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: presets, isLoading: isLoadingPresets } = usePresets();

    // Encontra o preset padrão do usuário de forma segura
    const defaultPreset = useMemo(() => presets?.find(p => p.is_default) || presets?.[0], [presets]);

    const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterOption>('today');
    const [filters, setFilters] = useState<RecommendationRequest | null>(null);

    const { data: recommendations, isFetching: isRecommendationLoading, error } = useRecommendations(filters);

    useEffect(() => {
        // Só monta a requisição se o preset padrão já foi carregado
        if (defaultPreset) {
            let request: RecommendationRequest;
            const filterKey = activeQuickFilter;

            // Para 'Hoje' e 'Amanhã', a requisição é super simples, focada no cache.
            // A API vai inferir o resto, mas enviamos dados mínimos para consistência.
            if (filterKey === 'today' || filterKey === 'tomorrow') {
                request = {
                    cache_key: filterKey,
                    // Dados mínimos para o schema (não serão usados se o cache funcionar)
                    spot_ids: defaultPreset.spot_ids,
                    day_selection: { type: 'offsets', values: filterKey === 'today' ? [0] : [1] },
                    time_window: { start: defaultPreset.start_time, end: defaultPreset.end_time },
                };
            } else {
                // Para o preset padrão, enviamos a requisição completa.
                // Isso permite que a API use o cache (se a chave bater) ou calcule em tempo real como fallback.
                request = {
                    cache_key: defaultPreset.name,
                    spot_ids: defaultPreset.spot_ids,
                    day_selection: { type: defaultPreset.day_selection_type, values: defaultPreset.day_selection_values },
                    time_window: { start: defaultPreset.start_time, end: defaultPreset.end_time },
                };
            }

            setFilters(request);
        }
    }, [defaultPreset, activeQuickFilter]); // Roda sempre que o preset ou o filtro ativo mudar

    const { topRecommendation, futureRecommendations } = useMemo(() => {
        if (!recommendations) return { topRecommendation: null, futureRecommendations: [] };

        const now_utc_timestamp = Date.now();
        let topRec: SpotDailySummary | null = null;

        const filteredDays = recommendations.map(day => {
            let spotsForDay = day.ranked_spots;

            // Aplica o filtro de tempo apenas para dias futuros, não para "Hoje"
            if (activeQuickFilter !== 'today') {
                spotsForDay = day.ranked_spots.filter(spot => new Date(spot.best_hour_utc).getTime() > now_utc_timestamp);
            }

            // A lógica para o card de destaque ainda tenta priorizar a melhor onda futura
            const futureSpotsForTopRec = day.ranked_spots.filter(spot => new Date(spot.best_hour_utc).getTime() > now_utc_timestamp);
            if (futureSpotsForTopRec.length > 0) {
                if (!topRec || futureSpotsForTopRec[0].best_overall_score > topRec.best_overall_score) {
                    topRec = futureSpotsForTopRec[0];
                }
            }

            return { ...day, ranked_spots: spotsForDay };
        }).filter(day => day.ranked_spots.length > 0);

        // Se nenhuma onda futura foi encontrada, exibe a melhor de hoje no card, mesmo que já tenha passado
        if (!topRec && filteredDays.length > 0 && filteredDays[0].ranked_spots.length > 0) {
            topRec = filteredDays[0].ranked_spots[0];
        }

        return { topRecommendation: topRec, futureRecommendations: filteredDays };
    }, [recommendations, activeQuickFilter]);

    // Efeito para pré-carregar os dados do gráfico para a melhor recomendação
    useEffect(() => {
        if (topRecommendation) {
            queryClient.prefetchQuery({
                queryKey: ['forecast', topRecommendation.spot_id],
                queryFn: () => api.getSpotForecast(topRecommendation.spot_id),
            });
        }
    }, [topRecommendation, queryClient]);

    if (isLoadingPresets) {
        return <div className="text-center p-10"><div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
    }

    return (
        <div className="space-y-8">
            <DashboardHighlight topRecommendation={topRecommendation} />
            <QuickFilters
                activeFilter={activeQuickFilter}
                onFilterChange={setActiveQuickFilter}
                defaultPresetName={defaultPreset?.name || null}
                loading={isRecommendationLoading}
            />
            <div className="mt-8">
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