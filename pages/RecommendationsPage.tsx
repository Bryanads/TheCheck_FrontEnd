// bryanads/thecheck_frontend/TheCheck_FrontEnd-70d5044f5e0f688356f30139a56fecb4fa483931/pages/RecommendationsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePresets, useRecommendations } from '../hooks';
import * as api from '../services/api';
import { RecommendationRequest, SpotDailySummary, DailyRecommendation } from '../types'; // Adicionado DailyRecommendation
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

            // Para 'Hoje' e 'Amanhã', a requisição é focada no cache.
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
                request = {
                    cache_key: defaultPreset.name,
                    spot_ids: defaultPreset.spot_ids,
                    day_selection: { type: defaultPreset.day_selection_type, values: defaultPreset.day_selection_values },
                    time_window: { start: defaultPreset.start_time, end: defaultPreset.end_time },
                };
            }

            setFilters(request);
        }
    }, [defaultPreset, activeQuickFilter]);

    // ATUALIZADO: Lógica simplificada no useMemo
    const { topRecommendation, futureRecommendations } = useMemo(() => {
        if (!recommendations || recommendations.length === 0) {
            return { topRecommendation: null, futureRecommendations: [] };
        }

        const nowTimestamp = Date.now();
        let firstFutureSpot: SpotDailySummary | null = null;
        const processedFutureRecommendations: DailyRecommendation[] = [];

        // Encontra a primeira melhor recomendação futura para o card de destaque
        for (const day of recommendations) {
            if (day.ranked_spots && day.ranked_spots.length > 0) {
                for (const spot of day.ranked_spots) {
                    if (new Date(spot.best_hour_utc).getTime() > nowTimestamp) {
                        // Compara com a melhor futura já encontrada (se houver)
                        if (!firstFutureSpot || spot.best_overall_score > firstFutureSpot.best_overall_score) {
                           firstFutureSpot = spot;
                        }
                         // Uma vez encontrada a melhor futura do dia, podemos parar de procurar *neste dia específico*
                         // break; // Opcional: Se só quisermos a primeira hora boa do dia
                    }
                }
            }
            // Continuamos buscando em outros dias por uma pontuação potencialmente ainda maior
        }

        // Filtra as recomendações para a lista (removendo spots passados, exceto para "Hoje")
        recommendations.forEach(day => {
            // Garante que ranked_spots existe antes de filtrar
             if (day.ranked_spots) {
                const filteredSpots = day.ranked_spots.filter(spot =>
                    activeQuickFilter === 'today' || new Date(spot.best_hour_utc).getTime() > nowTimestamp
                );
                if (filteredSpots.length > 0) {
                    processedFutureRecommendations.push({ ...day, ranked_spots: filteredSpots });
                }
             }
        });

        // Define a topRecommendation: a melhor futura encontrada, ou a melhor do primeiro dia se nenhuma futura existir.
        const finalTopRecommendation = firstFutureSpot || recommendations[0]?.ranked_spots?.[0] || null;

        return {
            topRecommendation: finalTopRecommendation,
            futureRecommendations: processedFutureRecommendations
        };
    }, [recommendations, activeQuickFilter]); // Dependências corretas

    // Efeito para pré-carregar os dados do gráfico para a melhor recomendação
    useEffect(() => {
        if (topRecommendation) {
            queryClient.prefetchQuery({
                queryKey: ['forecast', topRecommendation.spot_id],
                queryFn: () => api.getSpotForecast(topRecommendation.spot_id),
                // Adicionar staleTime para evitar refetch imediato se os dados já estiverem frescos
                staleTime: 5 * 60 * 1000 // 5 minutos
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