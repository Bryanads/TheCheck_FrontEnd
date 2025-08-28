import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { EyeIcon, EyeOffIcon } from '../components/icons';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Efeito para manter o estado da verificação ao recarregar a página
  useEffect(() => {
    const verificationEmail = sessionStorage.getItem('emailForVerification');
    if (verificationEmail) {
      setEmailForVerification(verificationEmail);
      setAwaitingVerification(true);
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (password !== formData.get('confirmPassword')) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) throw error;
      
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("Este e-mail já está em uso.");
      } else {
        // 1. Salva o e-mail no sessionStorage para que a página, ao recarregar,
        //    saiba que precisa mostrar a tela de verificação.
        sessionStorage.setItem('emailForVerification', email);
        
        // 2. Recarrega a página. O useEffect existente cuidará de mostrar a tela correta.
        window.location.reload();
      }

    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailForVerification,
        token: token,
        type: 'signup',
      });
      if (error) throw error;
      
      // Limpa o sessionStorage no sucesso
      sessionStorage.removeItem('emailForVerification');
      navigate('/onboarding/profile');

    } catch (err: any) {
      setError(err.error_description || err.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/loading');
    } catch (err: any) {
        const errorMessage = err.error_description || err.message || '';
        
        if (errorMessage.includes('Invalid login credentials')) {
            setError('E-mail ou senha inválidos. Por favor, verifique seus dados.');
        } else if (errorMessage.includes('Email not confirmed')) {
            setError('Este e-mail ainda não foi verificado. Verifique sua caixa de entrada para encontrar o código de ativação.');
        } else {
            setError('Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.');
        }

    } finally {
      setLoading(false);
    }
  };

  const handleGoBackFromVerification = () => {
    // Limpa o sessionStorage ao voltar
    sessionStorage.removeItem('emailForVerification');
    setAwaitingVerification(false);
  }

  // --- RENDERIZAÇÃO DO FORMULÁRIO DE VERIFICAÇÃO ---
  if (awaitingVerification) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-slate-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-center text-white mb-2">Verifique seu E-mail</h2>
          <p className="text-center text-slate-400 mb-6">
            Enviamos um código de 6 dígitos para <strong>{emailForVerification}</strong>.
          </p>

          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}
          
          <form onSubmit={handleVerificationSubmit}>
            <input
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-[1em]"
              type="text"
              name="token" // Nome simples para o campo
              maxLength={6}
              placeholder="------"
              required
            />
            <button type="submit" disabled={loading} className="mt-6 w-full bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
              {loading ? 'Verificando...' : 'Verificar e Continuar'}
            </button>
          </form>
          <button onClick={handleGoBackFromVerification} className="mt-4 text-sm text-slate-400 hover:text-white">
            Voltar
          </button>
        </div>
      </div>
    );
  }
  
  // --- RENDERIZAÇÃO PRINCIPAL (LOGIN/CADASTRO) ---
  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-slate-800 rounded-xl shadow-2xl shadow-cyan-500/10 p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-slate-400 mb-6">{isLogin ? 'Log in to check the surf.' : 'Sign up to get personalized recommendations.'}</p>

        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}
        
        <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-6">
          {!isLogin && (
             <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg" type="text" name="name" placeholder="Full Name" required />
          )}
          <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg" type="email" name="email" placeholder="Email" required />

          <div className="relative">
            <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg pr-10" type={showPassword ? "text" : "password"} name="password" placeholder="Password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white">
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {!isLogin && (
            <div className="relative">
              <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg pr-10" type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" required />
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 flex items-center justify-center">
             {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
             {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-sm mt-4">
            {isLogin && (
                 <Link to="/forgot-password" className="font-medium text-cyan-400 hover:underline">
                    Esqueceu sua senha?
                </Link>
            )}
        </div>

        <p className="text-center text-slate-400 mt-6">
          {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-medium text-cyan-400 hover:underline">
            {isLogin ? 'Cadastre-se' : 'Faça Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;