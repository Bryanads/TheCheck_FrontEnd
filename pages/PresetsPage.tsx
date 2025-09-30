import React, { useState, useEffect, useMemo } from 'react';
import { usePresets, useSpots, useCreatePreset, useUpdatePreset, useDeletePreset } from '../hooks';
import { Preset, Spot, PresetCreate, PresetUpdate } from '../types';
import { CogsIcon, PlusIcon, TrashIcon, EditIcon } from '../components/icons';
import { toUTCTime, toLocalTime } from '../utils/utils';

const MAX_DAY_OFFSET = 6;

// --- Componente de Formulário ---
const PresetForm: React.FC<{
    currentPreset: Partial<Preset> | null;
    spots: Spot[];
    onClose: () => void;
    onSave: (presetData: PresetCreate | PresetUpdate, presetId?: number) => Promise<void>;
}> = ({ currentPreset, spots, onClose, onSave }) => {
    const [name, setName] = useState(currentPreset?.name || '');
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>(currentPreset?.spot_ids || []);
    const [startTime, setStartTime] = useState(toLocalTime(currentPreset?.start_time || '08:00:00'));
    const [endTime, setEndTime] = useState(toLocalTime(currentPreset?.end_time || '20:00:00'));
    const [daySelectionType, setDaySelectionType] = useState<'offsets' | 'weekdays'>(currentPreset?.day_selection_type || 'offsets');
    const [daySelectionValues, setDaySelectionValues] = useState<number[]>(currentPreset?.day_selection_values || [0]);
    const [isDefault, setIsDefault] = useState(currentPreset?.is_default || false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) { setError("O nome do preset é obrigatório."); return; }
        if (selectedSpotIds.length === 0) { setError("Selecione pelo menos um spot."); return; }
        if (daySelectionValues.length === 0) { setError("Selecione pelo menos um dia."); return; }
        
        setIsSaving(true);
        const data = {
            name,
            spot_ids: selectedSpotIds,
            start_time: toUTCTime(startTime),
            end_time: toUTCTime(endTime),
            day_selection_type: daySelectionType,
            day_selection_values: daySelectionValues,
            is_default: isDefault,
        };

        try {
            await onSave(data, currentPreset?.preset_id);
            onClose();
        } catch (err) {
            setError("Falha ao salvar o preset. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-8 w-full max-w-lg shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">{currentPreset?.preset_id ? 'Editar' : 'Criar'} Preset</h3>
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nome do Preset" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    <div>
                        <label className="block text-slate-300 font-medium mb-2">Spots</label>
                        <div className="max-h-32 overflow-y-auto bg-slate-700 p-2 rounded-lg grid grid-cols-2 gap-2">
                        {spots.map(spot => (
                            <button key={spot.spot_id} type="button" onClick={() => handleSpotToggle(spot.spot_id)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-slate-600'}`}>
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
                            <span className="text-slate-400">até</span>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"/>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="is_default" className="text-slate-300 font-medium">Tornar este o preset padrão?</label>
                        <input type="checkbox" id="is_default" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="w-5 h-5 rounded text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-600"/>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg" disabled={isSaving}>Cancelar</button>
                        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componente Principal da Página ---
const PresetsPage: React.FC = () => {
    const { data: presets, isLoading: isLoadingPresets, refetch } = usePresets();
    const { data: spots, isLoading: isLoadingSpots } = useSpots();
    const { mutateAsync: createPreset } = useCreatePreset();
    const { mutateAsync: updatePreset } = useUpdatePreset();
    const { mutateAsync: deletePreset } = useDeletePreset();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPreset, setCurrentPreset] = useState<Partial<Preset> | null>(null);

    // LÓGICA PARA ENCONTRAR O PRESET INICIAL (COM MENOR ID)
    const initialPresetId = useMemo(() => {
        if (!presets || presets.length === 0) return null;
        return Math.min(...presets.map(p => p.preset_id));
    }, [presets]);

    const handleSave = async (presetData: PresetCreate | PresetUpdate, presetId?: number) => {
        if (presetId) {
            await updatePreset({ presetId, updates: presetData });
        } else {
            await createPreset(presetData as PresetCreate);
        }
        refetch();
    };

    const handleDelete = async (presetId: number) => {
        if (window.confirm("Tem certeza que deseja deletar este preset?")) {
            await deletePreset(presetId);
            refetch();
        }
    };
    
    const handleSetDefault = async (preset: Preset) => {
        if(preset.is_default) return;
        const currentDefault = presets?.find(p => p.is_default);
        const promises = [];
        if(currentDefault) {
            promises.push(updatePreset({ presetId: currentDefault.preset_id, updates: { is_default: false } }));
        }
        promises.push(updatePreset({ presetId: preset.preset_id, updates: { is_default: true } }));
        await Promise.all(promises);
        refetch();
    };

    if (isLoadingPresets || isLoadingSpots) return <div className="text-center p-10"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-white flex items-center"><CogsIcon className="mr-3"/> My Presets</h1>
                <button onClick={() => { setCurrentPreset(null); setIsFormOpen(true); }} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center space-x-2">
                    <PlusIcon /><span>New Preset</span>
                </button>
            </div>
            <div className="space-y-4">
                {presets?.map(preset => {
                    const isInitialPreset = preset.preset_id === initialPresetId;
                    return (
                        <div key={preset.preset_id} className="bg-slate-800 rounded-lg p-4 flex justify-between items-center shadow-md">
                            <div>
                                <h3 className="text-xl font-bold text-white">{preset.name}</h3>
                                <p className="text-slate-400 text-sm">
                                    {preset.spot_ids.map(id => spots?.find(s => s.spot_id === id)?.name).join(', ')}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button onClick={() => handleSetDefault(preset)} disabled={preset.is_default} className="text-sm font-semibold disabled:text-yellow-400 text-slate-400 hover:text-yellow-400 disabled:cursor-not-allowed">{preset.is_default ? 'Padrão' : 'Tornar Padrão'}</button>
                                <button onClick={() => { setCurrentPreset(preset); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-white"><EditIcon/></button>
                                
                                {/* BOTÃO DE DELETAR COM A TRAVA */}
                                <button 
                                    onClick={() => handleDelete(preset.preset_id)} 
                                    disabled={isInitialPreset}
                                    className="p-2 text-slate-400 hover:text-red-500 disabled:text-slate-600 disabled:cursor-not-allowed"
                                    title={isInitialPreset ? "O preset inicial não pode ser apagado." : "Deletar preset"}
                                >
                                    <TrashIcon/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {isFormOpen && (
                <PresetForm
                    currentPreset={currentPreset}
                    spots={spots || []}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default PresetsPage;