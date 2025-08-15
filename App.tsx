import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ProfilePage from './pages/ProfilePage';
import PresetsPage from './pages/PresetsPage';
import SpotsPage from './pages/SpotsPage';
import SpotPreferencesPage from './pages/SpotPreferencesPage'; // NOVO
import { Header } from './components/layout/Header';

const App: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
         <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/spots" element={<SpotsPage />} />
          <Route path="/spots/:spotId/preferences" element={<SpotPreferencesPage />} /> {/* NOVO */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/presets" element={<PresetsPage />} />
        </Routes>
      </main>
      <footer className="bg-slate-900/50 py-4 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} TheCheck. Find your perfect wave.</p>
      </footer>
    </div>
  );
};

export default App;