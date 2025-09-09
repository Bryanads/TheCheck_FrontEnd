// bryanads/thecheck_frontend/TheCheck_FrontEnd-257372b264015bb625354d50453cccf037b6e08b/components/forecasts/ForecastCharts.tsx
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { HourlyForecast } from '../../types';
import { WaveIcon, WindIcon, ChartBarIcon } from '../icons'; // Importando os ícones

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

// Componente de Gráfico Refatorado para incluir Título e Ícone
const Chart: React.FC<{
    data: any[];
    dataKey: string;
    name: string;
    unit: string;
    color: string;
    highlightedTimestamp: string;
    icon: React.ReactNode;
}> = ({ data, dataKey, name, unit, color, highlightedTimestamp, icon }) => {
    const highlightColor = "#22d3ee"; // cyan-400

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg">
            {/* NOVO: Cabeçalho do Gráfico */}
            <div className="flex items-center mb-3">
                <div className="w-7 h-7 mr-3 text-cyan-400">{icon}</div>
                <h4 className="text-lg font-bold text-white">{name}</h4>
            </div>
            <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="2 2" strokeOpacity={0.2} />
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
        originalData: h,
    }));

    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            onBarClick(data.activePayload[0].payload.originalData);
        }
    };

    return (
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 mt-4 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div onClick={handleChartClick}>
                    <Chart 
                        data={chartData} 
                        dataKey="swell_height_sg" 
                        name="Altura do Swell" 
                        unit="m" 
                        color="#06b6d4" 
                        highlightedTimestamp={highlightedTimestamp} 
                        icon={<WaveIcon />}
                    />
                </div>
                <div onClick={handleChartClick}>
                    <Chart 
                        data={chartData} 
                        dataKey="wind_speed_sg" 
                        name="Velocidade do Vento" 
                        unit="m/s" 
                        color="#eab308" 
                        highlightedTimestamp={highlightedTimestamp} 
                        icon={<WindIcon />}
                    />
                </div>
                {/* Deixando o gráfico de maré ocupar a largura total em telas maiores */}
                <div onClick={handleChartClick} className="lg:col-span-2">
                    <Chart 
                        data={chartData} 
                        dataKey="sea_level_sg" 
                        name="Nível da Maré" 
                        unit="m" 
                        color="#22c55e" 
                        highlightedTimestamp={highlightedTimestamp} 
                        icon={<ChartBarIcon />}
                    />
                </div>
            </div>
        </div>
    );
};