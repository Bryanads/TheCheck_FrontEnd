import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, THECHECK_CACHE_KEY } from '../context/AuthContext';
import { createPreset, updatePreset, deletePreset, getRecommendations } from '../services/api';
import { Preset, Spot } from '../types';
import { CogsIcon, PlusIcon, TrashIcon, EditIcon } from '../components/icons';
import { toUTCTime, toLocalTime, weekdaysToDayOffset } from '../utils/utils';

// --- COMPONENTES AUXILIARES E FORMULÁRIO (sem alterações) ---
const WeekdaySelector: React.FC<{
    selectedDays: number[];
    onToggle: (dayIndex: number) => void;
}> = ({ selectedDays, onToggle }) => {
    const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    return (
        <div>
            <label className="block text-slate-300 font-medium mb-2">Dias da Semana</label>
            <div className="flex justify-between items-center space-x-1">
                {days.map((day, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onToggle(index)}
                        className={`w-10 h-10 rounded-full font-bold transition-colors ${
                            selectedDays.includes(index)
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
};

const DefaultPresetSwitch: React.FC<{
    isDefault: boolean;
    onChange: () => void;
    disabled: boolean;
}> = ({ isDefault, onChange, disabled }) => {
    return (
        <label className="inline-flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-slate-400">Default</span>
            <input type="checkbox" checked={isDefault} onChange={onChange} disabled={disabled} className="sr-only peer" />
            <div className={`relative w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 ${disabled ? 'cursor-not-allowed' : ''}`}></div>
        </label>
    );
};

const PresetForm: React.FC<{
    currentPreset: Partial<Preset> | null;
    spots: Spot[];
    onClose: () => void;
    onSave: (presetData: Omit<Preset, 'preset_id' | 'is_active'>, presetId?: number) => Promise<void>;
}> = ({ currentPreset, spots, onClose, onSave }) => {
    const { userId } = useAuth();
    const [name, setName] = useState(currentPreset?.preset_name || '');
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>(currentPreset?.spot_ids || []);
    const [startTime, setStartTime] = useState(toLocalTime(currentPreset?.start_time || '06:00:00'));
    const [endTime, setEndTime] = useState(toLocalTime(currentPreset?.end_time || '18:00:00'));
    const [weekdays, setWeekdays] = useState<number[]>(currentPreset?.weekdays || []);
    const [isSaving, setIsSaving] = useState(false);

    const handleWeekdayToggle = (dayIndex: number) => {
        setWeekdays(prev =>
            prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !name || selectedSpotIds.length === 0 || isSaving) return;
        
        setIsSaving(true);
        const data = {
            user_id: userId,
            preset_name: name,
            spot_ids: selectedSpotIds,
            start_time: toUTCTime(startTime),
            end_time: toUTCTime(endTime),
            weekdays: weekdays,
            is_default: currentPreset?.is_default || false
        };

        try {
            await onSave(data, currentPreset?.preset_id);
        } catch (error) {
            console.error('Failed to save preset from form', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-8 w-full max-w-lg shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">{currentPreset?.preset_id ? 'Edit' : 'Create'} Preset</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campos do formulário... */}
                    <input type="text" placeholder="Preset Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    <div>
                        <label className="block text-slate-300 font-medium mb-2">Spots</label>
                        <div className="max-h-48 overflow-y-auto bg-slate-700 p-2 rounded-lg grid grid-cols-2 gap-2">
                        {spots.map(spot => (
                            <button key={spot.spot_id} type="button" onClick={() => handleSpotToggle(spot.spot_id)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-slate-600'}`}>
                                {spot.spot_name}
                            </button>
                        ))}
                        </div>
                    </div>
                    <WeekdaySelector selectedDays={weekdays} onToggle={handleWeekdayToggle} />
                    <div>
                        <label className="block text-slate-300 font-medium mb-2">Default Time Range (Local)</label>
                        <div className="flex items-center space-x-4">
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            <span className="text-slate-400">to</span>
                             <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-wait" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---
const PresetsPage: React.FC = () => {
    const { userId } = useAuth();
    const navigate = useNavigate();
    const [presets, setPresets] = useState<Preset[]>([]);
    const [spots, setSpots] = useState<Spot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPreset, setCurrentPreset] = useState<Partial<Preset> | null>(null);
    const [updatingPresetId, setUpdatingPresetId] = useState<number | null>(null);

    useEffect(() => {
        setLoading(true);
        const cachedDataStr = localStorage.getItem(THECHECK_CACHE_KEY);
        if (cachedDataStr) {
            const cache = JSON.parse(cachedDataStr);
            setSpots(cache.spots || []);
            setPresets(cache.presets || []);
        } else {
            navigate('/loading');
        }
        setLoading(false);
    }, [navigate]);

    const updateCache = (updater: (cache: any) => any) => {
        const cachedDataStr = localStorage.getItem(THECHECK_CACHE_KEY);
        if (cachedDataStr) {
            const cache = JSON.parse(cachedDataStr);
            const updatedCache = updater(cache);
            localStorage.setItem(THECHECK_CACHE_KEY, JSON.stringify(updatedCache));
            window.dispatchEvent(new Event('thecheck-cache-updated'));
        }
    };

    const fetchAndUpdatePresetRecommendations = async (preset: Preset) => {
        if (!userId) return;
        try {
            const recommendations = await getRecommendations({
                user_id: userId,
                spot_ids: preset.spot_ids,
                day_offset: weekdaysToDayOffset(preset.weekdays),
                start_time: preset.start_time,
                end_time: preset.end_time,
            });
            updateCache(cache => {
                if (!cache.recommendations) cache.recommendations = {};
                cache.recommendations[preset.preset_id] = {
                    timestamp: Date.now(),
                    data: recommendations,
                };
                return cache;
            });
        } catch (error) {
            console.error(`Falha ao buscar recomendações para o preset ${preset.preset_id}`, error);
        }
    };

    const handleSave = async (presetData: Omit<Preset, 'preset_id' | 'is_active'>, presetId?: number) => {
        if (!userId) return;
        try {
            let updatedPreset: Preset;
            if (presetId) {
                await updatePreset(presetId, presetData);
                const updatedPresets = presets.map(p =>
                    p.preset_id === presetId ? { ...p, ...presetData } as Preset : p
                );
                updatedPreset = updatedPresets.find(p => p.preset_id === presetId)!;
                setPresets(updatedPresets);
                updateCache(cache => {
                    delete cache.recommendations[presetId];
                    cache.presets = updatedPresets;
                    return cache;
                });
            } else {
                const { preset_id: newPresetId } = await createPreset(presetData);
                updatedPreset = { ...presetData, preset_id: newPresetId, is_active: true };
                const updatedPresets = [...presets, updatedPreset];
                setPresets(updatedPresets);
                updateCache(cache => {
                    cache.presets = updatedPresets;
                    return cache;
                });
            }
            setIsFormOpen(false);
            fetchAndUpdatePresetRecommendations(updatedPreset);
        } catch (error) {
            console.error("Failed to save preset", error);
            alert("Failed to save preset. Please try again.");
            throw error;
        }
    };

    const handleDelete = async (presetId: number) => {
        if (!userId || updatingPresetId || !window.confirm("Are you sure you want to delete this preset?")) return;
        setUpdatingPresetId(presetId);
        try {
            await deletePreset(presetId, userId);
            const updatedPresets = presets.filter(p => p.preset_id !== presetId);
            setPresets(updatedPresets);
            updateCache(cache => {
                delete cache.recommendations[presetId];
                cache.presets = updatedPresets;
                return cache;
            });
        } catch (error) {
            console.error("Failed to delete preset", error);
            alert("Failed to delete preset.");
        } finally {
            setUpdatingPresetId(null);
        }
    };
    
    const handleSetDefault = async (newDefaultPreset: Preset) => {
        if (!userId || newDefaultPreset.is_default || updatingPresetId) return;
        setUpdatingPresetId(newDefaultPreset.preset_id);
    
        const originalPresets = [...presets];
        const oldDefault = originalPresets.find(p => p.is_default);
        const optimisticPresets = originalPresets.map(p => ({
            ...p, is_default: p.preset_id === newDefaultPreset.preset_id
        }));
        setPresets(optimisticPresets);

        try {
            const promises = [];
            
            // CORREÇÃO: Enviar o objeto completo do preset ao atualizar
            if (oldDefault) {
                const oldDefaultData = { ...oldDefault, is_default: false };
                delete (oldDefaultData as Partial<Preset>).preset_id; // Boa prática remover o ID do corpo do PUT
                promises.push(updatePreset(oldDefault.preset_id, oldDefaultData));
            }

            const newDefaultData = { ...newDefaultPreset, is_default: true };
            delete (newDefaultData as Partial<Preset>).preset_id; // Boa prática remover o ID do corpo do PUT
            promises.push(updatePreset(newDefaultPreset.preset_id, newDefaultData));
            
            await Promise.all(promises);

            // Se a API confirmar, atualiza o cache permanentemente
            updateCache(cache => ({ ...cache, presets: optimisticPresets }));

        } catch (error) {
            console.error('Failed to update default preset', error);
            alert('Could not set the new default preset. Please try again.');
            setPresets(originalPresets); // Reverte a UI em caso de erro na API
        } finally {
            setUpdatingPresetId(null);
        }
    };

    const handleCreate = () => {
        setCurrentPreset(null);
        setIsFormOpen(true);
    };

    const handleEdit = (preset: Preset) => {
        setCurrentPreset(preset);
        setIsFormOpen(true);
    };
    
    if (loading) return <div className="text-center p-10"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-white flex items-center"><CogsIcon className="mr-3"/> My Presets</h1>
                <button onClick={handleCreate} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center space-x-2">
                    <PlusIcon /><span>New Preset</span>
                </button>
            </div>
            <div className="space-y-4">
                {presets.map(preset => (
                    <div key={preset.preset_id} className={`bg-slate-800 rounded-lg p-4 flex justify-between items-center shadow-md transition-opacity ${updatingPresetId === preset.preset_id ? 'opacity-50 animate-pulse' : ''}`}>
                        <div>
                            <h3 className="text-xl font-bold text-white">{preset.preset_name}</h3>
                            <p className="text-slate-400 text-sm">
                                {preset.spot_ids.map(id => spots.find(s => s.spot_id === id)?.spot_name).join(', ')}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <DefaultPresetSwitch 
                                isDefault={preset.is_default}
                                onChange={() => handleSetDefault(preset)}
                                disabled={preset.is_default || !!updatingPresetId}
                            />
                            <button onClick={() => handleEdit(preset)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!updatingPresetId}><EditIcon/></button>
                            <button onClick={() => handleDelete(preset.preset_id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!updatingPresetId}><TrashIcon/></button>
                        </div>
                    </div>
                ))}
            </div>
            {isFormOpen && (
                <PresetForm
                    currentPreset={currentPreset}
                    spots={spots}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default PresetsPage;