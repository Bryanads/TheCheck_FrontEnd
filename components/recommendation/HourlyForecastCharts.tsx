import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell, ComposedChart, ReferenceLine } from 'recharts';
import { HourlyRecommendation, SpotPreferences } from '../../types';
import { degreesToCardinal } from '../../utils/utils';

interface HourlyForecastChartsProps {
    allHoursData: HourlyRecommendation[];
    spotlightHour: HourlyRecommendation;
    onBarClick: (hour: HourlyRecommendation) => void;
    spotPreferences: SpotPreferences;
}

const getScoreColor = (s: number): string => {
    if (s > 75) return '#419c36'; // green-500
    if (s > 50) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
};

const ForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 shadow-xl">
                <p className="font-bold text-white mb-2">{`Hora: ${label}`}</p>
                {payload.map((p: any) => (
                    <p key={p.dataKey} style={{ color: p.color }}>
                        {`${p.name}: ${p.value.toFixed(2)}${p.unit}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// --- CORREÇÃO AQUI ---
// Adicionado spotPreferences à desestruturação das props
export const HourlyForecastCharts: React.FC<HourlyForecastChartsProps> = ({ allHoursData, spotlightHour, onBarClick, spotPreferences }) => {
    
    const chartData = allHoursData
        .sort((a, b) => new Date(a.timestamp_utc).getTime() - new Date(b.timestamp_utc).getTime())
        .map(rec => ({
            time: new Date(rec.timestamp_utc).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }),
            ...rec.forecast_conditions,
            timestamp_utc: rec.timestamp_utc,
            originalRec: rec 
        }));

    const primaryColor = '#435f6d';
    const spotlightColor = '#22d3ee';

    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            onBarClick(data.activePayload[0].payload.originalRec);
        }
    };

    return (
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 mt-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                
                {/* --- GRÁFICO DE ONDA COM LINHA DE REFERÊNCIA --- */}
                <div>
                    <div className="flex justify-center items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold" style={{ color: getScoreColor(spotlightHour.detailed_scores.wave_score) }}>
                                {spotlightHour.detailed_scores.wave_score.toFixed(0)}
                            </span>
                            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Wave</h4>
                        </div>
                        <div className="text-xs text-slate-300 flex items-center space-x-2">
                            <span>{spotlightHour.forecast_conditions.wave_height_sg.toFixed(1)}m</span>
                            <span className="text-slate-500">|</span>
                            <span>{spotlightHour.forecast_conditions.wave_period_sg.toFixed(0)}s</span>
                            <span className="text-slate-500">|</span>
                            <span>{degreesToCardinal(spotlightHour.forecast_conditions.wave_direction_sg)}</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                            <XAxis dataKey="time" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#a0aec0', fontSize: 10 }} domain={[0, 'auto']} unit="m" />
                            <Tooltip content={<ForecastTooltip />} cursor={{ fill: 'rgba(45, 55, 72, 0.8)' }} />
                            <Bar dataKey="wave_height_sg" name="Height" unit="m" maxBarSize={32}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.timestamp_utc}`} fill={entry.timestamp_utc === spotlightHour.timestamp_utc ? spotlightColor : primaryColor} />
                                ))}
                            </Bar>
                            <ReferenceLine y={spotPreferences.ideal_wave_height} stroke={getScoreColor(spotlightHour.detailed_scores.wave_score)}  strokeDasharray="3 3" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* --- GRÁFICO DE VENTO COM LINHA DE REFERÊNCIA --- */}
                <div>
                     <div className="flex justify-center items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold" style={{ color: getScoreColor(spotlightHour.detailed_scores.wind_score) }}>
                                {spotlightHour.detailed_scores.wind_score.toFixed(0)}
                            </span>
                            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Wind</h4>
                        </div>
                        <div className="text-xs text-slate-300 flex items-center space-x-2">
                           <span>{spotlightHour.forecast_conditions.wind_speed_sg.toFixed(1)} m/s</span>
                           <span className="text-slate-500">|</span>
                           <span>{degreesToCardinal(spotlightHour.forecast_conditions.wind_direction_sg)}</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                            <XAxis dataKey="time" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#a0aec0', fontSize: 10 }} domain={[0, 'auto']} unit=" m/s" />
                            <Tooltip content={<ForecastTooltip />} cursor={{ fill: 'rgba(45, 55, 72, 0.8)' }} />
                            <Bar dataKey="wind_speed_sg" name="Speed" unit=" m/s" maxBarSize={32}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.timestamp_utc}`} fill={entry.timestamp_utc === spotlightHour.timestamp_utc ? spotlightColor : primaryColor} />
                                ))}
                            </Bar>
                            <ReferenceLine y={spotPreferences.ideal_wind_speed} stroke={getScoreColor(spotlightHour.detailed_scores.wind_score)}  strokeDasharray="3 3" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* --- GRÁFICO DE MARÉ COM LINHA DE REFERÊNCIA --- */}
                <div>
                     <div className="flex justify-center items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold" style={{ color: getScoreColor(spotlightHour.detailed_scores.tide_score) }}>
                                {spotlightHour.detailed_scores.tide_score.toFixed(0)}
                            </span>
                            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Tide</h4>
                        </div>
                        <div className="text-xs text-slate-300 flex items-center space-x-2">
                           <span>{spotlightHour.forecast_conditions.sea_level_sg.toFixed(2)}m</span>
                           <span className="text-slate-500">|</span>
                           <span className="capitalize">{spotlightHour.forecast_conditions.tide_phase}</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                            <XAxis dataKey="time" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#a0aec0', fontSize: 10 }} domain={['auto', 'auto']} unit="m" />
                            <Tooltip content={<ForecastTooltip />} cursor={{ fill: 'rgba(45, 55, 72, 0.8)' }} />
                            <Bar dataKey="sea_level_sg" name="Level" unit="m" maxBarSize={32}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.timestamp_utc}`} fill={entry.timestamp_utc === spotlightHour.timestamp_utc ? spotlightColor : primaryColor} />
                                ))}
                            </Bar>
                            <ReferenceLine y={spotPreferences.ideal_sea_level} stroke={getScoreColor(spotlightHour.detailed_scores.tide_score)}  strokeDasharray="3 3" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* --- GRÁFICO DE TEMPERATURA COM LINHAS DE REFERÊNCIA --- */}
                <div>
                    <div className="flex justify-center items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold" style={{ color: getScoreColor((spotlightHour.detailed_scores.water_temperature_score + spotlightHour.detailed_scores.air_temperature_score) / 2) }}>
                                {((spotlightHour.detailed_scores.water_temperature_score + spotlightHour.detailed_scores.air_temperature_score) / 2).toFixed(0)}
                            </span>
                            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Temp</h4>
                        </div>
                        <div className="text-xs text-slate-300 flex items-center space-x-2">
                           <span>Water: {spotlightHour.forecast_conditions.water_temperature_sg.toFixed(0)}°</span>
                           <span className="text-slate-500">|</span>
                           <span>Air: {spotlightHour.forecast_conditions.air_temperature_sg.toFixed(0)}°</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                            <XAxis dataKey="time" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#a0aec0', fontSize: 10 }} domain={[0, 'auto']} unit="°C" />
                            <Tooltip content={<ForecastTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#a0aec0' }} />
                            <Bar dataKey="water_temperature_sg" name="Water" unit="°C" fill="#3b82f6" barSize={12}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-water-${entry.timestamp_utc}`} fill={entry.timestamp_utc === spotlightHour.timestamp_utc ? spotlightColor : '#3b82f6'} />
                                ))}
                            </Bar>
                            <Bar dataKey="air_temperature_sg" name="Air" unit="°C" fill="#818cf8" barSize={12}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-air-${entry.timestamp_utc}`} fill={entry.timestamp_utc === spotlightHour.timestamp_utc ? spotlightColor : '#818cf8'} />
                                ))}
                            </Bar>
                            <ReferenceLine y={spotPreferences.ideal_air_temperature} stroke={getScoreColor(spotlightHour.detailed_scores.air_temperature_score)}  strokeDasharray="3 3" />
                            <ReferenceLine y={spotPreferences.ideal_water_temperature} stroke={getScoreColor(spotlightHour.detailed_scores.water_temperature_score)}  strokeDasharray="3 3" />

                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};