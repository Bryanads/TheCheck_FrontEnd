import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/api';
import { User } from '../types';

const ProfilePage: React.FC = () => {
    const { user, userId, isLoading, updateUser } = useAuth();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                surf_level: user.surf_level,
                goofy_regular_stance: user.goofy_regular_stance || 'Regular', 
                preferred_wave_direction: user.preferred_wave_direction || 'Both', 
                bio: user.bio,
            });
        }
    }, [user]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setIsSubmitting(true);
        try {
            const response = await updateUserProfile(userId, formData);
            updateUser(response.user);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !user) {
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
                        <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label htmlFor="surf_level" className="block text-sm font-medium text-slate-300">Surf Level</label>
                        <select name="surf_level" id="surf_level" value={formData.surf_level || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option>maroleiro</option>
                            <option>intermediario</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="goofy_regular_stance" className="block text-sm font-medium text-slate-300">Stance</label>
                        <select name="goofy_regular_stance" id="goofy_regular_stance" value={formData.goofy_regular_stance || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option>Regular</option>
                            <option>Goofy</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="preferred_wave_direction" className="block text-sm font-medium text-slate-300">Preferred Wave Direction</label>
                        <select name="preferred_wave_direction" id="preferred_wave_direction" value={formData.preferred_wave_direction || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option>Left</option>
                            <option>Right</option>
                            <option>Both</option>
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
        </div>
    );
};

export default ProfilePage;