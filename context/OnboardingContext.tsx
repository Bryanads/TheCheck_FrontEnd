import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, SpotPreferences, Preset } from '../types';
// A função registerUser não é mais necessária aqui
import { setUserSpotPreferences, createPreset } from '../services/api';

type FinalPresetData = Omit<Preset, 'preset_id' | 'user_id' | 'is_default' | 'is_active'>;

// O OnboardingData não precisa mais das credenciais
interface OnboardingData {
  spotPreferences: Record<number, Omit<SpotPreferences, 'user_preference_id' | 'user_id'>>;
  preset: FinalPresetData;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  // A função createUserAndProfile foi removida
  finalizeOnboarding: (presetData: FinalPresetData, userId: string) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    spotPreferences: {},
    preset: {
      preset_name: 'Meu Primeiro Preset',
      spot_ids: [],
      start_time: '08:00:00',
      end_time: '20:00:00',
      weekdays: [1, 2, 3, 4, 5], // Exemplo de dias da semana
    },
  });

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  // createUserAndProfile foi removido.

  // A função agora recebe o userId como argumento.
  const finalizeOnboarding = async (presetData: FinalPresetData, userId: string): Promise<void> => {
    if (!userId) {
        throw new Error("Usuário não autenticado, não é possível finalizar.");
    }

    // 1. Salvar preferências dos spots
    for (const spotId in onboardingData.spotPreferences) {
        await setUserSpotPreferences(userId, parseInt(spotId), onboardingData.spotPreferences[spotId]);
    }

    // 2. Criar preset
    const presetToSend = {
        ...presetData,
        user_id: userId,
        is_default: true
    };
    await createPreset(presetToSend);

    // 3. Login não é mais necessário aqui, o usuário já está logado.
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData, finalizeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};