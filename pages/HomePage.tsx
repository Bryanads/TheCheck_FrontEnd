
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="text-center py-16 md:py-24">
            <div 
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" 
                style={{backgroundImage: `url('https://picsum.photos/seed/surfer/1920/1080')`}}>
            </div>
            <div className="relative">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
                    Welcome to <span className="text-cyan-400">TheCheck</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-300">
                    Your personal surf forecaster. Stop guessing, start surfing the best waves of your life.
                </p>
                <div className="mt-10">
                    {isAuthenticated ? (
                        <div>
                            <p className="text-2xl text-slate-200 mb-4">Welcome back, {user?.name}!</p>
                            <Link
                                to="/recommendations"
                                className="inline-block bg-cyan-500 text-white font-bold text-lg py-3 px-8 rounded-lg hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/40 transform hover:scale-105"
                            >
                                Get My Recommendations
                            </Link>
                        </div>
                    ) : (
                        <Link
                            to="/auth"
                            className="inline-block bg-cyan-500 text-white font-bold text-lg py-3 px-8 rounded-lg hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/40 transform hover:scale-105"
                        >
                            Find My Wave
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
