import React, { useState, useMemo } from 'react';
import { DayOffsetRecommendations, HourlyRecommendation } from '../../types';
import { degreesToCardinal } from '../../utils/utils';
import { ScoreGauge } from './ScoreGauge';
import { HourlyForecastCharts } from './HourlyForecastCharts';
import { WaveIcon, WindIcon } from '../icons';

interface ExpandedDayViewProps {
    dayRec: DayOffsetRecommendations;
}

// O "card" de resumo que fica no topo da vista expandida
const SpotlightHourCard: React.FC<{ rec: HourlyRecommendation }> = ({ rec }) => {
    const date = new Date(rec.timestamp_utc);

    return (
        <div className="bg-slate-800 rounded-lg p-5 shadow-lg">
            
            {/* --- LAYOUT PARA ECRÃS MAIORES (sm e acima) - VERSÃO ORIGINAL RESTAURADA --- */}
            <div className="hidden sm:flex flex-row justify-center items-center">
                {/* Bloco Esquerdo: Hora e Score */}
                <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-white">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <ScoreGauge score={rec.suitability_score} />
                </div>

                {/* Divisória Vertical */}
                <div className="w-px h-16 bg-slate-700 mx-6"></div>
                
                {/* Bloco Direito: Informações de Onda e Vento */}
                <div className="flex items-center justify-center gap-x-10">
                    <div className="flex items-center space-x-3 text-left">
                        <WaveIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                        <div>
                            <div className="text-lg font-bold text-white leading-tight">{rec.forecast_conditions.wave_height_sg.toFixed(1)}m</div>
                            <div className="text-xs text-slate-400">{rec.forecast_conditions.wave_period_sg.toFixed(0)}s | {degreesToCardinal(rec.forecast_conditions.wave_direction_sg)}</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-left">
                        <WindIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                        <div>
                            <div className="text-lg font-bold text-white leading-tight">{rec.forecast_conditions.wind_speed_sg.toFixed(1)} m/s</div>
                            <div className="text-xs text-slate-400">({degreesToCardinal(rec.forecast_conditions.wind_direction_sg)})</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- LAYOUT PARA ECRÃS PEQUENOS (abaixo de sm) --- */}
            <div className="sm:hidden flex flex-row justify-center items-center gap-5">
                <div className="text-3xl font-bold text-white">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <ScoreGauge score={rec.suitability_score} />
                    {/* Bloco Empilhado de Onda e Vento */}
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2 text-left">
                            <WaveIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                            <div>
                                <div className="text-sm font-bold text-white leading-tight">{rec.forecast_conditions.wave_height_sg.toFixed(1)}m</div>
                                <div className="text-xs text-slate-400 leading-tight">{rec.forecast_conditions.wave_period_sg.toFixed(0)}s | {degreesToCardinal(rec.forecast_conditions.wave_direction_sg)}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-left">
                            <WindIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                            <div>
                                <div className="text-sm font-bold text-white leading-tight">{rec.forecast_conditions.wind_speed_sg.toFixed(1)} m/s</div>
                                <div className="text-xs text-slate-400 leading-tight">({degreesToCardinal(rec.forecast_conditions.wind_direction_sg)})</div>
                            </div>
                        </div>
                    </div>

            </div>
        </div>
    );
};


export const ExpandedDayView: React.FC<ExpandedDayViewProps> = ({ dayRec }) => {
    // Encontra a melhor hora do dia para ser o destaque inicial
    const bestHour = useMemo(() => {
        if (!dayRec.recommendations || dayRec.recommendations.length === 0) {
            return null;
        }
        return [...dayRec.recommendations].sort((a, b) => b.suitability_score - a.suitability_score)[0];
    }, [dayRec.recommendations]);

    const [spotlightHour, setSpotlightHour] = useState<HourlyRecommendation | null>(bestHour);

    if (!spotlightHour) {
        return <div className="text-slate-400 text-center p-4">No recommendations available for this day.</div>;
    }

    return (
        <div className="mb-6">
            <SpotlightHourCard rec={spotlightHour} />
            <HourlyForecastCharts 
                allHoursData={dayRec.recommendations}
                spotlightHour={spotlightHour}
                onBarClick={(hour) => setSpotlightHour(hour)}
            />
        </div>
    );
};