
import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { getSpots, getRecommendations, getPresets } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spot, SpotRecommendation, HourlyRecommendation, Preset } from '../types';
import { CheckIcon, ClockIcon, FilterIcon, SunIcon, WaveIcon, WindIcon } from '../components/icons';

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const getScoreColor = (s: number) => {
        if (s > 75) return '#22c55e'; // green-500
        if (s > 50) return '#eab308'; // yellow-500
        return '#ef4444'; // red-500
    };
    const data = [{ name: 'score', value: score }];

    return (
        <div className="w-24 h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={data}
                    startAngle={90}
                    endAngle={-270}
                >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        fill={getScoreColor(score)}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{color: getScoreColor(score)}}>{Math.round(score)}</span>
            </div>
        </div>
    );
};

const RecommendationCard: React.FC<{ rec: HourlyRecommendation }> = ({ rec }) => {
    const date = new Date(rec.timestamp_utc);
    const getScoreColorClass = (s: number) => {
      if (s > 75) return 'text-green-400';
      if (s > 50) return 'text-yellow-400';
      return 'text-red-400';
    };
    const detailScoresData = Object.entries(rec.detailed_scores).map(([name, value]) => ({ name: name.replace(/_score/g, ' ').replace(/_/g, ' '), value }));

    return (
        <div className="bg-slate-800 rounded-lg p-4 snap-start flex-shrink-0 w-80">
            <div className="flex justify-between items-center">
                <div className="text-xl font-bold text-white">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <ScoreGauge score={rec.suitability_score} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
                <div className="flex items-center space-x-2"><WaveIcon className="w-5 h-5 text-cyan-400" /><span>{rec.forecast_conditions.wave_height_sg.toFixed(1)}m @ {rec.forecast_conditions.wave_period_sg.toFixed(0)}s</span></div>
                <div className="flex items-center space-x-2"><WindIcon className="w-5 h-5 text-cyan-400" /><span>{rec.forecast_conditions.wind_speed_sg.toFixed(0)} km/h</span></div>
                <div className="flex items-center space-x-2"><SunIcon className="w-5 h-5 text-cyan-400" /><span>{rec.forecast_conditions.air_temperature_sg.toFixed(0)}°C Air</span></div>
                <div className="flex items-center space-x-2"><ClockIcon className="w-5 h-5 text-cyan-400" /><span>Tide: {rec.forecast_conditions.tide_phase}</span></div>
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


const RecommendationsPage: React.FC = () => {
    const { userId } = useAuth();
    const [spots, setSpots] = useState<Spot[]>([]);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([]);
    const [dayOffset, setDayOffset] = useState([0]);
    const [recommendations, setRecommendations] = useState<SpotRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            try {
                const [spotsData, presetsData] = await Promise.all([getSpots(), getPresets(userId)]);
                setSpots(spotsData);
                setPresets(presetsData);
                const defaultPreset = presetsData.find(p => p.is_default);
                if (defaultPreset) {
                    setSelectedSpotIds(defaultPreset.spot_ids);
                    setDayOffset(defaultPreset.day_offset_default);
                } else if(spotsData.length > 0) {
                   setSelectedSpotIds([spotsData[0].spot_id]);
                }
            } catch (err) {
                setError('Failed to load initial data.');
            }
        };
        fetchData();
    }, [userId]);
    
    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
    };
    
    const handleGetRecommendations = useCallback(async () => {
        if (!userId || selectedSpotIds.length === 0) {
            setError("Please select at least one spot.");
            return;
        }
        setLoading(true);
        setError(null);
        setRecommendations([]);
        try {
            const data = {
                user_id: userId,
                spot_ids: selectedSpotIds,
                day_offset: dayOffset,
                start_time: "05:00",
                end_time: "17:00"
            };
            const result = await getRecommendations(data);
            setRecommendations(result);
        } catch (err: any) {
            setError(err.message || "Failed to fetch recommendations.");
        } finally {
            setLoading(false);
        }
    }, [userId, selectedSpotIds, dayOffset]);

    const handlePresetApply = (preset: Preset) => {
        setSelectedSpotIds(preset.spot_ids);
        setDayOffset(preset.day_offset_default);
    };

    return (
        <div className="space-y-8">
            <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-4 flex items-center"><FilterIcon className="mr-3" />Filter Recommendations</h1>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-slate-300 font-medium mb-2">Surf Spots</label>
                        <div className="max-h-48 overflow-y-auto bg-slate-700 p-2 rounded-lg space-y-2">
                        {spots.map(spot => (
                            <button key={spot.spot_id} onClick={() => handleSpotToggle(spot.spot_id)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-slate-600'}`}>
                                {spot.spot_name}
                            </button>
                        ))}
                        </div>
                    </div>
                    <div>
                         <label className="block text-slate-300 font-medium mb-2">Presets</label>
                        <div className="space-y-2">
                        {presets.map(preset => (
                            <button key={preset.preset_id} onClick={() => handlePresetApply(preset)} className="w-full text-left p-2 rounded-md transition-colors bg-slate-700 hover:bg-slate-600 flex justify-between items-center">
                                <span>{preset.preset_name}</span>
                                {preset.is_default && <span className="text-xs bg-cyan-800 text-cyan-200 px-2 py-0.5 rounded-full">Default</span>}
                            </button>
                        ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-300 font-medium mb-2">Days from Today</label>
                        <select
                            value={JSON.stringify(dayOffset)}
                            onChange={e => setDayOffset(JSON.parse(e.target.value))}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="[0]">Today</option>
                            <option value="[1]">Tomorrow</option>
                            <option value="[0,1]">Today & Tomorrow</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 text-right">
                    <button onClick={handleGetRecommendations} disabled={loading} className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/30 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center float-right">
                         {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                         <CheckIcon className="mr-2"/>
                         Get My Check
                    </button>
                </div>
            </div>

            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center">{error}</p>}

            <div className="space-y-8">
                {loading && (
                    <div className="text-center p-10">
                        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-slate-300">Checking the surf for you...</p>
                    </div>
                )}
                {!loading && recommendations.length === 0 && !error && (
                    <div className="text-center p-10 bg-slate-800/50 rounded-xl">
                        <WaveIcon className="w-12 h-12 mx-auto text-slate-500" />
                        <h3 className="mt-4 text-xl font-bold text-white">Ready to surf?</h3>
                        <p className="text-slate-400">Select your spots and hit "Get My Check" to see your personalized recommendations.</p>
                    </div>
                )}
                {recommendations.map(spotRec => (
                    <div key={spotRec.spot_id}>
                        <h2 className="text-2xl font-bold text-white mb-4">{spotRec.spot_name}</h2>
                        {spotRec.day_offsets.map(dayRec => (
                            <div key={dayRec.day_offset} className="mb-6">
                                <h3 className="text-lg font-semibold text-cyan-400 mb-3">{dayRec.day_offset === 0 ? "Today" : `In ${dayRec.day_offset} day(s)`}</h3>
                                {dayRec.recommendations.length > 0 ? (
                                    <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory">
                                        {dayRec.recommendations
                                            .sort((a, b) => b.suitability_score - a.suitability_score)
                                            .map(rec => <RecommendationCard key={rec.timestamp_utc} rec={rec} />)}
                                    </div>
                                ) : (
                                    <p className="text-slate-400">No suitable conditions found for this day.</p>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendationsPage;
