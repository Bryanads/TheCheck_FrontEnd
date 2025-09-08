// bryanads/thecheck_frontend/TheCheck_FrontEnd-7ed86c7f11db5ca4cd2558f01a919a97b26206f5/pages/ForecastsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSpots, useSpotForecast } from '../hooks';
import { Spot } from '../types';
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

    useEffect(() => {
        const numericSpotId = parseInt(spotIdParam || '0', 10);
        if (numericSpotId > 0) {
            setSelectedSpotId(numericSpotId);

            if (highlightedTimestamp && forecast) {
                const highlightDate = new Date(highlightedTimestamp).toISOString().split('T')[0];
                const dayIndex = forecast.daily_forecasts.findIndex(d => d.date === highlightDate);
                if (dayIndex !== -1) {
                    setSelectedDayIndex(dayIndex);
                }
            } else {
                setSelectedDayIndex(0); // Reseta para o primeiro dia se não houver timestamp
            }
        }
    }, [spotIdParam, highlightedTimestamp, forecast]);
    
    const handleSpotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const spotId = parseInt(e.target.value, 10);
        navigate(`/forecasts/${spotId}`);
    };

    const selectedDayData = forecast?.daily_forecasts[selectedDayIndex];

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

            {forecast && selectedDayData && (
                <div className="animate-fade-in">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {forecast.daily_forecasts.map((day, index) => (
                            <button 
                                key={day.date} 
                                onClick={() => setSelectedDayIndex(index)}
                                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${selectedDayIndex === index ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-300'}`}
                            >
                                {new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </button>
                        ))}
                    </div>
                    
                    <ForecastDetail 
                        dailyForecast={selectedDayData} 
                        highlightedTimestamp={highlightedTimestamp} 
                    />
                </div>
            )}

            {!selectedSpotId && !isLoadingForecast && <div className="text-center p-10 bg-slate-800/50 rounded-xl"><WaveIcon className="w-12 h-12 mx-auto text-slate-500" /><h3 className="mt-4 text-xl font-bold text-white">Nenhum pico selecionado</h3></div>}
        </div>
    );
};

export default ForecastsPage;