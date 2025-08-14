import React from 'react';
import { HourlyRecommendation } from '../../types';
import { degreesToCardinal } from '../../utils/utils';
import { ScoreGauge } from './ScoreGauge';
import { WaveIcon, WindIcon } from '../icons';

interface RecommendationCardProps {
    rec: HourlyRecommendation;
    onClick: () => void; // Prop para lidar com o clique para expandir para os gráficos
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec, onClick }) => {
    const date = new Date(rec.timestamp_utc);

    return (
        <div 
            className="bg-slate-800 rounded-lg p-5 snap-start flex-shrink-0 w-[85vw] sm:w-80 flex flex-col justify-between shadow-lg cursor-pointer hover:border-cyan-400 border-2 border-transparent transition-all"
            onClick={onClick}
        >
            {/* Cabeçalho com Hora e Score Geral */}
            <div className="flex justify-between items-center pb-4">
                <div className="text-2xl font-bold text-white">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <ScoreGauge score={rec.suitability_score} />
            </div>

            {/* Informações Principais: Onda e Vento */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                {/* Detalhes da Onda */}
                <div className="flex items-center space-x-2">
                    <WaveIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                    <div>
                        <div className="text-lg font-bold text-white leading-tight">{rec.forecast_conditions.wave_height_sg.toFixed(1)}m</div>
                        <div className="text-xs text-slate-400">{rec.forecast_conditions.wave_period_sg.toFixed(0)}s ({degreesToCardinal(rec.forecast_conditions.wave_direction_sg)})</div>
                    </div>
                </div>
                {/* Detalhes do Vento */}
                <div className="flex items-center space-x-2">
                    <WindIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                    <div>
                        <div className="text-lg font-bold text-white leading-tight">{rec.forecast_conditions.wind_speed_sg.toFixed(1)} m/s</div>
                        <div className="text-xs text-slate-400">({degreesToCardinal(rec.forecast_conditions.wind_direction_sg)})</div>
                    </div>
                </div>
            </div>
        </div>
    );
};