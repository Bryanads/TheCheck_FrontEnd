import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSpots, getRecommendations, getPresets } from '../services/api';
import { Spot, SpotRecommendation, Preset, RecommendationFilters } from '../types';
import { RecommendationFilter } from '../components/recommendation/RecommendationFilter';
import { RecommendationList } from '../components/recommendation/RecommendationList';

// Chaves de cache para armazenamento local e de sessão
const RECOMMENDATIONS_CACHE_KEY = 'thecheck_recommendations';
const DEFAULT_PRESET_CACHE_KEY = 'thecheck_default_preset';
const SPOTS_CACHE_KEY = 'thecheck_spots';

const RecommendationsPage: React.FC = () => {
    const { userId } = useAuth();

    // Estados principais do componente
    const [spots, setSpots] = useState<Spot[]>([]);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [recommendations, setRecommendations] = useState<SpotRecommendation[]>([]);
    const [activeFilters, setActiveFilters] = useState<RecommendationFilters | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Ref para controlar se a busca inicial já foi feita e evitar repetições
    const initialSearchPerformed = useRef(false);

    // EFEITO 1: Carregar dados estáticos (spots e presets) apenas uma vez.
    useEffect(() => {
        if (!userId) return;

        const loadStaticData = async () => {
            try {
                // --- Lógica de Presets (Cache-First) ---
                const cachedPresetStr = localStorage.getItem(DEFAULT_PRESET_CACHE_KEY);
                let presetsData: Preset[] = cachedPresetStr ? JSON.parse(cachedPresetStr) : [];

                if (presetsData.length === 0) {
                    presetsData = await getPresets(userId);
                    const serverDefaultPreset = presetsData.find(p => p.is_default);
                    if (serverDefaultPreset) {
                        // Garante que sempre salvamos um array no cache
                        localStorage.setItem(DEFAULT_PRESET_CACHE_KEY, JSON.stringify([serverDefaultPreset]));
                    }
                }
                setPresets(presetsData);

                // --- Lógica de Spots (Cache-First) ---
                const cachedSpotsStr = sessionStorage.getItem(SPOTS_CACHE_KEY);
                if (cachedSpotsStr) {
                    setSpots(JSON.parse(cachedSpotsStr));
                } else {
                    const spotsData = await getSpots();
                    setSpots(spotsData);
                    sessionStorage.setItem(SPOTS_CACHE_KEY, JSON.stringify(spotsData));
                }

            } catch (err) {
                // Se houver qualquer erro ao buscar dados iniciais, define a mensagem de erro E PARA o loading.
                setError('Failed to load initial data.');
                setLoading(false);
            }
        };

        loadStaticData();
    }, [userId]); // Depende apenas do userId para executar

    // EFEITO 2: Definir os filtros iniciais assim que os spots e presets estiverem carregados.
    useEffect(() => {
        // Roda apenas se tivermos spots e presets e ainda não tivermos definido os filtros
        if (spots.length > 0 && presets.length > 0 && !activeFilters) {
            const defaultPreset = presets.find(p => p.is_default);
            let initialFilters: RecommendationFilters;

            if (defaultPreset) {
                initialFilters = {
                    selectedSpotIds: defaultPreset.spot_ids,
                    dayOffset: defaultPreset.day_offset_default,
                    startTime: defaultPreset.start_time,
                    endTime: defaultPreset.end_time,
                };
            } else {
                // Fallback se não houver preset padrão, usa o primeiro spot da lista
                initialFilters = {
                    selectedSpotIds: [spots[0].spot_id],
                    dayOffset: [0],
                    startTime: '06:00',
                    endTime: '18:00',
                };
            }
            setActiveFilters(initialFilters);
        }
    }, [spots, presets, activeFilters]); // Roda quando os dados de base chegam

    // Função de busca, otimizada com useCallback para ser passada como prop
    const handleSearch = useCallback(async (filters: RecommendationFilters) => {
        if (!userId) return;

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
            setRecommendations([]); // Limpa recomendações em caso de erro
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // EFEITO 3: Executar a busca inicial (ou carregar do cache)
    useEffect(() => {
        // Não faz nada até que os filtros ativos sejam definidos
        if (!activeFilters) return;

        // Previne que a busca inicial rode novamente se os filtros mudarem por outra razão
        if (initialSearchPerformed.current) return;

        const cachedRecs = sessionStorage.getItem(RECOMMENDATIONS_CACHE_KEY);
        if (cachedRecs) {
            setRecommendations(JSON.parse(cachedRecs));
            setLoading(false);
        } else {
            // Se não houver cache, executa a busca com os filtros iniciais
            handleSearch(activeFilters);
        }

        // Marca a busca inicial como concluída para não repetir
        initialSearchPerformed.current = true;

    }, [activeFilters, handleSearch]); // Depende dos filtros estarem prontos

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