import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, SpotPreferences, Preset } from '../types';

interface OnboardingData {
  credentials: Pick<User, 'email' | 'name'> & { password?: string };
  profile: Partial<Pick<User, 'surf_level' | 'goofy_regular_stance' | 'preferred_wave_direction'>>;
  spotPreferences: Record<number, Omit<SpotPreferences, 'user_preference_id' | 'user_id'>>;
  preset: Omit<Preset, 'preset_id' | 'user_id' | 'is_default' | 'is_active'>;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
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

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData }}>
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