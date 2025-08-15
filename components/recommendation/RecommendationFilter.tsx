import React, { useState, useEffect } from 'react';
import { Spot, Preset, RecommendationFilters } from '../../types';
import { FilterIcon, ChevronDownIcon, CheckIcon } from '../icons';
import { toUTCTime, toLocalTime, weekdaysToDayOffset } from '../../utils/utils'; 

const CUSTOM_FILTER_CACHE_KEY = 'thecheck_custom_filter_session';

interface RecommendationFilterProps {
    spots: Spot[];
    presets: Preset[];
    initialFilters: RecommendationFilters | null;
    onSearch: (filters: RecommendationFilters) => void;
    loading: boolean;
}

export const RecommendationFilter: React.FC<RecommendationFilterProps> = ({ spots, presets, onSearch, loading }) => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
    const [activePresetName, setActivePresetName] = useState<string | null>('Default');

    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([]);
    const [dayOffset, setDayOffset] = useState([0]);
    const [startTime, setStartTime] = useState('06:00');
    const [endTime, setEndTime] = useState('18:00');

    useEffect(() => {
        const defaultPreset = presets.find(p => p.is_default);
        if (defaultPreset) {
            setActivePresetName(defaultPreset.preset_name);
        } else if (presets.length > 0) {
            setActivePresetName(presets[0].preset_name);
        }

        const cachedCustomFilter = sessionStorage.getItem(CUSTOM_FILTER_CACHE_KEY);
        if (cachedCustomFilter) {
            const filters: RecommendationFilters = JSON.parse(cachedCustomFilter);
            setSelectedSpotIds(filters.selectedSpotIds);
            setDayOffset(filters.dayOffset);
            setStartTime(toLocalTime(filters.startTime));
            setEndTime(toLocalTime(filters.endTime));
            setActivePresetName('Custom Filter');
            setActiveTab('custom');
        } else if (defaultPreset) {
            setSelectedSpotIds(defaultPreset.spot_ids);
            setDayOffset(weekdaysToDayOffset(defaultPreset.weekdays));
            setStartTime(toLocalTime(defaultPreset.start_time));
            setEndTime(toLocalTime(defaultPreset.end_time));
        }

    }, [presets]);

    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
        setActivePresetName('Custom Filter');
    };

    const handlePresetSearch = (preset: Preset) => {
        const filters: RecommendationFilters = {
            selectedSpotIds: preset.spot_ids,
            dayOffset: weekdaysToDayOffset(preset.weekdays),
            startTime: preset.start_time,
            endTime: preset.end_time,
        };
        onSearch(filters);
        setActivePresetName(preset.preset_name);
        setIsFilterVisible(false);
    };

    const handleCustomSearchClick = () => {
        if (selectedSpotIds.length > 0) {
            const filters = { 
                selectedSpotIds, 
                dayOffset, 
                startTime: toUTCTime(startTime), 
                endTime: toUTCTime(endTime) 
            };
            onSearch(filters);
            setActivePresetName('Custom Filter');
            setIsFilterVisible(false);
        }
    };
    
    return (
        <div className="bg-slate-800/50 rounded-xl shadow-lg transition-all duration-300">
            <div 
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
                <div className="flex items-center">
                    <FilterIcon className="mr-3 w-7 h-7" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Filtros</h1>
                        <p className="text-sm text-cyan-300 font-medium">{activePresetName}</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
            </div>
            
            {isFilterVisible && (
                <div className="p-6 pt-0">
                    <div className="flex border-b border-slate-700">
                        <button 
                            onClick={() => setActiveTab('preset')}
                            className={`py-2 px-4 font-medium transition-colors ${activeTab === 'preset' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            Meus Presets
                        </button>
                        <button 
                            onClick={() => setActiveTab('custom')}
                            className={`py-2 px-4 font-medium transition-colors ${activeTab === 'custom' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            Filtro Personalizado
                        </button>
                    </div>

                    {activeTab === 'preset' && (
                        <div className="pt-6">
                            <label className="block text-slate-300 font-medium mb-2">Selecione um Preset para buscar</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {presets.map(preset => (
                                    <button 
                                        key={preset.preset_id} 
                                        onClick={() => handlePresetSearch(preset)} 
                                        disabled={loading}
                                        className="text-left p-3 rounded-md transition-colors bg-slate-700 hover:bg-slate-600 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="font-semibold">{preset.preset_name}</span>
                                        {preset.is_default && <span className="text-xs bg-cyan-800 text-cyan-200 px-2 py-0.5 rounded-full">Padrão</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'custom' && (
                        <div className="pt-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <label className="block text-slate-300 font-medium mb-2">Spots de Surf</label>
                                    <div className="max-h-48 overflow-y-auto bg-slate-700 p-2 rounded-lg space-y-2">
                                    {spots.map(spot => (
                                        <button key={spot.spot_id} onClick={() => handleSpotToggle(spot.spot_id)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-slate-600'}`}>
                                            {spot.spot_name}
                                        </button>
                                    ))}
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-slate-300 font-medium mb-2">Dias a partir de Hoje</label>
                                    <select
                                        value={JSON.stringify(dayOffset)}
                                        onChange={(e) => {
                                            setDayOffset(JSON.parse(e.target.value));
                                            setActivePresetName('Custom Filter');
                                        }}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="[0]">Hoje</option>
                                        <option value="[1]">Amanhã</option>
                                        <option value="[0,1]">Hoje & Amanhã</option>
                                    </select>
                                </div>
                                <div className="flex flex-col md:col-span-1">
                                    <label className="block text-slate-300 font-medium mb-2">Intervalo de Horas (Local)</label>
                                    <div className="flex flex-col space-y-2">
                                        <input type="time" value={startTime} onChange={(e) => { setStartTime(e.target.value); setActivePresetName('Custom Filter'); }} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                                        <input type="time" value={endTime} onChange={(e) => { setEndTime(e.target.value); setActivePresetName('Custom Filter'); }} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 text-right">
                                <button onClick={handleCustomSearchClick} disabled={loading} className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/30 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center float-right">
                                    {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                                    <CheckIcon className="mr-2"/>
                                    Obter Recomendações
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};