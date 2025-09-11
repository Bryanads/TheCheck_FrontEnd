// bryanads/thecheck_frontend/TheCheck_FrontEnd/src/components/forecasts/ForecastHeader.tsx
import React from 'react';
import { HourlyForecast } from '../../types';
import { degreesToCardinal } from '../../utils/utils';
import { WaveIcon, WindIcon } from '../icons'; // Supondo que você tenha um ícone para maré

const InfoBlock: React.FC<{ icon: React.ReactNode; label: string; value: string; subValue: string;}> = ({ icon, label, value, subValue }) => (
    <div className="flex items-center space-x-3 text-left">
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-lg font-bold text-white leading-tight">{value}</p>
            <p className="text-xs text-slate-400">{subValue}</p>
        </div>
    </div>
);

interface ForecastHeaderProps {
    spotlightHour: HourlyForecast | null;
}

export const ForecastHeader: React.FC<ForecastHeaderProps> = ({ spotlightHour }) => {
    if (!spotlightHour) {
        return (
            <div className="bg-slate-800 rounded-lg p-5 text-center h-[98px] flex items-center justify-center">
                <p className="text-slate-400">Clique em um horário no gráfico para ver os detalhes.</p>
            </div>
        );
    }

    const { conditions, timestamp_utc } = spotlightHour;
    const date = new Date(timestamp_utc);

    return (
        <div className="bg-slate-800 rounded-lg p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Hora e Data */}
                <div className="text-center sm:text-left">
                    <p className="text-3xl font-bold text-white">{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-md text-cyan-400">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                </div>

                {/* Detalhes */}
                <div className="flex items-center justify-center gap-x-6 sm:gap-x-8">
                    <InfoBlock 
                        icon={<WaveIcon className="w-8 h-8 text-cyan-500" />}
                        label="Onda"
                        value={`${conditions.swell_height_sg?.toFixed(1) || '-'}m`}
                        subValue={`${conditions.swell_period_sg?.toFixed(0) || '-'}s | ${degreesToCardinal(conditions.swell_direction_sg ?? 0)}`}
                    />
                    <InfoBlock 
                        icon={<WindIcon className="w-8 h-8 text-cyan-500" />}
                        label="Vento"
                        value={`${conditions.wind_speed_sg?.toFixed(1) || '-'} m/s`}
                        subValue={`${degreesToCardinal(conditions.wind_direction_sg ?? 0)}`}
                    />
                    <InfoBlock 
                        icon={<WaveIcon className="w-8 h-8 text-cyan-500 opacity-50" />}
                        label="Maré"
                        value={`${conditions.sea_level_sg?.toFixed(2) || '-'}m`}
                        subValue={conditions.tide_type || ''}
                    />
                </div>
            </div>
        </div>
    );
};