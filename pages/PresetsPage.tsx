import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar o hook de navegação
import { useAuth, SPOTS_CACHE_KEY, PRESETS_SESSION_CACHE_KEY, DEFAULT_PRESET_LOCAL_CACHE_KEY, RECOMMENDATIONS_CACHE_KEY } from '../context/AuthContext';
import { getPresets, createPreset, updatePreset, deletePreset, getSpots } from '../services/api';
import { Preset, Spot } from '../types';
import { CogsIcon, PlusIcon, TrashIcon, EditIcon } from '../components/icons';
import { toUTCTime, toLocalTime } from '../utils/utils';

const PresetForm: React.FC<{
    currentPreset: Partial<Preset> | null;
    spots: Spot[];
    onClose: () => void;
    onSave: () => void;
}> = ({ currentPreset, spots, onClose, onSave }) => {
    const { userId } = useAuth();
    const [name, setName] = useState(currentPreset?.preset_name || '');
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>(currentPreset?.spot_ids || []);
    const [startTime, setStartTime] = useState(toLocalTime(currentPreset?.start_time || '06:00:00'));
    const [endTime, setEndTime] = useState(toLocalTime(currentPreset?.end_time || '18:00:00'));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !name || selectedSpotIds.length === 0) return;
        
        const data = {
            user_id: userId,
            preset_name: name,
            spot_ids: selectedSpotIds,
            start_time: toUTCTime(startTime),
            end_time: toUTCTime(endTime),
            day_offset_default: currentPreset?.day_offset_default || [0],
            is_default: currentPreset?.is_default || false
        };

        try {
            if (currentPreset?.preset_id) {
                await updatePreset(currentPreset.preset_id, data);
            } else {
                await createPreset(data);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save preset', error);
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
                    <div>
                        <label className="block text-slate-300 font-medium mb-2">Default Time Range (Local)</label>
                        <div className="flex items-center space-x-4">
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            <span className="text-slate-400">to</span>
                             <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                    </div>
                </form>
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
            <div className="relative w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
    );
};


const PresetsPage: React.FC = () => {
    const { userId } = useAuth();
    const [presets, setPresets] = useState<Preset[]>([]);
    const [spots, setSpots] = useState<Spot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPreset, setCurrentPreset] = useState<Partial<Preset> | null>(null);
    const [updatingDefault, setUpdatingDefault] = useState<number | null>(null);

    const fetchPresetsAndSpots = useCallback(async (forceRefresh = false) => {
        if (!userId) return;
        setLoading(true);
        try {
            const cachedSpotsStr = sessionStorage.getItem(SPOTS_CACHE_KEY);
            if (cachedSpotsStr) { setSpots(JSON.parse(cachedSpotsStr)); } 
            else {
                const spotsData = await getSpots();
                setSpots(spotsData);
                sessionStorage.setItem(SPOTS_CACHE_KEY, JSON.stringify(spotsData));
            }

            const cachedPresetsStr = sessionStorage.getItem(PRESETS_SESSION_CACHE_KEY);
            if (cachedPresetsStr && !forceRefresh) {
                setPresets(JSON.parse(cachedPresetsStr));
            } else {
                const presetsData = await getPresets(userId);
                setPresets(presetsData);
                sessionStorage.setItem(PRESETS_SESSION_CACHE_KEY, JSON.stringify(presetsData));
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPresetsAndSpots();
    }, [fetchPresetsAndSpots]);
    
    const clearCachesAndRefresh = useCallback(() => {
        sessionStorage.removeItem(PRESETS_SESSION_CACHE_KEY);
        localStorage.removeItem(DEFAULT_PRESET_LOCAL_CACHE_KEY);
        fetchPresetsAndSpots(true);
    }, [fetchPresetsAndSpots]);

    const handleSave = () => {
        setIsFormOpen(false);
        clearCachesAndRefresh();
    };

    const handleDelete = async (presetId: number) => {
        if (!userId || !window.confirm("Are you sure you want to delete this preset?")) return;
        try {
            await deletePreset(presetId, userId);
            clearCachesAndRefresh();
        } catch (error) {
            console.error("Failed to delete preset", error);
        }
    };
    
    const handleSetDefault = async (newDefaultPreset: Preset) => {
        if (!userId || newDefaultPreset.is_default) return;
    
        const originalPresets = [...presets];
    
        const updatedPresets = originalPresets.map(p => ({
            ...p,
            is_default: p.preset_id === newDefaultPreset.preset_id
        }));
        setPresets(updatedPresets);
        setUpdatingDefault(newDefaultPreset.preset_id);
    
        try {
            await updatePreset(newDefaultPreset.preset_id, {
                user_id: userId,
                is_default: true,
            });
    
            sessionStorage.removeItem(PRESETS_SESSION_CACHE_KEY);
            localStorage.removeItem(DEFAULT_PRESET_LOCAL_CACHE_KEY);
            sessionStorage.removeItem(RECOMMENDATIONS_CACHE_KEY); 
            
    
        } catch (error) {
            console.error('Failed to update default preset', error);
            alert('Could not set the new default preset. Please try again.');
            setPresets(originalPresets);
        } finally {
            setUpdatingDefault(null);
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
    
    if (loading) return <div className="text-center p-10"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>

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
                    <div key={preset.preset_id} className="bg-slate-800 rounded-lg p-4 flex justify-between items-center shadow-md">
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
                                disabled={preset.is_default || updatingDefault != null}
                            />
                            <button onClick={() => handleEdit(preset)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700"><EditIcon/></button>
                            <button onClick={() => handleDelete(preset.preset_id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-700"><TrashIcon/></button>
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