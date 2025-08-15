import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { registerUser, updateUserProfile, setUserSpotPreferences, createPreset, loginUser, getSpots } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spot } from '../../types';

const OnboardingPresetPage: React.FC = () => {
    const navigate = useNavigate();
    const { onboardingData, updateOnboardingData } = useOnboarding();
    const { login } = useAuth();
    const [spots, setSpots] = useState<Spot[]>([]);
    const [presetName, setPresetName] = useState('Meu Primeiro Preset');
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSpots = async () => {
            const spotsData = await getSpots();
            setSpots(spotsData);
            setSelectedSpotIds(Object.keys(onboardingData.spotPreferences).map(Number));
        };
        fetchSpots();
    }, [onboardingData.spotPreferences]);

    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
    };
    
    const handleFinalize = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Registrar usuário
            const { user_id } = await registerUser(onboardingData.credentials);

            // 2. Atualizar perfil
            await updateUserProfile(user_id, onboardingData.profile);

            // 3. Salvar preferências dos spots
            for (const spotId in onboardingData.spotPreferences) {
                await setUserSpotPreferences(user_id, parseInt(spotId), onboardingData.spotPreferences[spotId]);
            }

            // 4. Criar preset
            const presetData = {
                ...onboardingData.preset,
                preset_name: presetName,
                spot_ids: selectedSpotIds,
                user_id: user_id,
                is_default: true
            };
            await createPreset(presetData);

            // 5. Login
            const { token } = await loginUser({ email: onboardingData.credentials.email, password: onboardingData.credentials.password });
            login(token, user_id);

            // 6. Redirecionar para o loading da app principal
            navigate('/loading');

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao finalizar o cadastro.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Último Passo!</h1>
            <p className="text-slate-400 mb-8">Crie seu primeiro preset de busca.</p>

            <div className="bg-slate-800 rounded-xl p-8 shadow-lg space-y-6">
                <div>
                    <label className="block text-slate-300 font-medium mb-2">Nome do Preset</label>
                    <input type="text" value={presetName} onChange={(e) => setPresetName(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                </div>
                <div>
                    <label className="block text-slate-300 font-medium mb-2">Spots para este Preset</label>
                    <div className="max-h-48 overflow-y-auto bg-slate-700 p-2 rounded-lg grid grid-cols-2 gap-2">
                        {spots.map(spot => (
                            <button key={spot.spot_id} type="button" onClick={() => handleSpotToggle(spot.spot_id)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-slate-600'}`}>
                                {spot.spot_name}
                            </button>
                        ))}
                    </div>
                </div>
                {error && <p className="text-red-400 text-center">{error}</p>}
                <button onClick={handleFinalize} disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all disabled:bg-slate-600 disabled:cursor-wait">
                    {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
                </button>
            </div>
        </div>
    );
};

export default OnboardingPresetPage;