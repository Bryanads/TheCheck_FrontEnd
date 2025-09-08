// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/context/OnboardingContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Preference, PresetCreate } from '../types';
// --- CORREÇÃO AQUI ---
import { updateSpotPreferences, createPreset } from '../services/api'; 
import { useAuth } from './AuthContext';

interface OnboardingData {
  spotPreferences: Record<number, Omit<Preference, 'preference_id' | 'user_id' | 'spot_id'>>;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  finalizeOnboarding: (presetData: PresetCreate) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    spotPreferences: {},
  });

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const finalizeOnboarding = async (presetData: PresetCreate): Promise<void> => {
    if (!userId) {
        throw new Error("Usuário não autenticado, não é possível finalizar.");
    }

    // 1. Salvar preferências dos spots
    for (const spotId in onboardingData.spotPreferences) {
        // Usa a função importada corretamente
        await updateSpotPreferences(parseInt(spotId), onboardingData.spotPreferences[spotId]);
    }

    // 2. Criar preset
    await createPreset(presetData);
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