import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell, ComposedChart } from 'recharts';
import { HourlyRecommendation } from '../../types';
import { XIcon } from '../icons';

interface HourlyChartsGridProps {
    allHoursData: HourlyRecommendation[];
    spotlightHour: HourlyRecommendation;
    onClose: () => void;
}

// Componente para o Tooltip customizado, reutilizável para todos os gráficos
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 shadow-xl">
                <p className="font-bold text-white mb-2">{`Hora: ${label}`}</p>
                {payload.map((p: any) => (
                    <p key={p.dataKey} style={{ color: p.color }}>
                        {`${p.name}: ${p.value.toFixed(0)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Componente para um único gráfico, para evitar repetição de código
const ScoreChart: React.FC<{
    title: string;
    data: any[];
    dataKey: string;
    fillColor: string;
    spotlightFillColor: string;
    spotlightTimestamp: string;
}> = ({ title, data, dataKey, fillColor, spotlightFillColor, spotlightTimestamp }) => (
    <div>
        <h4 className="text-sm font-bold text-center text-slate-300 mb-2">{title}</h4>
        <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[-100, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={dataKey} name={title} barSize={20}>
                    {data.map((entry) => (
                        <Cell key={`cell-${entry.timestamp_utc}`} fill={entry.timestamp_utc === spotlightTimestamp ? spotlightFillColor : fillColor} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export const HourlyChartsGrid: React.FC<HourlyChartsGridProps> = ({ allHoursData, spotlightHour, onClose }) => {
    
    const chartData = allHoursData
        .sort((a, b) => new Date(a.timestamp_utc).getTime() - new Date(b.timestamp_utc).getTime())
        .map(rec => ({
            time: new Date(rec.timestamp_utc).toLocaleTimeString([], { hour: '2-digit' }),
            wave_score: rec.detailed_scores.wave_score,
            wind_score: rec.detailed_scores.wind_score,
            tide_score: rec.detailed_scores.tide_score,
            water_temperature_score: rec.detailed_scores.water_temperature_score,
            air_temperature_score: rec.detailed_scores.air_temperature_score,
            timestamp_utc: rec.timestamp_utc
        }));

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 mt-4 relative">
            <button 
                onClick={onClose} 
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full z-10"
                aria-label="Close chart"
            >
                <XIcon className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <ScoreChart 
                    title="Wave Score"
                    data={chartData}
                    dataKey="wave_score"
                    fillColor="#06b6d4"
                    spotlightFillColor="#67e8f9"
                    spotlightTimestamp={spotlightHour.timestamp_utc}
                />
                <ScoreChart 
                    title="Wind Score"
                    data={chartData}
                    dataKey="wind_score"
                    fillColor="#34d399"
                    spotlightFillColor="#6ee7b7"
                    spotlightTimestamp={spotlightHour.timestamp_utc}
                />
                <ScoreChart 
                    title="Tide Score"
                    data={chartData}
                    dataKey="tide_score"
                    fillColor="#f59e0b"
                    spotlightFillColor="#fcd34d"
                    spotlightTimestamp={spotlightHour.timestamp_utc}
                />
                {/* Gráfico combinado para Temperaturas */}
                <div>
                    <h4 className="text-sm font-bold text-center text-slate-300 mb-2">Temperature Scores</h4>
                    <ResponsiveContainer width="100%" height={150}>
                        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="water_temperature_score" name="Water" fill="#3b82f6" barSize={12}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-water-${entry.timestamp_utc}`} fill={entry.timestamp_utc === spotlightHour.timestamp_utc ? '#60a5fa' : '#3b82f6'} />
                                ))}
                            </Bar>
                            <Bar dataKey="air_temperature_score" name="Air" fill="#818cf8" barSize={12}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-air-${entry.timestamp_utc}`} fill={entry.timestamp_utc === spotlightHour.timestamp_utc ? '#a78bfa' : '#818cf8'} />
                                ))}
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};