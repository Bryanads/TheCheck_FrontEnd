import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogoIcon, UserIcon, WaveIcon, CogsIcon, CheckIcon, MenuIcon, XIcon } from '../icons';

// Componente de link para o menu Desktop
const NavLink: React.FC<{ to: string, children: React.ReactNode, icon: React.ReactNode }> = ({ to, children, icon }) => (
    <Link to={to} className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors font-medium">
        {icon}
        <span>{children}</span>
    </Link>
);

// Componente de link para o menu Mobile
const MobileNavLink: React.FC<{ to: string, children: React.ReactNode, onClick: () => void }> = ({ to, children, onClick }) => (
    <Link to={to} onClick={onClick} className="block p-3 rounded-md text-slate-300 bg-slate-800/50 hover:bg-cyan-500 hover:text-white transition-colors font-medium">
        {children}
    </Link>
);

export const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-cyan-500/10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0 flex items-center space-x-2 text-2xl font-bold text-white hover:text-cyan-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
            <LogoIcon />
            <span>TheCheck</span>
          </Link>

          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <NavLink to="/recommendations" icon={<CheckIcon />}>Recommendations</NavLink>
                  <NavLink to="/spots" icon={<WaveIcon />}>Spots</NavLink>
                  <NavLink to="/presets" icon={<CogsIcon />}>Presets</NavLink>
                  <div className="flex items-center space-x-4 pl-6 border-l border-slate-700">
                    <Link to="/profile" className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors">
                      <UserIcon/>
                      <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                    </Link>
                  </div>
                </>
              ) : (
                <Link to="/auth" className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/30">
                  Login / Sign Up
                </Link>
              )}
            </div>

            <div className="md:hidden">
              {isAuthenticated ? (
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none">
                  {isMenuOpen ? <XIcon /> : <MenuIcon />}
                </button>
              ) : (
                <Link to="/auth" className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2 pt-2">
              <MobileNavLink to="/recommendations" onClick={() => handleNavigate('/recommendations')}>Recommendations</MobileNavLink>
              <MobileNavLink to="/spots" onClick={() => handleNavigate('/spots')}>Spots</MobileNavLink>
              <MobileNavLink to="/presets" onClick={() => handleNavigate('/presets')}>Presets</MobileNavLink>
              <MobileNavLink to="/profile" onClick={() => handleNavigate('/profile')}>Profile</MobileNavLink>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};