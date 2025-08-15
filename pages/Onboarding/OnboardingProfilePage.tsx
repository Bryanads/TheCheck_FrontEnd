import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { User } from '../../types';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout'; // Importação

type OnboardingProfile = Pick<User, 'surf_level' | 'goofy_regular_stance' | 'preferred_wave_direction'>;

const OnboardingProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { updateOnboardingData } = useOnboarding();
    
    const [profile, setProfile] = useState<OnboardingProfile>({
        surf_level: 'intermediario',
        goofy_regular_stance: 'Regular',
        preferred_wave_direction: 'Both',
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value as OnboardingProfile[keyof OnboardingProfile],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateOnboardingData({ profile });
        navigate('/onboarding/spots');
    };

    return (
        <OnboardingLayout title="Seu Perfil de Surfista" step="Passo 1 de 3">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="surf_level" className="block text-sm font-medium text-slate-300">Nível de Surf</label>
                    <select name="surf_level" id="surf_level" value={profile.surf_level} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="maroleiro">Maroleiro</option>
                        <option value="intermediario">Intermediário</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="goofy_regular_stance" className="block text-sm font-medium text-slate-300">Base</label>
                    <select name="goofy_regular_stance" id="goofy_regular_stance" value={profile.goofy_regular_stance} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="Regular">Regular</option>
                        <option value="Goofy">Goofy</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="preferred_wave_direction" className="block text-sm font-medium text-slate-300">Direção da Onda Preferida</label>
                    <select name="preferred_wave_direction" id="preferred_wave_direction" value={profile.preferred_wave_direction} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="Left">Esquerda</option>
                        <option value="Right">Direita</option>
                        <option value="Both">Ambas</option>
                    </select>
                </div>
                <div className="text-right">
                    <button type="submit" className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-all">
                        Próximo
                    </button>
                </div>
            </form>
        </OnboardingLayout>
    );
};

export default OnboardingProfilePage;