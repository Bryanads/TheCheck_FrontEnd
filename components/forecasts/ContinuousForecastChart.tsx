// bryanads/thecheck_frontend/TheCheck_FrontEnd/src/components/forecasts/ContinuousForecastChart.tsx
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from 'recharts';
import { HourlyForecast } from '../../types';
import { degreesToCardinal } from '../../utils/utils';

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        if (data.isSeparator) return null;

        return (
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-600 shadow-xl text-sm">
                <p className="font-bold text-white mb-2">{data.fullDateLabel}</p>
                <p className="text-cyan-400 font-bold mb-2">{`Hora: ${label}`}</p>
                <p style={{ color: '#06b6d4' }}>Onda: {data.swell_height_sg.toFixed(1)}m, {data.swell_period_sg.toFixed(0)}s, {degreesToCardinal(data.swell_direction_sg)}</p>
                <p style={{ color: '#eab308' }}>Vento: {data.wind_speed_sg.toFixed(1)} m/s, {degreesToCardinal(data.wind_direction_sg)}</p>
                <p style={{ color: '#22c55e' }}>Maré: {data.sea_level_sg.toFixed(2)}m ({data.tide_type})</p>
            </div>
        );
    }
    return null;
};

interface ContinuousForecastChartProps {
    allHourlyData: any[];
    highlightedTimestamp?: string;
    onBarClick: (hourData: HourlyForecast) => void;
}

export const ContinuousForecastChart: React.FC<ContinuousForecastChartProps> = ({ allHourlyData, highlightedTimestamp, onBarClick }) => {
    const highlightColor = "#ffffff";
    
    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            if (!data.activePayload[0].payload.isSeparator) {
                onBarClick(data.activePayload[0].payload.originalData);
            }
        }
    };

    return (
        <div className="w-full h-[550px] bg-slate-800 rounded-lg p-6 overflow-x-auto overflow-y-hidden">
            <div style={{ width: `${allHourlyData.length * 40}px`, height: '100%' }}>
                {[
                    { key: 'swell_height_sg', name: 'Onda', unit: 'm', color: '#06b6d4' },
                    { key: 'wind_speed_sg', name: 'Vento', unit: 'm/s', color: '#06b6d4' },
                    { key: 'sea_level_sg', name: 'Maré', unit: 'm', color: '#06b6d4' }
                ].map((chart, index) => (
                    <ResponsiveContainer key={chart.key} width="100%" height={index === 2 ? 180 : 150}>
                        <BarChart data={allHourlyData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="2 2" strokeOpacity={0.2} />
                            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} interval={0} axisLine={index === 2} tickLine={index === 2} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit={chart.unit} domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
                            <Bar dataKey={chart.key} name={chart.name} unit={chart.unit}>
                                {allHourlyData.map((entry, idx) => (
                                    <Cell 
                                        key={`cell-${chart.key}-${idx}`} 
                                        fill={entry.isSeparator ? 'transparent' : (entry.timestamp_utc === highlightedTimestamp ? highlightColor : chart.color)} 
                                    />
                                ))}
                            </Bar>
                            {allHourlyData.map((d, idx) => {
                                if (d.isStartOfDay && index === 0) { // Mostra o label do dia apenas no primeiro gráfico
                                    return <ReferenceLine key={`label-${d.timestamp_utc}`} x={d.time} stroke="#475569" strokeDasharray="3 3" label={{ value: d.dayLabel, position: 'insideTopLeft', fill: '#94a3b8' }} />;
                                }
                                if (d.isSeparatorLine) {
                                    return <ReferenceLine key={`separator-${idx}`} x={d.time} stroke="black" strokeWidth={1.5} />;
                                }
                                return null;
                            })}
                        </BarChart>
                    </ResponsiveContainer>
                ))}
            </div>
        </div>
    );
};