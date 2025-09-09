// bryanads/thecheck_frontend/TheCheck_FrontEnd-257372b264015bb625354d50453cccf037b6e08b/pages/ForecastsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSpots, useSpotForecast } from '../hooks';
import { Spot, DailyForecast, HourlyForecast } from '../types';
import { WaveIcon } from '../components/icons';
import { ForecastDetail } from '../components/forecasts/ForecastDetail';

const ForecastsPage: React.FC = () => {
    const { spotId: spotIdParam } = useParams<{ spotId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { highlightedTimestamp } = location.state || {};
    
    const { data: spots, isLoading: isLoadingSpots } = useSpots();
    const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    const { data: forecast, isLoading: isLoadingForecast } = useSpotForecast(selectedSpotId);

    const dailyForecastsByLocalTime = useMemo((): DailyForecast[] => {
        if (!forecast?.forecasts) return [];

        const groupedByDate: { [key: string]: HourlyForecast[] } = {};

        forecast.forecasts.forEach(hourly => {
            const localDate = new Date(hourly.timestamp_utc);
            const dateKey = localDate.toISOString().split('T')[0];

            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = [];
            }
            groupedByDate[dateKey].push(hourly);
        });

        return Object.entries(groupedByDate)
            .map(([date, hourly_data]) => ({ date, hourly_data }))
            .sort((a, b) => a.date.localeCompare(b.date));

    }, [forecast]);


    // ATUALIZAÇÃO PRINCIPAL AQUI
    useEffect(() => {
        const numericSpotId = parseInt(spotIdParam || '0', 10);
        if (numericSpotId > 0) {
            setSelectedSpotId(numericSpotId);
        }
        
        // Só executa a lógica se os dados já foram processados
        if (dailyForecastsByLocalTime.length > 0) {
            let initialDayIndex = 0;

            if (highlightedTimestamp) {
                // Se viemos de outra página com um horário, mantém o comportamento antigo
                const highlightDate = new Date(highlightedTimestamp).toISOString().split('T')[0];
                const dayIndex = dailyForecastsByLocalTime.findIndex(d => d.date === highlightDate);
                if (dayIndex !== -1) {
                    initialDayIndex = dayIndex;
                }
            } else {
                // NOVO: Lógica para encontrar e selecionar o dia de "hoje"
                const todayStr = new Date().toISOString().split('T')[0];
                const todayIndex = dailyForecastsByLocalTime.findIndex(d => d.date === todayStr);
                
                if (todayIndex !== -1) {
                    // Se encontrou "hoje" nos dados, define como o dia inicial
                    initialDayIndex = todayIndex;
                } else {
                    // Fallback: se "hoje" não estiver nos dados, mostra o primeiro dia disponível
                    // (que provavelmente será "ontem", já que a API envia -24h)
                    initialDayIndex = 0;
                }
            }
            setSelectedDayIndex(initialDayIndex);
        }
    }, [spotIdParam, highlightedTimestamp, dailyForecastsByLocalTime]);
    
    const handleSpotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const spotId = parseInt(e.target.value, 10);
        navigate(`/forecasts/${spotId}`);
    };

    const selectedDayData = dailyForecastsByLocalTime[selectedDayIndex];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-white mb-4">Previsão Detalhada</h1>
                <p className="text-slate-400">Selecione um pico para ver as condições para os próximos 7 dias.</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl">
                <select value={selectedSpotId || ''} onChange={handleSpotChange} disabled={isLoadingSpots} className="w-full p-3 bg-slate-700 rounded-lg text-white text-lg">
                    <option value="">-- {isLoadingSpots ? 'Carregando...' : 'Escolha um pico'} --</option>
                    {spots?.map((spot: Spot) => <option key={spot.spot_id} value={spot.spot_id}>{spot.name}</option>)}
                </select>
            </div>

            {isLoadingForecast && <div className="text-center p-10"><div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}

            {dailyForecastsByLocalTime.length > 0 && selectedDayData && (
                <div className="animate-fade-in">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {dailyForecastsByLocalTime.map((day, index) => (
                            <button 
                                key={day.date} 
                                onClick={() => setSelectedDayIndex(index)}
                                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${selectedDayIndex === index ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-300'}`}
                            >
                                {/* Adicionado T00:00:00Z para garantir que a data seja tratada como UTC e não sofra shift de fuso horário na exibição */}
                                {new Date(day.date + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' })}
                            </button>
                        ))}
                    </div>
                    
                    <ForecastDetail 
                        dailyForecast={selectedDayData} 
                        // O highlightedTimestamp só será usado se vier de outra página
                        highlightedTimestamp={highlightedTimestamp} 
                    />
                </div>
            )}

            {!selectedSpotId && !isLoadingForecast && <div className="text-center p-10 bg-slate-800/50 rounded-xl"><WaveIcon className="w-12 h-12 mx-auto text-slate-500" /><h3 className="mt-4 text-xl font-bold text-white">Nenhum pico selecionado</h3></div>}
        </div>
    );
};

export default ForecastsPage;