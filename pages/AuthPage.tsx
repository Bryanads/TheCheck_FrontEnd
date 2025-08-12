
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isLogin) {
        const res: any = await loginUser({ email: data.email, password: data.password });
        login(res.token, res.user_id);
      } else {
        await registerUser(data);
        const res: any = await loginUser({ email: data.email, password: data.password });
        login(res.token, res.user_id);
      }
      navigate('/recommendations');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-slate-800 rounded-xl shadow-2xl shadow-cyan-500/10 p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-slate-400 mb-6">{isLogin ? 'Log in to check the surf.' : 'Sign up to get personalized recommendations.'}</p>
        
        {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
             <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" type="text" name="name" placeholder="Full Name" required />
          )}
          <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" type="email" name="email" placeholder="Email" required />
          <input className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" type="password" name="password" placeholder="Password" required />
          
          <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/30 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
             {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
             {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-cyan-400 hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
