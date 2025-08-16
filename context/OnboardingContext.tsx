import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, SpotPreferences, Preset } from '../types';
import { registerUser, updateUserProfile, setUserSpotPreferences, createPreset, loginUser } from '../services/api';

// Definição do tipo para os dados do preset que serão recebidos
type FinalPresetData = Omit<Preset, 'preset_id' | 'user_id' | 'is_default' | 'is_active'>;

interface OnboardingData {
  credentials: Pick<User, 'email' | 'name'> & { password?: string };
  profile: Partial<Pick<User, 'surf_level' | 'goofy_regular_stance' | 'preferred_wave_direction'>>;
  spotPreferences: Record<number, Omit<SpotPreferences, 'user_preference_id' | 'user_id'>>;
  preset: FinalPresetData; // Mantém a estrutura para consistência
  userId: string | null;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  createUserAndProfile: (profileData: OnboardingData['profile']) => Promise<string>;
  // A assinatura da função foi alterada para aceitar os dados do preset
  finalizeOnboarding: (presetData: FinalPresetData) => Promise<{ token: string, userId: string }>;
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
      start_time: '08:00:00',
      end_time: '20:00:00',
      weekdays: [],
    },
    userId: null,
  });

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const createUserAndProfile = async (profileData: OnboardingData['profile']): Promise<string> => {
    const { user_id } = await registerUser(onboardingData.credentials);
    await updateUserProfile(user_id, profileData);
    setOnboardingData((prev) => ({
        ...prev,
        userId: user_id,
        profile: profileData,
    }));
    return user_id;
  };

  // A função agora usa o argumento `presetData` em vez do estado `onboardingData.preset`
  const finalizeOnboarding = async (presetData: FinalPresetData): Promise<{ token: string, userId: string }> => {
    if (!onboardingData.userId) {
        throw new Error("Usuário não foi criado, não é possível finalizar.");
    }
    const userId = onboardingData.userId;

    // 1. Salvar preferências dos spots
    for (const spotId in onboardingData.spotPreferences) {
        await setUserSpotPreferences(userId, parseInt(spotId), onboardingData.spotPreferences[spotId]);
    }

    // 2. Criar preset com os dados recebidos diretamente
    const presetToSend = {
        ...presetData,
        user_id: userId,
        is_default: true
    };
    await createPreset(presetToSend);

    // 3. Login para obter o token
    const { token } = await loginUser({ email: onboardingData.credentials.email, password: onboardingData.credentials.password });
    
    return { token, userId };
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData, createUserAndProfile, finalizeOnboarding }}>
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