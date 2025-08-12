import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPresets, createPreset, updatePreset, deletePreset, getSpots } from '../services/api';
import { Preset, Spot } from '../types';
import { CogsIcon, PlusIcon, TrashIcon, EditIcon } from '../components/icons';

const PresetForm: React.FC<{
    currentPreset: Partial<Preset> | null;
    spots: Spot[];
    onClose: () => void;
    onSave: () => void;
}> = ({ currentPreset, spots, onClose, onSave }) => {
    const { userId } = useAuth();
    const [name, setName] = useState(currentPreset?.preset_name || '');
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>(currentPreset?.spot_ids || []);
    const [startTime, setStartTime] = useState(currentPreset?.start_time || '06:00');
    const [endTime, setEndTime] = useState(currentPreset?.end_time || '18:00');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !name || selectedSpotIds.length === 0) return;
        
        const data = {
            user_id: userId,
            preset_name: name,
            spot_ids: selectedSpotIds,
            start_time: startTime,
            end_time: endTime,
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
                    <input
                        type="text"
                        placeholder="Preset Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                    />
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
                        <label className="block text-slate-300 font-medium mb-2">Default Time Range</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <span className="text-slate-400">to</span>
                             <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
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

// --- O restante do componente PresetsPage permanece o mesmo ---

const PresetsPage: React.FC = () => {
    const { userId } = useAuth();
    const [presets, setPresets] = useState<Preset[]>([]);
    const [spots, setSpots] = useState<Spot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPreset, setCurrentPreset] = useState<Partial<Preset> | null>(null);

    const fetchPresetsAndSpots = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [presetsData, spotsData] = await Promise.all([getPresets(userId), getSpots()]);
            setPresets(presetsData);
            setSpots(spotsData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPresetsAndSpots();
    }, [fetchPresetsAndSpots]);

    const handleCreate = () => {
        setCurrentPreset(null);
        setIsFormOpen(true);
    };

    const handleEdit = (preset: Preset) => {
        setCurrentPreset(preset);
        setIsFormOpen(true);
    };

    const handleDelete = async (presetId: number) => {
        if (!userId || !window.confirm("Are you sure you want to delete this preset?")) return;
        try {
            await deletePreset(presetId, userId);
            fetchPresetsAndSpots();
        } catch (error) {
            console.error("Failed to delete preset", error);
        }
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
                        <div className="flex items-center space-x-2">
                            {preset.is_default && <span className="text-xs bg-cyan-800 text-cyan-200 px-2 py-0.5 rounded-full">Default</span>}
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
                    onSave={() => {
                        setIsFormOpen(false);
                        fetchPresetsAndSpots();
                    }}
                />
            )}
        </div>
    );
};

export default PresetsPage;