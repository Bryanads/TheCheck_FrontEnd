import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { SpotPreferences } from '../../types';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';
import { PreferenceFormSections } from '../../components/preferences/PreferenceFormFields';
import { getLevelSpotPreferences } from '../../services/api';

const OnboardingSpotPreferencesPage: React.FC = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  
  const [preferences, setPreferences] = useState<Partial<SpotPreferences>>({ is_active: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDefaults, setIsUsingDefaults] = useState(false);

  useEffect(() => {
    const fetchDefaultPreferences = async () => {
      if (!spotId || !onboardingData.userId) {
          setLoading(false);
          return;
      };

      setLoading(true);
      setError(null);

      const existingPrefs = onboardingData.spotPreferences[parseInt(spotId)];
      if (existingPrefs) {
          setPreferences(existingPrefs);
          setIsUsingDefaults(false);
          setLoading(false);
          return;
      }
      
      try {
        const levelDefaults = await getLevelSpotPreferences(onboardingData.userId, parseInt(spotId));
        
        // **A CORREÇÃO ESTÁ AQUI**
        // Replicamos a lógica de limpeza do SpotPreferencesPage.tsx
        // para garantir que o estado `preferences` contenha apenas chaves válidas.
        const validKeys: (keyof SpotPreferences)[] = [
            'min_wave_height', 'max_wave_height', 'ideal_wave_height', 'min_wave_period', 
            'max_wave_period', 'ideal_wave_period', 'min_swell_height', 'max_swell_height', 
            'ideal_swell_height', 'min_swell_period', 'max_swell_period', 'ideal_swell_period', 
            'preferred_wave_direction', 'preferred_swell_direction', 'ideal_tide_type', 
            'min_sea_level', 'max_sea_level', 'ideal_sea_level', 'min_wind_speed', 
            'max_wind_speed', 'ideal_wind_speed', 'preferred_wind_direction', 
            'ideal_water_temperature', 'ideal_air_temperature'
        ];
        
        const cleanedDefaults = validKeys.reduce<Partial<SpotPreferences>>((acc, key) => {
            if (levelDefaults[key] !== undefined) {
                // Usamos 'as any' para contornar a checagem de tipo estrita aqui,
                // pois sabemos que a chave existe em levelDefaults.
                (acc as any)[key] = levelDefaults[key];
            }
            return acc;
        }, {});

        setPreferences({ ...cleanedDefaults, is_active: true });
        setIsUsingDefaults(true);
      } catch (err: any) {
        setError('Não foi possível carregar as preferências padrão. Você pode definir as suas manualmente.');
        setPreferences({ is_active: true });
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultPreferences();
  }, [spotId, onboardingData.userId, onboardingData.spotPreferences]);


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
    if (isUsingDefaults) setIsUsingDefaults(false);
  };
  
  const handleSave = () => {
    if (!spotId) return;
    const numericSpotId = parseInt(spotId);
    
    // Agora o objeto `preferences` está limpo e esta desestruturação funciona sem erros.
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
  
  if (loading) {
    return <div className="text-center p-10"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
  }

  return (
    <OnboardingLayout title={`Definindo Preferências`} step="Passo 2 de 3" onBack={() => navigate('/onboarding/spots')}>
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded mb-4">{error}</p>}
        {isUsingDefaults && (
            <div className="bg-blue-900/50 text-blue-200 p-3 rounded-md mb-4 text-center text-sm">
                Pré-carregamos as preferências com base no seu nível de surf. Sinta-se à vontade para ajustar!
            </div>
        )}
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