// src/pages/SettingsPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon, CogsIcon, WaveIcon, LogoutIcon } from '../components/icons';

// Componente reutilizável para os links do menu
const SettingsLink: React.FC<{ to: string, icon: React.ReactNode, title: string, subtitle: string }> = ({ to, icon, title, subtitle }) => (
    <Link to={to} className="flex items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
        <div className="mr-4 text-cyan-400">{icon}</div>
        <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="ml-auto text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        </div>
    </Link>
);

const SettingsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-white mb-8">Ajustes</h1>

            <div className="space-y-4">
                <SettingsLink
                    to="/profile"
                    icon={<UserIcon />}
                    title="Meu Perfil"
                    subtitle={`Edite suas informações, nível de surf e base.`}
                />
                <SettingsLink
                    to="/presets"
                    icon={<CogsIcon />}
                    title="Meus Presets"
                    subtitle="Crie e gerencie seus filtros de busca rápida."
                />
                <SettingsLink
                    to="/spots"
                    icon={<WaveIcon />}
                    title="Meus Spots"
                    subtitle="Ajuste suas preferências para cada pico de surf."
                />
            </div>

            <div className="mt-12 border-t border-slate-700 pt-8">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600/20 text-red-400 font-bold py-3 px-6 rounded-lg hover:bg-red-600/30 hover:text-red-300 transition-all"
                >
                    <LogoutIcon />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;