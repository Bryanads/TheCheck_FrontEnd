import React, { useState } from 'react';
import { SpotRecommendation, HourlyRecommendation } from '../../types';
import { RecommendationCard } from './RecommendationCard';
import { DaySummaryCard } from './DaySummaryCard';
import { HourlyForecastCharts } from './HourlyForecastCharts';
import { WaveIcon } from '../icons';

interface RecommendationListProps {
    recommendations: SpotRecommendation[];
    loading: boolean;
    error: string | null;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations, loading, error }) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [spotlightHour, setSpotlightHour] = useState<HourlyRecommendation | null>(null);

    const toggleExpand = (key: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
                setSpotlightHour(null); // Fecha o gráfico ao colapsar o dia
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleCardClick = (rec: HourlyRecommendation) => {
        // Se o gráfico já estiver aberto para este card, fecha-o. Caso contrário, abre-o.
        setSpotlightHour(prev => prev?.timestamp_utc === rec.timestamp_utc ? null : rec);
    };

    const closeChartView = () => {
        setSpotlightHour(null);
    };

    // ... (as seções de loading, erro e estado inicial permanecem as mesmas)
    if (loading && recommendations.length === 0) {
        return <div className="text-center p-10"><div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 text-slate-300">Checking the surf for you...</p></div>;
    }
    if (error) {
        return <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center">{error}</p>;
    }
    if (!loading && recommendations.length === 0) {
        return <div className="text-center p-10 bg-slate-800/50 rounded-xl"><WaveIcon className="w-12 h-12 mx-auto text-slate-500" /><h3 className="mt-4 text-xl font-bold text-white">Ready to surf?</h3><p className="text-slate-400">Select your spots and hit "Get My Check" to see your personalized recommendations.</p></div>;
    }

    return (
        <div className="space-y-8">
            {recommendations.map(spotRec => (
                <div key={spotRec.spot_id}>
                    <h2 className="text-2xl font-bold text-white mb-4">{spotRec.spot_name}</h2>
                    <div className="space-y-3">
                        {spotRec.day_offsets.map(dayRec => {
                            const key = `${spotRec.spot_id}-${dayRec.day_offset}`;
                            const isExpanded = expandedItems.has(key);
                            const isShowingChart = spotlightHour && dayRec.recommendations.some(r => r.timestamp_utc === spotlightHour.timestamp_utc);

                            return (
                                <div key={key}> 
                                    <DaySummaryCard dayRec={dayRec} onExpand={() => toggleExpand(key)} />
                                    {isExpanded && (
                                        <div className="mb-6">
                                            {isShowingChart ? (
                                                <HourlyForecastCharts 
                                                    allHoursData={dayRec.recommendations}
                                                    spotlightHour={spotlightHour}
                                                    onClose={closeChartView}
                                                />
                                            ) : (
                                                <div className="flex overflow-x-auto space-x-4 pb-4 pt-4 snap-x snap-mandatory">
                                                    {dayRec.recommendations
                                                        .sort((a, b) => new Date(a.timestamp_utc).getTime() - new Date(b.timestamp_utc).getTime())
                                                        .map(rec => (
                                                            <RecommendationCard 
                                                                key={rec.timestamp_utc} 
                                                                rec={rec}
                                                                onClick={() => handleCardClick(rec)} 
                                                            />
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};