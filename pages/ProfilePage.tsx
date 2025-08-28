import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, getUserProfile } from '../services/api'; // <-- IMPORTAR getUserProfile
import { User } from '../types';
import { LogoutIcon } from '../components/icons';

const ProfilePage: React.FC = () => {
    // O 'user' do useAuth ainda é útil para o e-mail e para saber se está logado
    const { user, userId, logout } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<Partial<User>>({});
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Estado de carregamento da página

    // --- NOVA LÓGICA PARA BUSCAR O PERFIL COMPLETO ---
    const fetchProfileData = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const profileData = await getUserProfile(userId);
            setFormData({
                name: profileData.name,
                surf_level: profileData.surf_level,
                goofy_regular_stance: profileData.goofy_regular_stance || 'Regular', 
                preferred_wave_direction: profileData.preferred_wave_direction || 'Both', 
                bio: profileData.bio,
            });
        } catch (error) {
            console.error("Failed to fetch profile data:", error);
            setMessage('Failed to load profile data.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setIsSubmitting(true);
        try {
            await updateUserProfile(userId, formData);
            // Após a atualização, podemos re-buscar os dados para garantir consistência
            await fetchProfileData(); 
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">My Profile</h1>
            <div className="bg-slate-800 rounded-xl p-8 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300">Name</label>
                        <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
                        {/* O e-mail é imutável e vem do 'user' do Supabase */}
                        <input type="email" name="email" id="email" value={user?.email || ''} disabled className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label htmlFor="surf_level" className="block text-sm font-medium text-slate-300">Surf Level</label>
                        <select name="surf_level" id="surf_level" value={formData.surf_level || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="maroleiro">Maroleiro</option>
                            <option value="intermediario">Intermediário</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="goofy_regular_stance" className="block text-sm font-medium text-slate-300">Stance</label>
                        <select name="goofy_regular_stance" id="goofy_regular_stance" value={formData.goofy_regular_stance || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="Regular">Regular</option>
                            <option value="Goofy">Goofy</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="preferred_wave_direction" className="block text-sm font-medium text-slate-300">Preferred Wave Direction</label>
                        <select name="preferred_wave_direction" id="preferred_wave_direction" value={formData.preferred_wave_direction || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="Left">Esquerda</option>
                            <option value="Right">Direita</option>
                            <option value="Both">Ambas</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-slate-300">Bio</label>
                         <textarea name="bio" id="bio" rows={3} value={formData.bio || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={isSubmitting} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
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