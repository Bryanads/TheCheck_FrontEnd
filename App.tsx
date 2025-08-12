
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ProfilePage from './pages/ProfilePage';
import PresetsPage from './pages/PresetsPage';
import SpotsPage from './pages/SpotsPage';
import { LogoIcon, LogoutIcon, UserIcon, WaveIcon, CogsIcon, CheckIcon } from './components/icons';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-cyan-500/10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-cyan-400 transition-colors">
            <LogoIcon />
            <span>TheCheck</span>
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/recommendations" icon={<CheckIcon />}>Recommendations</NavLink>
                <NavLink to="/spots" icon={<WaveIcon />}>Spots</NavLink>
                <NavLink to="/presets" icon={<CogsIcon />}>Presets</NavLink>
                <div className="flex items-center space-x-4 pl-4 border-l border-slate-700">
                    <Link to="/profile" className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors">
                        <UserIcon/>
                        <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                    </Link>
                    <button onClick={handleLogout} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <LogoutIcon />
                    </button>
                </div>
              </>
            ) : (
              <Link to="/auth" className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/30">
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

const NavLink: React.FC<{ to: string, children: React.ReactNode, icon: React.ReactNode }> = ({ to, children, icon }) => (
    <Link to={to} className="hidden md:flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors font-medium">
        {icon}
        <span>{children}</span>
    </Link>
);


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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/spots" element={<SpotsPage />} />
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
