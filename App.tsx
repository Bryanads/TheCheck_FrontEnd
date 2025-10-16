// bryanads/thecheck_frontend/TheCheck_Front_End-5b38d66e392d06920c176ae34523f3250cf17f28/App.tsx
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import de Páginas
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ProfilePage from './pages/ProfilePage';
import PresetsPage from './pages/PresetsPage';
import SpotsPage from './pages/SpotsPage';
import SpotPreferencesPage from './pages/SpotPreferencesPage';
import ForecastPage from './pages/ForecastsPage';
import OnboardingPage from './pages/OnboardingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import SettingsPage from './pages/SettingsPage'; // 1. Importe a nova página
import { BottomNavBar } from './components/layout/BottomNavBar';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) { return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div></div>; }
    return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App: React.FC = () => {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const location = useLocation();

    const noNavPaths = ['/auth', '/forgot-password', '/update-password', '/onboarding', '/'];
    const showNav = isAuthenticated && !noNavPaths.includes(location.pathname);

    if (isAuthLoading) {
        return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 content-wrapper">
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Navigate to="/recommendations" /> : <HomePage />} />

                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/update-password" element={<UpdatePasswordPage />} />
                    <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

                    {/* --- ROTAS ATUALIZADAS AQUI --- */}
                    <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
                    <Route path="/forecasts" element={<ProtectedRoute><ForecastPage /></ProtectedRoute>} />
                    <Route path="/forecasts/:spotId" element={<ProtectedRoute><ForecastPage /></ProtectedRoute>} />

                    {/* A nova página Hub de Ajustes */}
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                    {/* As páginas de configuração que agora são "filhas" de Ajustes */}
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/presets" element={<ProtectedRoute><PresetsPage /></ProtectedRoute>} />
                    <Route path="/spots" element={<ProtectedRoute><SpotsPage /></ProtectedRoute>} />
                    <Route path="/spots/:spotId/preferences" element={<ProtectedRoute><SpotPreferencesPage /></ProtectedRoute>} />
                </Routes>
            </main>

            {showNav && <BottomNavBar />}
        </div>
    );
};

export default App;