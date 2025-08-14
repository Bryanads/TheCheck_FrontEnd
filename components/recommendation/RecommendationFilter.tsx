import React, { useState, useEffect } from 'react';
import { Spot, Preset, RecommendationFilters } from '../../types';
import { FilterIcon, ChevronDownIcon, CheckIcon } from '../icons';
import { toUTCTime, toLocalTime } from '../../utils/utils'; 

interface RecommendationFilterProps {
    spots: Spot[];
    presets: Preset[];
    initialFilters: RecommendationFilters | null;
    onSearch: (filters: RecommendationFilters) => void;
    loading: boolean;
}

export const RecommendationFilter: React.FC<RecommendationFilterProps> = ({ spots, presets, initialFilters, onSearch, loading }) => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    
    // O estado interno agora armazena e exibe horários locais
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([]);
    const [dayOffset, setDayOffset] = useState([0]);
    const [startTime, setStartTime] = useState('06:00');
    const [endTime, setEndTime] = useState('18:00');

    // Sincroniza o estado interno, convertendo os horários UTC para local
    useEffect(() => {
        if (initialFilters) {
            setSelectedSpotIds(initialFilters.selectedSpotIds);
            setDayOffset(initialFilters.dayOffset);
            setStartTime(toLocalTime(initialFilters.startTime));
            setEndTime(toLocalTime(initialFilters.endTime));
        }
    }, [initialFilters]);

    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
    };

    const handlePresetApply = (preset: Preset) => {
        setSelectedSpotIds(preset.spot_ids);
        setDayOffset(preset.day_offset_default);
        // Converte os horários UTC do preset para local antes de preencher o formulário
        setStartTime(toLocalTime(preset.start_time)); 
        setEndTime(toLocalTime(preset.end_time));
    };

    const handleSearchClick = () => {
        if (selectedSpotIds.length > 0) {
            // Converte os horários locais do formulário para UTC antes de enviar para a API
            const utcStartTime = toUTCTime(startTime);
            const utcEndTime = toUTCTime(endTime);

            onSearch({ 
                selectedSpotIds, 
                dayOffset, 
                startTime: utcStartTime, 
                endTime: utcEndTime 
            });
        }
    };
    
    return (
        <div className="bg-slate-800/50 rounded-xl shadow-lg transition-all duration-300">
            <div 
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center"><FilterIcon className="mr-3" />Filter Recommendations</h1>
                <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
            </div>
            
            {isFilterVisible && (
                <div className="p-6 pt-0">
                    <div className="grid md:grid-cols-4 gap-6">
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
                                onChange={(e) => setDayOffset(JSON.parse(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="[0]">Today</option>
                                <option value="[1]">Tomorrow</option>
                                <option value="[0,1]">Today & Tomorrow</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-slate-300 font-medium mb-2">Time Range (Local)</label>
                            <div className="flex items-center space-x-2">
                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <button onClick={handleSearchClick} disabled={loading} className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/30 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center float-right">
                            {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                            <CheckIcon className="mr-2"/>
                            Get My Check
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};