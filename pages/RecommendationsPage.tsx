import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth, RECOMMENDATIONS_CACHE_KEY, DEFAULT_PRESET_LOCAL_CACHE_KEY, SPOTS_CACHE_KEY, PRESETS_SESSION_CACHE_KEY } from '../context/AuthContext';
import { getSpots, getRecommendations, getPresets } from '../services/api';
import { Spot, SpotRecommendation, Preset, RecommendationFilters } from '../types';
import { RecommendationFilter } from '../components/recommendation/RecommendationFilter';
import { RecommendationList } from '../components/recommendation/RecommendationList';
import { weekdaysToDayOffset } from '../utils/utils';


const RecommendationsPage: React.FC = () => {
    const { userId } = useAuth();
    const [spots, setSpots] = useState<Spot[]>([]);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [recommendations, setRecommendations] = useState<SpotRecommendation[]>([]);
    const [activeFilters, setActiveFilters] = useState<RecommendationFilters | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const initialSearchPerformed = useRef(false);

    useEffect(() => {
        if (!userId) return;

        const loadStaticData = async () => {
            try {
                const cachedPresetsStr = sessionStorage.getItem(PRESETS_SESSION_CACHE_KEY);
                if (cachedPresetsStr) {
                    setPresets(JSON.parse(cachedPresetsStr));
                } else {
                    const presetsData = await getPresets(userId);
                    setPresets(presetsData);
                    sessionStorage.setItem(PRESETS_SESSION_CACHE_KEY, JSON.stringify(presetsData));

                    const serverDefaultPreset = presetsData.find(p => p.is_default);
                    if (serverDefaultPreset) {
                        localStorage.setItem(DEFAULT_PRESET_LOCAL_CACHE_KEY, JSON.stringify(serverDefaultPreset));
                    }
                }

                const cachedSpotsStr = sessionStorage.getItem(SPOTS_CACHE_KEY);
                if (cachedSpotsStr) {
                    setSpots(JSON.parse(cachedSpotsStr));
                } else {
                    const spotsData = await getSpots();
                    setSpots(spotsData);
                    sessionStorage.setItem(SPOTS_CACHE_KEY, JSON.stringify(spotsData));
                }
            } catch (err) {
                setError('Failed to load initial data.');
                setLoading(false);
            }
        };
        loadStaticData();
    }, [userId]);

    useEffect(() => {
        if (spots.length > 0 && !activeFilters) {
            const cachedDefaultPresetStr = localStorage.getItem(DEFAULT_PRESET_LOCAL_CACHE_KEY);
            const defaultPreset = cachedDefaultPresetStr ? JSON.parse(cachedDefaultPresetStr) : null;
            
            let initialFilters: RecommendationFilters;
            if (defaultPreset) {
                initialFilters = {
                    selectedSpotIds: defaultPreset.spot_ids,
                    dayOffset: weekdaysToDayOffset(defaultPreset.weekdays), // ALTERADO
                    startTime: defaultPreset.start_time,
                    endTime: defaultPreset.end_time,
                };
            } else {
                initialFilters = {
                    selectedSpotIds: [spots[0].spot_id],
                    dayOffset: [0],
                    startTime: '05:00:00',
                    endTime: '17:00:00',
                };
            }
            setActiveFilters(initialFilters);
        }
    }, [spots, activeFilters]);

    const handleSearch = useCallback(async (filters: RecommendationFilters) => {
        if (!userId) return;

        sessionStorage.removeItem(RECOMMENDATIONS_CACHE_KEY);
        setRecommendations([]);
        setLoading(true);
        setError(null);
        
        try {
            const data = {
                user_id: userId,
                spot_ids: filters.selectedSpotIds,
                day_offset: filters.dayOffset,
                start_time: filters.startTime,
                end_time: filters.endTime,
            };
            const result = await getRecommendations(data);
            setRecommendations(result);
            sessionStorage.setItem(RECOMMENDATIONS_CACHE_KEY, JSON.stringify(result));
        } catch (err: any) {
            setError(err.message || "Failed to fetch recommendations.");
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!activeFilters || initialSearchPerformed.current) return;

        const cachedRecs = sessionStorage.getItem(RECOMMENDATIONS_CACHE_KEY);
        if (cachedRecs) {
            setRecommendations(JSON.parse(cachedRecs));
            setLoading(false);
        } else {
            handleSearch(activeFilters);
        }
        initialSearchPerformed.current = true;
    }, [activeFilters, handleSearch]);

    return (
        <div className="space-y-8">
            <RecommendationFilter
                spots={spots}
                presets={presets}
                initialFilters={activeFilters}
                onSearch={handleSearch}
                loading={loading && recommendations.length === 0}
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