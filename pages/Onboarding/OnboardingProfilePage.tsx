// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/pages/Onboarding/OnboardingProfilePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfile } from '../../hooks';
import { ProfileUpdate } from '../../types';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';

const OnboardingProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { mutateAsync: updateProfile, isPending: loading } = useUpdateProfile();
    const [error, setError] = useState<string | null>(null);
    
    const [profile, setProfile] = useState<ProfileUpdate>({
        surf_level: 'intermediario',
        stance: 'regular',
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await updateProfile(profile);
            navigate('/onboarding/spots');
        } catch (err: any) {
            setError(err.message || 'Falha ao salvar o perfil. Tente novamente.');
        }
    };

    return (
        <OnboardingLayout title="Seu Perfil de Surfista" step="Passo 1 de 4">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="surf_level" className="block text-sm font-medium text-slate-300">Nível de Surf</label>
                    <select name="surf_level" id="surf_level" value={profile.surf_level} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg">
                        <option value="iniciante">Iniciante</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="avancado">Avançado</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="stance" className="block text-sm font-medium text-slate-300">Base</label>
                    <select name="stance" id="stance" value={profile.stance} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg">
                        <option value="regular">Regular</option>
                        <option value="goofy">Goofy</option>
                    </select>
                </div>
                {error && <p className="text-red-400 text-center">{error}</p>}
                <div className="text-right">
                    <button type="submit" disabled={loading} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                        {loading ? 'Salvando...' : 'Próximo'}
                    </button>
                </div>
            </form>
        </OnboardingLayout>
    );
};

export default OnboardingProfilePage;