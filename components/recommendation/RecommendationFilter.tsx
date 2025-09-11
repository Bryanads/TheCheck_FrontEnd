// bryanads/thecheck_frontend/TheCheck_FrontEnd/src/components/recommendation/RecommendationFilter.tsx
import React, { useState, useEffect } from 'react';
import { Spot, Preset, RecommendationRequest } from '../../types';
import { FilterIcon, ChevronDownIcon, CheckIcon } from '../icons';
import { toUTCTime, toLocalTime } from '../../utils/utils';

interface RecommendationFilterProps {
    spots: Spot[];
    presets: Preset[];
    onSearch: (filters: RecommendationRequest) => void;
    loading: boolean;
    activePresetName: string | null;
}

const MAX_DAY_OFFSET = 6;

export const RecommendationFilter: React.FC<RecommendationFilterProps> = ({ spots, presets, onSearch, loading, activePresetName }) => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
    
    // State para o filtro customizado
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([]);
    const [daySelectionType, setDaySelectionType] = useState<'offsets' | 'weekdays'>('offsets');
    const [daySelectionValues, setDaySelectionValues] = useState<number[]>([0]);
    const [startTime, setStartTime] = useState('06:00');
    const [endTime, setEndTime] = useState('18:00');

    // Define o estado inicial a partir do preset padrão
    useEffect(() => {
        const defaultPreset = presets.find(p => p.is_default) || presets[0];
        if (defaultPreset) {
            setSelectedSpotIds(defaultPreset.spot_ids);
            setDaySelectionType(defaultPreset.day_selection_type);
            setDaySelectionValues(defaultPreset.day_selection_values);
            setStartTime(toLocalTime(defaultPreset.start_time));
            setEndTime(toLocalTime(defaultPreset.end_time));
        }
    }, [presets]);

    const handlePresetSearch = (preset: Preset) => {
        const request: RecommendationRequest = {
            spot_ids: preset.spot_ids,
            day_selection: {
                type: preset.day_selection_type,
                values: preset.day_selection_values
            },
            time_window: {
                start: preset.start_time,
                end: preset.end_time
            }
        };
        onSearch(request);
        setIsFilterVisible(false);
    };

    const handleCustomSearchClick = () => {
        if (selectedSpotIds.length > 0 && daySelectionValues.length > 0) {
            const request: RecommendationRequest = {
                spot_ids: selectedSpotIds,
                day_selection: {
                    type: daySelectionType,
                    values: daySelectionValues,
                },
                time_window: {
                    start: toUTCTime(startTime),
                    end: toUTCTime(endTime),
                },
            };
            onSearch(request);
            setIsFilterVisible(false);
        }
    };
    
    const handleDayTypeChange = (type: 'offsets' | 'weekdays') => {
        setDaySelectionType(type);
        setDaySelectionValues(type === 'offsets' ? [0] : []);
    };

    const handleOffsetChange = (newOffset: number) => {
        const offset = Math.max(0, Math.min(newOffset, MAX_DAY_OFFSET));
        const newValues = Array.from({ length: offset + 1 }, (_, i) => i);
        setDaySelectionValues(newValues);
    };

    const handleWeekdayToggle = (dayIndex: number) => {
        setDaySelectionValues(prev =>
            prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
        );
    };

    return (
        <div className="bg-slate-800/50 rounded-xl shadow-lg transition-all duration-300">
            <div className="p-6 cursor-pointer flex justify-between items-center" onClick={() => setIsFilterVisible(!isFilterVisible)}>
                <div className="flex items-center">
                    <FilterIcon className="mr-3 w-7 h-7" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Filtros</h1>
                        <p className="text-sm text-cyan-300 font-medium">{activePresetName || 'Selecione um filtro'}</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} />
            </div>
            
            {isFilterVisible && (
                <div className="p-6 pt-0">
                    <div className="flex border-b border-slate-700">
                        <button onClick={() => setActiveTab('preset')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'preset' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>Meus Presets</button>
                        <button onClick={() => setActiveTab('custom')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'custom' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>Filtro Personalizado</button>
                    </div>

                    {activeTab === 'preset' && (
                        <div className="pt-6">
                            <label className="block text-slate-300 font-medium mb-2">Selecione um Preset para buscar</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {presets.map(preset => (
                                    <button key={preset.preset_id} onClick={() => handlePresetSearch(preset)} disabled={loading} className="text-left p-3 rounded-md transition-colors bg-slate-700 hover:bg-slate-600 flex justify-between items-center disabled:opacity-50">
                                        <span className="font-semibold">{preset.name}</span>
                                        {preset.is_default && <span className="text-xs bg-cyan-800 text-cyan-200 px-2 py-0.5 rounded-full">Padrão</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'custom' && (
                        <div className="pt-6 space-y-4">
                            <div>
                                <label className="block text-slate-300 font-medium mb-2">Spots de Surf</label>
                                <div className="max-h-32 overflow-y-auto bg-slate-700 p-2 rounded-lg grid grid-cols-2 gap-2">
                                    {spots.map(spot => (
                                        <button key={spot.spot_id} onClick={() => setSelectedSpotIds(prev => prev.includes(spot.spot_id) ? prev.filter(id => id !== spot.spot_id) : [...prev, spot.spot_id])} className={`w-full text-left p-2 rounded-md transition-colors ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-slate-600'}`}>
                                            {spot.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-slate-300 font-medium mb-2">Dias para o Check</label>
                                <div className="flex bg-slate-700 rounded-lg p-1">
                                    <button type="button" onClick={() => handleDayTypeChange('offsets')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition ${daySelectionType === 'offsets' ? 'bg-cyan-500 text-slate-900' : 'text-slate-300'}`}>A partir de Hoje</button>
                                    <button type="button" onClick={() => handleDayTypeChange('weekdays')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition ${daySelectionType === 'weekdays' ? 'bg-cyan-500 text-slate-900' : 'text-slate-300'}`}>Dias da Semana</button>
                                </div>
                                <div className="mt-2">
                                    {daySelectionType === 'offsets' ? (
                                        <div className="flex items-center justify-center space-x-4 bg-slate-700 p-2 rounded-lg">
                                            <button type="button" onClick={() => handleOffsetChange(daySelectionValues.length - 2)} className="bg-slate-600 w-8 h-8 rounded-full font-bold">-</button>
                                            <span className="font-bold w-24 text-center">{daySelectionValues.length} dia(s)</span>
                                            <button type="button" onClick={() => handleOffsetChange(daySelectionValues.length)} className="bg-slate-600 w-8 h-8 rounded-full font-bold">+</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center space-x-1">
                                            {['D','S','T','Q','Q','S','S'].map((day, index) => (
                                                <button key={index} type="button" onClick={() => handleWeekdayToggle(index)} className={`w-10 h-10 rounded-full font-bold transition-colors ${daySelectionValues.includes(index) ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'}`}>{day}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-medium mb-2">Intervalo de Horas (Local)</label>
                                <div className="flex items-center space-x-4">
                                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"/>
                                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"/>
                                </div>
                            </div>

                            <div className="mt-6 text-right">
                                <button onClick={handleCustomSearchClick} disabled={loading || selectedSpotIds.length === 0} className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center float-right">
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