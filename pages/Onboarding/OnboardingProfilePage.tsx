import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // <-- Importar useAuth
import { updateUserProfile } from '../../services/api'; // <-- Importar a função da API
import { User } from '../../types';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';

// Mantemos o tipo, pois ele representa os dados do formulário
type OnboardingProfile = Pick<User, 'surf_level' | 'goofy_regular_stance' | 'preferred_wave_direction'>;

const OnboardingProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useAuth(); // <-- Obter o ID do usuário logado
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userId) { // <-- Verificação de segurança
            setError('Você precisa estar logado para continuar.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // --- CHAMADA DIRETA PARA A API DE ATUALIZAÇÃO ---
            await updateUserProfile(userId, profile);
            navigate('/onboarding/spots');
        } catch (err: any) {
            setError(err.message || 'Falha ao salvar o perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
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

                {error && <p className="text-red-400 text-center">{error}</p>}

                <div className="text-right">
                    <button type="submit" disabled={loading} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-all disabled:bg-slate-600 disabled:cursor-wait">
                        {loading ? 'Salvando Perfil...' : 'Próximo'}
                    </button>
                </div>
            </form>
        </OnboardingLayout>
    );
};

export default OnboardingProfilePage;