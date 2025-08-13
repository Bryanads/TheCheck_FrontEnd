import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { HourlyRecommendation } from '../../types';
import { degreesToCardinal } from '../../utils/utils';
import { ScoreGauge } from './ScoreGauge';
import { WaveIcon, WindIcon, SunIcon, ClockIcon } from '../icons';

interface RecommendationCardProps {
    rec: HourlyRecommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec }) => {
    const date = new Date(rec.timestamp_utc);
    const detailScoresData = Object.entries(rec.detailed_scores).map(([name, value]) => ({ name: name.replace(/_score/g, ' ').replace(/_/g, ' '), value }));

    return (
        <div className="bg-slate-800 rounded-lg p-4 snap-start flex-shrink-0 w-80">
            <div className="flex justify-between items-center">
                <div className="text-xl font-bold text-white">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <ScoreGauge score={rec.suitability_score} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
                <div className="flex items-center space-x-2"><WaveIcon className="w-5 h-5 text-cyan-400" /><span>{rec.forecast_conditions.wave_height_sg.toFixed(1)}m @ {rec.forecast_conditions.wave_period_sg.toFixed(0)}s ({degreesToCardinal(rec.forecast_conditions.wave_direction_sg)})</span></div>
                <div className="flex items-center space-x-2"><WindIcon className="w-5 h-5 text-cyan-400" /><span>{rec.forecast_conditions.wind_speed_sg.toFixed(2)} m/s ({degreesToCardinal(rec.forecast_conditions.wind_direction_sg)})</span></div>
                <div className="flex items-center space-x-2"><SunIcon className="w-5 h-5 text-cyan-400" /><span>Air:{rec.forecast_conditions.air_temperature_sg.toFixed(1)}°C Water: {rec.forecast_conditions.water_temperature_sg.toFixed(1)}°C</span></div>
                <div className="flex items-center space-x-2"><ClockIcon className="w-5 h-5 text-cyan-400" /><span>Tide: {rec.forecast_conditions.sea_level_sg.toFixed(2)}m  {rec.forecast_conditions.tide_phase}</span></div>
            </div>
             <details className="mt-4">
                <summary className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-medium">Detailed Score</summary>
                <div className="mt-2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={detailScoresData} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={100} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                            <Bar dataKey="value" fill="#22d3ee" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </details>
        </div>
    );
};