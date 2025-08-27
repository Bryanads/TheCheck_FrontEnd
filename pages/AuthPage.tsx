import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';
import { useOnboarding } from '../context/OnboardingContext';
import { EyeIcon, EyeOffIcon } from '../components/icons';

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
                setError(
                    <div>
                        <span>Email ou senha inválidos.</span>
                        <div>
                            <span>Se ainda não tem uma conta: </span>
                            <button onClick={() => { setIsLogin(false); setError(null); }} className="font-bold underline">Cadastre-se</button>
                        </div>
                    </div>
                );
            } else if (err.message.includes('Email already registered')) {
                setError(
                    <div>
                        <span>Este email já está cadastrado.</span>
                        <div>
                            <button onClick={() => { setIsLogin(true); setError(null); }} className="font-bold underline">Faça login</button>
                        </div>
                    </div>
                );
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

          {!isLogin && (
            <div className="relative">
                <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10" type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
          )}


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