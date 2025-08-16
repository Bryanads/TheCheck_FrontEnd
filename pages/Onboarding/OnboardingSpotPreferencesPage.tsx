import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { SpotPreferences } from '../../types';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';
import { PreferenceFormSections } from '../../components/preferences/PreferenceFormFields';
import { getLevelSpotPreferences } from '../../services/api'; // Importar a função da API

const OnboardingSpotPreferencesPage: React.FC = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  
  // Estados para controle de loading, erro e defaults
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

      // Verifica se já existem preferências salvas no contexto para este spot
      const existingPrefs = onboardingData.spotPreferences[parseInt(spotId)];
      if (existingPrefs) {
          setPreferences(existingPrefs);
          setIsUsingDefaults(false);
          setLoading(false);
          return;
      }
      
      // Se não, busca as preferências padrão do nível
      try {
        const levelDefaults = await getLevelSpotPreferences(onboardingData.userId, parseInt(spotId));
        setPreferences({ ...levelDefaults, is_active: true });
        setIsUsingDefaults(true);
      } catch (err: any) {
        setError('Não foi possível carregar as preferências padrão. Você pode definir as suas manualmente.');
        setPreferences({ is_active: true }); // Inicia com um objeto limpo
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
    // Se o usuário alterar qualquer campo, não estamos mais usando os padrões puros
    if (isUsingDefaults) setIsUsingDefaults(false);
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