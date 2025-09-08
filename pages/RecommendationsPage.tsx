// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/pages/RecommendationsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { usePresets, useSpots, useGetRecommendations } from '../hooks';
import { RecommendationRequest, Recommendation } from '../types';
import { RecommendationFilter } from '../components/recommendation/RecommendationFilter';
import { ScoreGauge } from '../components/recommendation/ScoreGauge';
import { WaveIcon } from '../components/icons';

const RecommendationsPage: React.FC = () => {
    const { data: spots, isLoading: isLoadingSpots, error: spotsError } = useSpots();
    const { data: presets, isLoading: isLoadingPresets, error: presetsError } = usePresets();
    const { 
        mutate: getRecommendations, 
        data: recommendations, 
        isPending: isRecommendationLoading, 
        error: recommendationsError,
        isSuccess,
        isError
    } = useGetRecommendations();

    const [activePresetName, setActivePresetName] = useState<string | null>(null);

    // Debug logs
    useEffect(() => {
        console.log('🔍 RecommendationsPage Debug:', {
            spots: spots?.length,
            presets: presets?.length,
            recommendations: recommendations?.length,
            isLoadingSpots,
            isLoadingPresets,
            isRecommendationLoading,
            spotsError,
            presetsError,
            recommendationsError,
            isSuccess,
            isError
        });
    }, [spots, presets, recommendations, isLoadingSpots, isLoadingPresets, isRecommendationLoading, spotsError, presetsError, recommendationsError, isSuccess, isError]);

    // Auto-load default preset recommendations
    useEffect(() => {
        if (presets && presets.length > 0 && !recommendations && !activePresetName && !isRecommendationLoading) {
            const defaultPreset = presets.find(p => p.is_default) || presets[0];
            if (defaultPreset) {
                console.log('🚀 Auto-loading recommendations for preset:', defaultPreset);
                setActivePresetName(defaultPreset.name);
                
                const request: RecommendationRequest = {
                    spot_ids: defaultPreset.spot_ids,
                    day_selection: {
                        type: defaultPreset.day_selection_type,
                        values: defaultPreset.day_selection_values
                    },
                    time_window: {
                        start: defaultPreset.start_time,
                        end: defaultPreset.end_time
                    },
                    limit: 10,
                };
                
                console.log('📊 Recommendation request:', request);
                getRecommendations(request);
            }
        }
    }, [presets, getRecommendations, recommendations, activePresetName, isRecommendationLoading]);

    const handleSearch = useCallback((request: RecommendationRequest) => {
        console.log('🔎 Manual search triggered:', request);
        
        const matchingPreset = presets?.find(p => 
            p.start_time === request.time_window.start &&
            p.end_time === request.time_window.end &&
            p.day_selection_type === request.day_selection.type &&
            JSON.stringify(p.spot_ids.sort()) === JSON.stringify(request.spot_ids.sort()) &&
            JSON.stringify(p.day_selection_values.sort()) === JSON.stringify(request.day_selection.values.sort())
        );

        setActivePresetName(matchingPreset ? matchingPreset.name : 'Custom Filter');
        getRecommendations(request);
    }, [getRecommendations, presets]);

    // Loading state
    if (isLoadingSpots || isLoadingPresets) {
        return (
            <div className="text-center p-10">
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-slate-300">Carregando seus dados...</p>
            </div>
        );
    }

    // Error state for initial data
    if (spotsError || presetsError) {
        return (
            <div className="text-center p-10">
                <p className="text-red-400 bg-red-900/50 p-4 rounded">
                    Erro ao carregar dados iniciais: {spotsError?.message || presetsError?.message}
                </p>
            </div>
        );
    }

    // No data state
    if (!spots?.length || !presets?.length) {
        return (
            <div className="text-center p-10">
                <p className="text-yellow-400 bg-yellow-900/50 p-4 rounded">
                    {!spots?.length ? 'Nenhum spot encontrado.' : 'Nenhum preset encontrado. Crie um preset primeiro.'}
                </p>
            </div>
        );
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
                {/* Loading state para recommendations */}
                {isRecommendationLoading && (
                    <div className="text-center p-10">
                        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-slate-300">Buscando as melhores ondas...</p>
                    </div>
                )}

                {/* Error state para recommendations */}
                {isError && recommendationsError && (
                    <div className="text-center p-10">
                        <p className="text-red-400 bg-red-900/50 p-4 rounded">
                            Erro ao buscar recomendações: {recommendationsError instanceof Error ? recommendationsError.message : 'Erro desconhecido'}
                        </p>
                    </div>
                )}
                
                {/* Success state */}
                {isSuccess && !isRecommendationLoading && (
                    recommendations && recommendations.length > 0 ? (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Recomendações {activePresetName && `- ${activePresetName}`} ({recommendations.length})
                            </h2>
                            {recommendations.map((rec, index) => (
                                <div key={index} className="bg-slate-800 p-4 rounded-lg flex items-center justify-between shadow-md">
                                    <div>
                                        <p className="text-xl font-bold text-white">{rec.spot_name}</p>
                                        <p className="text-slate-300">{new Date(rec.timestamp_utc).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                                        <p className="text-cyan-400 font-semibold text-lg">{new Date(rec.timestamp_utc).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <ScoreGauge score={rec.overall_score} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-10 bg-slate-800/50 rounded-xl">
                            <WaveIcon className="w-12 h-12 mx-auto text-slate-500" />
                            <h3 className="mt-4 text-xl font-bold text-white">Nenhuma onda encontrada</h3>
                            <p className="text-slate-400">Não encontramos boas recomendações com os filtros selecionados. Tente ajustar os horários ou spots.</p>
                        </div>
                    )
                )}

                {/* Debug info em desenvolvimento */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-slate-900 rounded text-xs text-slate-400">
                        <h4 className="font-bold mb-2">Debug Info:</h4>
                        <pre>{JSON.stringify({
                            spotsCount: spots?.length,
                            presetsCount: presets?.length,
                            recommendationsCount: recommendations?.length,
                            activePresetName,
                            isRecommendationLoading,
                            isSuccess,
                            isError,
                            hasError: !!recommendationsError
                        }, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationsPage;