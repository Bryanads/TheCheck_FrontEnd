import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';
import { useOnboarding } from '../context/OnboardingContext';

// --- ÍCONES DE OLHO PARA VISUALIZAÇÃO DE SENHA ---
const EyeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const EyeOffIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .95-3.112 3.54-5.61 6.88-6.542M9.75 9.75L4.125 4.125m5.625 5.625a3 3 0 11-4.242-4.242m4.242 4.242L14.25 14.25" /></svg>
);


const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login, isAuthenticated, logout } = useAuth();
  const { updateOnboardingData } = useOnboarding();
  const [error, setError] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (!isLogin) {
      if (data.password !== data.confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const res = await loginUser({ email: data.email, password: data.password });
        localStorage.removeItem('thecheck_cache');
        sessionStorage.clear();
        login(res.token, res.user_id);
        navigate('/loading');
      } else {
        await registerUser({ name: data.name, email: data.email, password: data.password });
        updateOnboardingData({
          credentials: {
            name: data.name as string,
            email: data.email as string,
            password: data.password as string,
          },
        });
        navigate('/onboarding/profile');
      }
    } catch (err: any) {
        if (err.message) {
            if (err.message.includes('User not found') || err.message.includes('Invalid credentials')) {
                setError(<>Email ou senha inválidos. Não tem uma conta? <button onClick={() => setIsLogin(false)} className="font-bold underline">Cadastre-se</button></>);
            } else if (err.message.includes('Email already registered')) {
                setError(<>Este email já está cadastrado. <button onClick={() => setIsLogin(true)} className="font-bold underline">Faça login</button></>);
            } else {
                setError(err.message);
            }
        } else {
            setError('Ocorreu um erro desconhecido.');
        }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
        <div className="max-w-md mx-auto mt-10 text-center">
            <div className="bg-slate-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Você já está logado.</h2>
                <button 
                    onClick={() => {
                        logout();
                        navigate('/'); // Opcional: redirecionar para a home após o logout
                    }}
                    className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-all"
                >
                    Sair (Logout)
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-slate-800 rounded-xl shadow-2xl shadow-cyan-500/10 p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-slate-400 mb-6">{isLogin ? 'Log in to check the surf.' : 'Sign up to get personalized recommendations.'}</p>
        
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
             <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" type="text" name="name" placeholder="Full Name" required />
          )}
          <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" type="email" name="email" placeholder="Email" required />
          
          <div className="relative">
            <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10" type={showPassword ? "text" : "password"} name="password" placeholder="Password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white">
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>


          <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/30 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
             {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
             {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-medium text-cyan-400 hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;