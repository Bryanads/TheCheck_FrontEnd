import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { SpotPreferences } from '../../types';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';
import { PreferenceFormSections } from '../../components/preferences/PreferenceFormFields';

const OnboardingSpotPreferencesPage: React.FC = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  
  const existingPrefs = spotId ? onboardingData.spotPreferences[parseInt(spotId)] : undefined;
  const [preferences, setPreferences] = useState<Partial<SpotPreferences>>(existingPrefs || { is_active: true });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    let inputValue: string | number | boolean;

    if (isCheckbox) {
        inputValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number' && value !== '') {
        inputValue = parseFloat(value);
    } else {
        inputValue = value;
    }
    setPreferences(prev => ({ ...prev, [name]: inputValue }));
  };
  
  const handleSave = () => {
    if (!spotId) return;
    const numericSpotId = parseInt(spotId);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_preference_id, user_id, ...prefsToSave } = preferences;

    updateOnboardingData({
        spotPreferences: {
            ...onboardingData.spotPreferences,
            [numericSpotId]: prefsToSave as Omit<SpotPreferences, 'user_preference_id' | 'user_id'>,
        },
    });
    navigate('/onboarding/spots');
  };
  
  return (
    <OnboardingLayout title={`Definindo Preferências`} step="Passo 2 de 3" onBack={() => navigate('/onboarding/spots')}>
        <div className="space-y-6">
            <PreferenceFormSections preferences={preferences} handleChange={handleChange} />
            <button
              onClick={handleSave}
              className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all"
            >
              Salvar e Voltar para a Lista de Spots
            </button>
        </div>
    </OnboardingLayout>
  );
};

export default OnboardingSpotPreferencesPage;