import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                // --- URL CORRETA PARA HASHROUTER ---
                redirectTo: `${window.location.origin}/#/update-password`,
            });
            if (error) throw error;
            setMessage('Link de recuperação enviado! Verifique seu e-mail.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-slate-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-center text-white mb-4">Recuperar Senha</h2>
                {message && <p className="text-center text-green-400">{message}</p>}
                {error && <p className="text-center text-red-400">{error}</p>}
                {!message && (
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="Seu e-mail" required
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg"
                        />
                        <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </button>
                    </form>
                )}
                 <p className="text-center text-slate-400 mt-6">
                    <Link to="/auth" className="font-medium text-cyan-400 hover:underline">Voltar para o Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;