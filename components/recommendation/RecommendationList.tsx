import React, { useState } from 'react';
import { SpotRecommendation } from '../../types';
import { DaySummaryCard } from './DaySummaryCard';
import { ExpandedDayView } from './ExpandedDayView'; 
import { WaveIcon } from '../icons';

interface RecommendationListProps {
    recommendations: SpotRecommendation[];
    loading: boolean;
    error: string | null;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations, loading, error }) => {
    const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);

    const toggleExpand = (key: string) => {
        setExpandedDayKey(prevKey => (prevKey === key ? null : key));
    };
    
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
                            const isExpanded = expandedDayKey === key;

                            return (
                                <div key={key}> 
                                    <DaySummaryCard 
                                        dayRec={dayRec} 
                                        onExpand={() => toggleExpand(key)}
                                        isExpanded={isExpanded}
                                    />
                                    {isExpanded && (
                                        <ExpandedDayView 
                                            dayRec={dayRec} 
                                            spotPreferences={spotRec.preferences_used_for_spot} 
                                        />
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