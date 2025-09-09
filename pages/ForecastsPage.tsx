// bryanads/thecheck_frontend/TheCheck_FrontEnd/src/pages/ForecastsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSpots, useSpotForecast } from '../hooks';
import { Spot, HourlyForecast } from '../types';
import { WaveIcon } from '../components/icons';
import { ContinuousForecastChart } from '../components/forecasts/ContinuousForecastChart';
import { ForecastHeader } from '../components/forecasts/ForecastHeader';

const ForecastsPage: React.FC = () => {
    const { spotId: spotIdParam } = useParams<{ spotId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { highlightedTimestamp } = location.state || {};
    
    const { data: spots, isLoading: isLoadingSpots } = useSpots();
    const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
    const [spotlightHour, setSpotlightHour] = useState<HourlyForecast | null>(null);
    
    const { data: forecast, isLoading: isLoadingForecast } = useSpotForecast(selectedSpotId);

    const allHourlyData = useMemo(() => {
        if (!forecast?.forecasts) return [];
        
        // Lógica aprimorada para exibir a partir da meia-noite de hoje
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Meia-noite no fuso local

        // Filtra os dados para começar a partir da meia-noite de hoje
        const relevantForecasts = forecast.forecasts.filter(hour => new Date(hour.timestamp_utc) >= startOfToday);

        const processedData: any[] = [];
        let lastLocalDate: string | null = null;

        relevantForecasts.forEach(hour => {
            const hourDate = new Date(hour.timestamp_utc);
            const currentLocalDate = hourDate.toLocaleDateString('pt-BR');
            const isStartOfDay = currentLocalDate !== lastLocalDate;

            if (isStartOfDay) {
                lastLocalDate = currentLocalDate;
            }

            processedData.push({
                time: hourDate.toLocaleTimeString('pt-BR', { hour: '2-digit' }) + 'h',
                dayLabel: isStartOfDay ? hourDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }) : '',
                fullDateLabel: hourDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }),
                isStartOfDay,
                ...hour.conditions,
                timestamp_utc: hour.timestamp_utc,
                originalData: hour,
            });
        });
        
        // Adiciona os separadores visuais entre os dias
        const finalDataWithSeparators: any[] = [];
        for (let i = 0; i < processedData.length; i++) {
            // Adiciona um separador *antes* do primeiro item de um novo dia (exceto o primeiro de todos)
            if (processedData[i].isStartOfDay && i > 0) {
                 finalDataWithSeparators.push({ isSeparator: true, isSeparatorLine: true, timestamp_utc: `sep-${processedData[i].timestamp_utc}` });
            }
            finalDataWithSeparators.push(processedData[i]);
        }

        return finalDataWithSeparators;
    }, [forecast]);

    useEffect(() => {
        const numericSpotId = parseInt(spotIdParam || '0', 10);
        if (numericSpotId > 0) setSelectedSpotId(numericSpotId);
        
        if (allHourlyData.length > 0) {
            // Define a hora inicial em destaque
            const initialHour = highlightedTimestamp
                ? allHourlyData.find(h => h.timestamp_utc === highlightedTimestamp)?.originalData
                : allHourlyData.find(h => !h.isSeparator)?.originalData; // Pega o primeiro dado válido (que será a primeira hora de hoje)
            setSpotlightHour(initialHour || null);
        }
    }, [spotIdParam, highlightedTimestamp, allHourlyData]);
    
    const handleSpotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const spotId = parseInt(e.target.value, 10);
        navigate(spotId > 0 ? `/forecasts/${spotId}` : '/forecasts');
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-white mb-4">Previsão Detalhada</h1>
                <p className="text-slate-400">Selecione um pico e clique ou passe o mouse sobre o gráfico para ver os detalhes de cada horário.</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl">
                <select value={selectedSpotId || ''} onChange={handleSpotChange} disabled={isLoadingSpots} className="w-full p-3 bg-slate-700 rounded-lg text-white text-lg">
                    <option value="">-- {isLoadingSpots ? 'Carregando...' : 'Escolha um pico'} --</option>
                    {spots?.map((spot: Spot) => <option key={spot.spot_id} value={spot.spot_id}>{spot.name}</option>)}
                </select>
            </div>

            {selectedSpotId && <ForecastHeader spotlightHour={spotlightHour} />}

            {isLoadingForecast && <div className="text-center p-10"><div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}

            {forecast && allHourlyData.length > 0 && (
                <ContinuousForecastChart 
                    allHourlyData={allHourlyData} 
                    highlightedTimestamp={spotlightHour?.timestamp_utc}
                    onBarClick={setSpotlightHour}
                />
            )}

            {!selectedSpotId && !isLoadingForecast && (
                 <div className="text-center p-10 bg-slate-800/50 rounded-xl">
                    <WaveIcon className="w-12 h-12 mx-auto text-slate-500" />
                    <h3 className="mt-4 text-xl font-bold text-white">Nenhum pico selecionado</h3>
                 </div>
            )}
        </div>
    );
};

export default ForecastsPage;