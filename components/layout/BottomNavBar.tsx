// src/components/layout/BottomNavBar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckIcon, ChartBarIcon, CogsIcon } from '../icons';

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
            }`
        }
    >
        <div className="w-6 h-6 mb-1">{icon}</div>
        <span className="text-xs font-bold">{label}</span>
    </NavLink>
);

export const BottomNavBar: React.FC = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 flex justify-around items-stretch z-50">
            <NavItem to="/recommendations" icon={<CheckIcon />} label="Recomendações" />
            <NavItem to="/forecasts" icon={<ChartBarIcon />} label="Previsão" />
            <NavItem to="/settings" icon={<CogsIcon />} label="Ajustes" />
        </nav>
    );
};