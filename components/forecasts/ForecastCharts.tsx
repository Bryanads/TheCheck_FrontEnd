// bryanads/thecheck_frontend/TheCheck_FrontEnd-7ed86c7f11db5ca4cd2558f01a919a97b26206f5/components/forecasts/ForecastCharts.tsx
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { HourlyForecast } from '../../types';

interface ForecastChartsProps {
    hourlyData: HourlyForecast[];
    highlightedTimestamp: string;
    onBarClick: (hour: HourlyForecast) => void;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 shadow-xl text-sm">
                <p className="font-bold text-white mb-2">{`Hora: ${label}`}</p>
                {payload.map((p: any) => (
                    <p key={p.dataKey} style={{ color: p.color }}>
                        {`${p.name}: ${p.value.toFixed(1)} ${p.unit}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Chart: React.FC<{
    data: any[];
    dataKey: string;
    name: string;
    unit: string;
    color: string;
    highlightedTimestamp: string;
}> = ({ data, dataKey, name, unit, color, highlightedTimestamp }) => {
    const highlightColor = "#22d3ee"; // cyan-400

    return (
        <div>
            <h4 className="font-bold text-slate-200 mb-2">{name} ({unit})</h4>
            <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="2 2" strokeOpacity={0.3} />
                    <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit={unit} domain={[0, 'auto']} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
                    <Bar dataKey={dataKey} name={name} unit={unit}>
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.timestamp_utc}`} fill={entry.timestamp_utc === highlightedTimestamp ? highlightColor : color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ForecastCharts: React.FC<ForecastChartsProps> = ({ hourlyData, highlightedTimestamp, onBarClick }) => {
    const chartData = hourlyData.map(h => ({
        time: new Date(h.timestamp_utc).toLocaleTimeString('pt-BR', { hour: '2-digit' }) + 'h',
        timestamp_utc: h.timestamp_utc,
        swell_height_sg: h.conditions.swell_height_sg ?? 0,
        wind_speed_sg: h.conditions.wind_speed_sg ?? 0,
        sea_level_sg: h.conditions.sea_level_sg ?? 0,
        originalData: h, // Mantém a referência ao objeto original para o clique
    }));

    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            onBarClick(data.activePayload[0].payload.originalData);
        }
    };

    return (
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 mt-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div onClick={handleChartClick}><Chart data={chartData} dataKey="swell_height_sg" name="Altura do Swell" unit="m" color="#06b6d4" highlightedTimestamp={highlightedTimestamp} /></div>
                <div onClick={handleChartClick}><Chart data={chartData} dataKey="wind_speed_sg" name="Velocidade do Vento" unit="m/s" color="#eab308" highlightedTimestamp={highlightedTimestamp} /></div>
                <div onClick={handleChartClick}><Chart data={chartData} dataKey="sea_level_sg" name="Nível da Maré" unit="m" color="#22c55e" highlightedTimestamp={highlightedTimestamp} /></div>
            </div>
        </div>
    );
};