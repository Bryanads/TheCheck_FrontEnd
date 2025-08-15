import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSpots, getPresets, getRecommendations } from '../services/api';
import { Spot, Preset, SpotRecommendation } from '../types';
import { weekdaysToDayOffset } from '../utils/utils';
import { LogoIcon } from '../components/icons';

// Novas chaves de cache para o localStorage
const THECHECK_CACHE_KEY = 'thecheck_cache';

interface TheCheckCache {
    spots: Spot[];
    presets: Preset[];
    recommendations: {
        [presetId: number]: {
            timestamp: number;
            data: SpotRecommendation[];
        }
    };
}

const LoadingPage: React.FC = () => {
    const { userId } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Iniciando...');

    useEffect(() => {
        const fetchAndCacheAllData = async () => {
            if (!userId) {
                navigate('/auth');
                return;
            }

            try {
                // 1. Buscar spots e presets em paralelo
                setStatus('Buscando seus spots e presets...');
                const [spotsData, presetsData] = await Promise.all([
                    getSpots(),
                    getPresets(userId)
                ]);

                // 2. Para cada preset, buscar as recomendações
                setStatus(`Carregando recomendações para ${presetsData.length} preset(s)...`);
                const recommendationsPromises = presetsData.map(preset => {
                    const recommendationParams = {
                        user_id: userId,
                        spot_ids: preset.spot_ids,
                        day_offset: weekdaysToDayOffset(preset.weekdays),
                        start_time: preset.start_time,
                        end_time: preset.end_time,
                    };
                    return getRecommendations(recommendationParams).then(data => ({
                        presetId: preset.preset_id,
                        data
                    }));
                });

                const recommendationsResults = await Promise.all(recommendationsPromises);

                // 3. Estruturar e salvar no localStorage
                setStatus('Salvando dados para acesso instantâneo...');
                const recommendationsCache: TheCheckCache['recommendations'] = {};
                recommendationsResults.forEach(result => {
                    recommendationsCache[result.presetId] = {
                        timestamp: Date.now(),
                        data: result.data
                    };
                });

                const cache: TheCheckCache = {
                    spots: spotsData,
                    presets: presetsData,
                    recommendations: recommendationsCache
                };

                localStorage.setItem(THECHECK_CACHE_KEY, JSON.stringify(cache));

                // 4. Redirecionar
                setStatus('Tudo pronto!');
                navigate('/recommendations');

            } catch (error) {
                console.error("Falha ao carregar dados iniciais:", error);
                // Em caso de erro, redireciona para a página principal com uma mensagem
                navigate('/recommendations', { state: { error: 'Não foi possível carregar seus dados. Tente novamente mais tarde.' } });
            }
        };

        fetchAndCacheAllData();
    }, [userId, navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <LogoIcon className="w-24 h-24 text-cyan-400 animate-pulse" />
            <h1 className="text-3xl font-bold text-white mt-6">TheCheck</h1>
            <p className="text-slate-300 mt-2 text-lg">{status}</p>
            <div className="w-48 h-2 bg-slate-700 rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-cyan-400 animate-pulse w-full"></div>
            </div>
        </div>
    );
};

export default LoadingPage;