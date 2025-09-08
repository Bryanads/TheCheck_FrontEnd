// bryanads/thecheck_frontend/TheCheck_FrontEnd-7ed86c7f11db5ca4cd2558f01a919a97b26206f5/pages/RecommendationsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePresets, useSpots, useRecommendations } from '../hooks';
import { RecommendationRequest } from '../types';
import { RecommendationFilter } from '../components/recommendation/RecommendationFilter';
import { ScoreGauge } from '../components/recommendation/ScoreGauge';
import { WaveIcon } from '../components/icons';

const RecommendationsPage: React.FC = () => {
    const { data: spots, isLoading: isLoadingSpots } = useSpots();
    const { data: presets, isLoading: isLoadingPresets } = usePresets();

    const [filters, setFilters] = useState<RecommendationRequest | null>(null);
    const [activePresetName, setActivePresetName] = useState<string | null>(null);

    const recommendationRequest = useMemo(() => filters, [filters]);
    const { data: recommendations, isFetching: isRecommendationLoading, error } = useRecommendations(recommendationRequest);

    useEffect(() => {
        if (presets && presets.length > 0 && !filters) {
            const defaultPreset = presets.find(p => p.is_default) || presets[0];
            if (defaultPreset) {
                setActivePresetName(defaultPreset.name);
                setFilters({
                    spot_ids: defaultPreset.spot_ids,
                    day_selection: { type: defaultPreset.day_selection_type, values: defaultPreset.day_selection_values },
                    time_window: { start: defaultPreset.start_time, end: defaultPreset.end_time },
                    limit: 10,
                });
            }
        }
    }, [presets, filters]);

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
            <RecommendationFilter spots={spots || []} presets={presets || []} onSearch={handleSearch} loading={isRecommendationLoading} activePresetName={activePresetName} />
            
            <div className="mt-8">
                {isRecommendationLoading && <div className="text-center p-10"><div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}
                
                {!isRecommendationLoading && recommendations && (
                    recommendations.length > 0 ? (
                        <div className="space-y-4">
                            {recommendations.map((rec, index) => (
                                <Link 
                                    key={`${rec.spot_id}-${rec.timestamp_utc}-${index}`} 
                                    to={`/forecasts/${rec.spot_id}`}
                                    state={{ highlightedTimestamp: rec.timestamp_utc }}
                                    className="bg-slate-800 p-4 rounded-lg flex items-center justify-between shadow-md hover:bg-slate-700 transition-colors"
                                >
                                    <div>
                                        <p className="text-xl font-bold text-white">{rec.spot_name}</p>
                                        <p className="text-slate-300">{new Date(rec.timestamp_utc).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                                        <p className="text-cyan-400 font-semibold text-lg">{new Date(rec.timestamp_utc).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <ScoreGauge score={rec.overall_score} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center p-10 bg-slate-800/50 rounded-xl">
                            <WaveIcon className="w-12 h-12 mx-auto text-slate-500" />
                            <h3 className="mt-4 text-xl font-bold text-white">Nenhuma onda encontrada</h3>
                            <p className="text-slate-400">Não encontramos boas recomendações com os filtros selecionados.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RecommendationsPage;