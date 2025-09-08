// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile, useUpdateProfile } from '../hooks';
import { ProfileUpdate } from '../types';
import { LogoutIcon } from '../components/icons';

const ProfilePage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    // Hooks do React Query para gerenciar dados do perfil
    const { data: profile, isLoading: isLoadingProfile } = useProfile();
    const { mutate: updateProfile, isPending: isSubmitting } = useUpdateProfile();

    // Estado local para o formulário
    const [formData, setFormData] = useState<ProfileUpdate>({});
    const [message, setMessage] = useState('');

    // Popula o formulário quando os dados do perfil são carregados
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                location: profile.location,
                bio: profile.bio,
                surf_level: profile.surf_level,
                stance: profile.stance,
            });
        }
    }, [profile]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); // Limpa a mensagem anterior
        
        // Chama a mutação para atualizar o perfil
        updateProfile(formData, {
            onSuccess: () => {
                setMessage('Perfil atualizado com sucesso!');
                setTimeout(() => setMessage(''), 3000);
            },
            onError: (err: any) => {
                setMessage(err.message || 'Falha ao atualizar o perfil.');
            }
        });
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">Meu Perfil</h1>
            <div className="bg-slate-800 rounded-xl p-8 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300">Nome</label>
                        <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"/>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
                        <input type="email" name="email" id="email" value={profile?.email || ''} disabled className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-300">Localização</label>
                        <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} placeholder="Cidade, Estado" className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="surf_level" className="block text-sm font-medium text-slate-300">Nível de Surf</label>
                        <select name="surf_level" id="surf_level" value={formData.surf_level || 'intermediario'} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg">
                            <option value="iniciante">Iniciante</option>
                            <option value="intermediario">Intermediário</option>
                            <option value="avancado">Avançado</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="stance" className="block text-sm font-medium text-slate-300">Base (Stance)</label>
                        <select name="stance" id="stance" value={formData.stance || 'regular'} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg">
                            <option value="regular">Regular</option>
                            <option value="goofy">Goofy</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-slate-300">Bio</label>
                         <textarea name="bio" id="bio" rows={3} value={formData.bio || ''} onChange={handleChange} placeholder="Conte um pouco sobre você..." className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"></textarea>
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={isSubmitting} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-all disabled:bg-slate-600 disabled:cursor-wait">
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                     {message && <p className={`text-center mt-4 ${message.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
                </form>
            </div>

            <div className="mt-8 border-t border-slate-700 pt-8">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600/20 text-red-400 font-bold py-3 px-6 rounded-lg hover:bg-red-600/30 hover:text-red-300 transition-all"
                >
                    <LogoutIcon />
                    <span>Sair (Logout)</span>
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;