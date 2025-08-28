import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const UpdatePasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); // Usaremos para saber quando a sessão foi estabelecida

    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isValidating, setIsValidating] = useState(true); // Novo estado para controlar a validação

    useEffect(() => {
        // Esta função roda assim que a página carrega.
        const handlePasswordRecovery = async () => {
            // Pega a URL completa após o #
            const hash = window.location.hash;
            
            // A URL tem o formato: /#/update-password#access_token=...
            // Vamos dividir a string pelo segundo '#' para isolar os parâmetros
            const paramString = hash.split('#')[2];

            if (paramString) {
                const params = new URLSearchParams(paramString);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                // Se encontramos os tokens na URL, nós os usamos para criar a sessão manualmente.
                if (accessToken && refreshToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (error) {
                        setError('Não foi possível validar a sessão. O link pode ser inválido.');
                    }
                } else {
                    setError('Tokens de recuperação não encontrados na URL.');
                }
            }
            // Após tentar processar, paramos a validação para a UI reagir
            setIsValidating(false);
        };

        handlePasswordRecovery();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setMessage('Senha atualizada com sucesso! Você será redirecionado para fazer login.');
            setTimeout(() => {
                supabase.auth.signOut();
                navigate('/auth');
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao atualizar a senha.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderiza um loader enquanto validamos a URL manualmente
    if (isValidating) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-4 text-slate-300">Validando sua sessão...</p>
            </div>
        );
    }
    
    // Se a validação terminou mas o usuário não está autenticado, o link falhou
    if (!isAuthenticated) {
        return (
             <div className="max-w-md mx-auto mt-10 text-center">
                 <div className="bg-slate-800 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Sessão Inválida</h2>
                    <p className="text-slate-300">{error || "O link de recuperação de senha pode ter expirado ou é inválido. Por favor, solicite um novo link."}</p>
                 </div>
            </div>
        );
    }

    // Se a validação terminou e o usuário está autenticado, mostra o formulário
    return (
         <div className="max-w-md mx-auto mt-10">
            <div className="bg-slate-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-center text-white mb-4">Crie uma Nova Senha</h2>
                {message && <p className="text-center text-green-400">{message}</p>}
                {error && <p className="text-center text-red-400">{error}</p>}
                
                {!message && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Sua nova senha"
                            required
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600"
                        >
                            {isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UpdatePasswordPage;