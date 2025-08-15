import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, SpotPreferences, Preset } from '../types';
import { registerUser, updateUserProfile, setUserSpotPreferences, createPreset, loginUser } from '../services/api';

interface OnboardingData {
  credentials: Pick<User, 'email' | 'name'> & { password?: string };
  profile: Partial<Pick<User, 'surf_level' | 'goofy_regular_stance' | 'preferred_wave_direction'>>;
  spotPreferences: Record<number, Omit<SpotPreferences, 'user_preference_id' | 'user_id'>>;
  preset: Omit<Preset, 'preset_id' | 'user_id' | 'is_default' | 'is_active'>;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  finalizeOnboarding: (presetName: string, selectedSpotIds: number[]) => Promise<{ token: string, userId: string }>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    credentials: { email: '', password: '', name: '' },
    profile: {},
    spotPreferences: {},
    preset: {
      preset_name: '',
      spot_ids: [],
      start_time: '06:00:00',
      end_time: '18:00:00',
      weekdays: [],
    },
  });

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const finalizeOnboarding = async (presetName: string, selectedSpotIds: number[]): Promise<{ token: string, userId: string }> => {
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

    // 5. Login para obter o token
    const { token } = await loginUser({ email: onboardingData.credentials.email, password: onboardingData.credentials.password });
    
    return { token, userId: user_id };
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