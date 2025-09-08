// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/pages/Onboarding/OnboardingSpotPreferencesPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { useSpotPreferences, useSpots } from '../../hooks';
import { PreferenceUpdate, Preference } from '../../types';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';
import { PreferenceFormSections } from '../../components/preferences/PreferenceFormFields';

const OnboardingSpotPreferencesPage: React.FC = () => {
    const { spotId } = useParams<{ spotId: string }>();
    const navigate = useNavigate();
    const { onboardingData, updateOnboardingData } = useOnboarding();
    const numericSpotId = parseInt(spotId || '0');

    const { data: spots } = useSpots();
    // Busca as preferências padrão/existentes para o spot
    const { data: initialPreferences, isLoading } = useSpotPreferences(numericSpotId);
    
    // Estado local do formulário
    const [preferences, setPreferences] = useState<Partial<PreferenceUpdate>>({});
    const [error, setError] = useState<string | null>(null);

    const spotName = spots?.find(s => s.spot_id === numericSpotId)?.name || `Spot ${spotId}`;

    // Popula o formulário com dados pré-existentes (do onboarding ou do backend)
    useEffect(() => {
        const existingOnboardingPrefs = onboardingData.spotPreferences[numericSpotId];
        if (existingOnboardingPrefs) {
            setPreferences(existingOnboardingPrefs);
        } else if (initialPreferences) {
            setPreferences({
                ideal_swell_height: initialPreferences.ideal_swell_height,
                max_swell_height: initialPreferences.max_swell_height,
                max_wind_speed: initialPreferences.max_wind_speed,
                ideal_water_temperature: initialPreferences.ideal_water_temperature,
                ideal_air_temperature: initialPreferences.ideal_air_temperature,
                is_active: initialPreferences.is_active,
            });
        }
    }, [initialPreferences, onboardingData.spotPreferences, numericSpotId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const inputValue = isCheckbox 
            ? (e.target as HTMLInputElement).checked 
            : (type === 'number' && value !== '' ? parseFloat(value) : value);
        setPreferences(prev => ({ ...prev, [name]: inputValue }));
    };
    
    // Salva as preferências no estado do OnboardingContext e volta para a lista
    const handleSaveAndReturn = () => {
        setError(null);
        if (!preferences) {
            setError("Não foi possível salvar as preferências.");
            return;
        }

        updateOnboardingData({
            spotPreferences: {
                ...onboardingData.spotPreferences,
                [numericSpotId]: preferences as Omit<Preference, 'user_preference_id' | 'user_id' | 'spot_id'>,
            },
        });
        navigate('/onboarding/spots');
    };

    if (isLoading) {
        return <div className="text-center p-10"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
    }

    return (
        <OnboardingLayout title="Preferências do Spot" step="Passo 2 de 4" onBack={() => navigate('/onboarding/spots')}>
             <h2 className="text-xl text-center text-cyan-400 font-semibold mb-6">{spotName}</h2>
            <div className="space-y-6">
                {error && <p className="text-red-400 text-center pb-4">{error}</p>}
                <PreferenceFormSections preferences={preferences} handleChange={handleChange} />
                <button
                  onClick={handleSaveAndReturn}
                  className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all"
                >
                  Salvar Preferências e Voltar
                </button>
            </div>
        </OnboardingLayout>
    );
};

export default OnboardingSpotPreferencesPage;