// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/pages/SpotPreferencesPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpotPreferences, useUpdateSpotPreferences, useSpots } from '../hooks';
import { PreferenceUpdate } from '../types';
import { PreferenceFormSections } from '../components/preferences/PreferenceFormFields';

const SpotPreferencesPage: React.FC = () => {
    const { spotId } = useParams<{ spotId: string }>();
    const navigate = useNavigate();
    const numericSpotId = parseInt(spotId || '0');

    // Hooks para buscar dados e mutações
    const { data: spots } = useSpots();
    const { data: initialPreferences, isLoading } = useSpotPreferences(numericSpotId);
    const { mutate: updatePreferences, isPending: isSubmitting } = useUpdateSpotPreferences();

    // Estado local do formulário
    const [preferences, setPreferences] = useState<Partial<PreferenceUpdate>>({});
    const [error, setError] = useState<string | null>(null);

    const spotName = spots?.find(s => s.spot_id === numericSpotId)?.name || `Spot ${spotId}`;

    // Popula o formulário com os dados carregados
    useEffect(() => {
        if (initialPreferences) {
            setPreferences({
                ideal_swell_height: initialPreferences.ideal_swell_height,
                max_swell_height: initialPreferences.max_swell_height,
                max_wind_speed: initialPreferences.max_wind_speed,
                ideal_water_temperature: initialPreferences.ideal_water_temperature,
                ideal_air_temperature: initialPreferences.ideal_air_temperature,
                is_active: initialPreferences.is_active,
            });
        }
    }, [initialPreferences]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const inputValue = isCheckbox 
            ? (e.target as HTMLInputElement).checked 
            : (type === 'number' && value !== '' ? parseFloat(value) : value);
        setPreferences(prev => ({ ...prev, [name]: inputValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        updatePreferences({ spotId: numericSpotId, updates: preferences }, {
            onSuccess: () => {
                navigate('/spots'); // Volta para a lista de spots após salvar
            },
            onError: (err: any) => {
                setError(err.message || 'Erro ao salvar preferências.');
            }
        });
    };

    if (isLoading) {
        return <div className="text-center p-10"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Suas Preferências</h1>
            <h2 className="text-xl text-cyan-400 font-semibold mb-6">{spotName}</h2>
            
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded mb-4 text-center">{error}</p>}
            
            <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-6">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-md">
                    <label htmlFor="is_active" className="font-medium text-white">Usar minhas preferências para este spot</label>
                    <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={preferences.is_active ?? false}
                        onChange={handleChange}
                        className="w-6 h-6 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-600 focus:ring-2"
                    />
                </div>

                <fieldset disabled={!preferences.is_active || isSubmitting} className="space-y-6 disabled:opacity-50 transition-opacity">
                    <PreferenceFormSections preferences={preferences} handleChange={handleChange} />
                </fieldset>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all disabled:bg-slate-600 disabled:cursor-wait"
                >
                    {isSubmitting ? 'Salvando...' : 'Salvar Preferências'}
                </button>
            </form>
        </div>
    );
};

export default SpotPreferencesPage;