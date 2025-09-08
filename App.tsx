// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/App.tsx
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';

// Import de Páginas
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ProfilePage from './pages/ProfilePage';
import PresetsPage from './pages/PresetsPage';
import SpotsPage from './pages/SpotsPage';
import SpotPreferencesPage from './pages/SpotPreferencesPage';
import OnboardingProfilePage from './pages/Onboarding/OnboardingProfilePage';
import OnboardingSpotsPage from './pages/Onboarding/OnboardingSpotsPage';
import OnboardingSpotPreferencesPage from './pages/Onboarding/OnboardingSpotPreferencesPage';
import OnboardingPresetPage from './pages/Onboarding/OnboardingPresetPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import { Header } from './components/layout/Header';

// --- DEFINIÇÃO CORRETA DO COMPONENTE DE ROTA PROTEGIDA ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900">
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // A lógica de autenticação vem do hook, não dos 'children'
    return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App: React.FC = () => {
    const { isLoading: isAuthLoading } = useAuth();
    const location = useLocation();
    const noHeaderPaths = ['/auth', '/forgot-password', '/update-password'];
    const isOnboardingRoute = location.pathname.startsWith('/onboarding');

    // A verificação de carregamento principal da autenticação.
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900">
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
            {!noHeaderPaths.includes(location.pathname) && !isOnboardingRoute && <Header />}

            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <OnboardingProvider>
                    <Routes>
                        {/* Rotas Públicas */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/update-password" element={<UpdatePasswordPage />} />

                        {/* Rotas Protegidas */}
                        <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
                        <Route path="/spots" element={<ProtectedRoute><SpotsPage /></ProtectedRoute>} />
                        <Route path="/spots/:spotId/preferences" element={<ProtectedRoute><SpotPreferencesPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/presets" element={<ProtectedRoute><PresetsPage /></ProtectedRoute>} />

                        {/* Fluxo de Onboarding (também protegido) */}
                        <Route path="/onboarding/profile" element={<ProtectedRoute><OnboardingProfilePage /></ProtectedRoute>} />
                        <Route path="/onboarding/spots" element={<ProtectedRoute><OnboardingSpotsPage /></ProtectedRoute>} />
                        <Route path="/onboarding/spots/:spotId/preferences" element={<ProtectedRoute><OnboardingSpotPreferencesPage /></ProtectedRoute>} />
                        <Route path="/onboarding/preset" element={<ProtectedRoute><OnboardingPresetPage /></ProtectedRoute>} />
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