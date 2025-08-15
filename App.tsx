import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; 
import { useAuth } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ProfilePage from './pages/ProfilePage';
import PresetsPage from './pages/PresetsPage';
import SpotsPage from './pages/SpotsPage';
import SpotPreferencesPage from './pages/SpotPreferencesPage';
import LoadingPage from './pages/LoadingPage';
import OnboardingProfilePage from './pages/Onboarding/OnboardingProfilePage';
import OnboardingSpotsPage from './pages/Onboarding/OnboardingSpotsPage';
import OnboardingSpotPreferencesPage from './pages/Onboarding/OnboardingSpotPreferencesPage';
import OnboardingPresetPage from './pages/Onboarding/OnboardingPresetPage';
import { Header } from './components/layout/Header';

const App: React.FC = () => {
  const { isLoading } = useAuth();
  const location = useLocation(); 
  const noHeaderPaths = ['/loading', '/auth', '/onboarding/profile', '/onboarding/spots', '/onboarding/preset'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
      {!noHeaderPaths.includes(location.pathname) && !isOnboardingRoute && <Header />}

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <OnboardingProvider>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/loading" element={<LoadingPage />} /> 
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/spots" element={<SpotsPage />} />
                <Route path="/spots/:spotId/preferences" element={<SpotPreferencesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/presets" element={<PresetsPage />} />
                
                {/* Onboarding Routes */}
                <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />
                <Route path="/onboarding/spots" element={<OnboardingSpotsPage />} />
                <Route path="/onboarding/spots/:spotId/preferences" element={<OnboardingSpotPreferencesPage />} />
                <Route path="/onboarding/preset" element={<OnboardingPresetPage />} />
            </Routes>
        </OnboardingProvider>
      </main>
      
      {!noHeaderPaths.includes(location.pathname) && !isOnboardingRoute && (
        <footer className="bg-slate-900/50 py-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TheCheck. Find your perfect wave.</p>
        </footer>
      )}
    </div>
  );
};

export default App;