// bryanads/thecheck_frontend/TheCheck_FrontEnd-7ed86c7f11db5ca4cd2558f01a919a97b26206f5/components/forecasts/ForecastDetail.tsx
import React from 'react';
import { DailyForecast, HourlyForecast } from '../../types';
import { ForecastCharts } from './ForecastCharts';
import { degreesToCardinal } from '../../utils/utils';
import { WaveIcon, WindIcon } from '../icons';

// Card de resumo para a hora em destaque, sem scores.
const SpotlightHourCard: React.FC<{ hour: HourlyForecast }> = ({ hour }) => {
    const date = new Date(hour.timestamp_utc);
    const conditions = hour.conditions;

    return (
        <div className="bg-slate-800 rounded-lg p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="text-3xl font-bold text-white">
                    {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="w-full sm:w-px sm:h-16 bg-slate-700 my-2 sm:my-0 sm:mx-6"></div>
                <div className="flex items-center justify-center gap-x-6 sm:gap-x-10">
                    <div className="flex items-center space-x-3 text-left">
                        <WaveIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                        <div>
                            <div className="text-lg font-bold text-white leading-tight">{conditions.swell_height_sg?.toFixed(1)}m</div>
                            <div className="text-xs text-slate-400">{conditions.swell_period_sg?.toFixed(0)}s | {degreesToCardinal(conditions.swell_direction_sg ?? 0)}</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-left">
                        <WindIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                        <div>
                            <div className="text-lg font-bold text-white leading-tight">{conditions.wind_speed_sg?.toFixed(1)} m/s</div>
                            <div className="text-xs text-slate-400">({degreesToCardinal(conditions.wind_direction_sg ?? 0)})</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ForecastDetailProps {
    dailyForecast: DailyForecast;
    highlightedTimestamp?: string;
}

export const ForecastDetail: React.FC<ForecastDetailProps> = ({ dailyForecast, highlightedTimestamp }) => {
    const initialHour = highlightedTimestamp 
        ? dailyForecast.hourly_data.find(h => h.timestamp_utc === highlightedTimestamp) || dailyForecast.hourly_data[0]
        : dailyForecast.hourly_data[0];
        
    const [spotlightHour, setSpotlightHour] = React.useState<HourlyForecast | null>(initialHour);

    // Garante que o spotlightHour seja atualizado se o dia mudar
    React.useEffect(() => {
        setSpotlightHour(initialHour);
    }, [initialHour]);

    if (!spotlightHour) {
        return <div className="text-slate-400 text-center p-4">Dados de previsão não disponíveis.</div>;
    }

    return (
        <div className="mb-6 animate-fade-in">
            <SpotlightHourCard hour={spotlightHour} />
            <ForecastCharts 
                hourlyData={dailyForecast.hourly_data}
                highlightedTimestamp={spotlightHour.timestamp_utc}
                onBarClick={setSpotlightHour}
            />
        </div>
    );
};