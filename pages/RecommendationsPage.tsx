import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, THECHECK_CACHE_KEY } from '../context/AuthContext';
import { getRecommendations } from '../services/api';
import { Spot, SpotRecommendation, Preset, RecommendationFilters } from '../types';
import { RecommendationFilter } from '../components/recommendation/RecommendationFilter';
import { RecommendationList } from '../components/recommendation/RecommendationList';
import { weekdaysToDayOffset } from '../utils/utils';

const CUSTOM_FILTER_CACHE_KEY = 'thecheck_custom_filter_session';

interface TheCheckCache {
    cacheTimestamp: number;
    spots: Spot[];
    presets: Preset[];
    recommendations: {
        [presetId: number]: SpotRecommendation[];
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
    
    const loadStateFromCache = useCallback(() => {
        const cachedDataStr = localStorage.getItem(THECHECK_CACHE_KEY);
        if (!cachedDataStr) return;

        const cache: TheCheckCache = JSON.parse(cachedDataStr);
        setSpots(cache.spots || []);
        setPresets(cache.presets || []);

        setActivePreset(currentActivePreset => {
            let presetToDisplay = currentActivePreset;
            if ((presetToDisplay && !cache.presets.some(p => p.preset_id === presetToDisplay!.preset_id)) || !presetToDisplay) {
                 presetToDisplay = cache.presets.find(p => p.is_default) || cache.presets[0] || null;
            }

            if (presetToDisplay) {
                // Acesso direto aos dados da recomendação
                const recData = cache.recommendations?.[presetToDisplay.preset_id];
                if (recData) {
                    setRecommendations(recData);
                    setIsRecommendationLoading(false);
                } else {
                    setRecommendations([]);
                    setIsRecommendationLoading(true);
                }
            } else {
                setRecommendations([]);
                setIsRecommendationLoading(false);
            }
            return presetToDisplay;
        });
    }, []);

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
                setRecommendations(recData);
                setIsRecommendationLoading(false);
            } else {
                setRecommendations([]);
                setIsRecommendationLoading(true);
            }
            sessionStorage.removeItem(CUSTOM_FILTER_CACHE_KEY);
        } else {
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