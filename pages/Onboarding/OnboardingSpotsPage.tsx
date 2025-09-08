// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/pages/Onboarding/OnboardingSpotsPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSpots } from '../../hooks';
import { LocationMarkerIcon, WaveIcon } from '../../components/icons';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';

const OnboardingSpotsPage: React.FC = () => {
    const { data: spots, isLoading } = useSpots();
    const navigate = useNavigate();

    if (isLoading) {
        return <div className="text-center p-10"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
    }

    return (
        <OnboardingLayout title="Defina suas Preferências" step="Passo 2 de 4" onBack={() => navigate('/onboarding/profile')}>
            <p className="text-center text-slate-300 mb-6">Clique em um spot para definir suas preferências de onda, vento e maré para aquele local.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spots?.map(spot => (
                    <Link key={spot.spot_id} to={`/onboarding/spots/${spot.spot_id}/preferences`} className="block bg-slate-700 rounded-lg p-6 shadow-lg hover:shadow-cyan-500/20 transition-shadow transform hover:-translate-y-1">
                        <h3 className="text-xl font-bold text-white flex items-center"><WaveIcon className="mr-2 text-cyan-400" /> {spot.name}</h3>
                        <p className="text-slate-400 mt-2 flex items-center text-sm">
                            <LocationMarkerIcon className="mr-2"/>
                            Lat: {spot.latitude.toFixed(3)}, Lon: {spot.longitude.toFixed(3)}
                        </p>
                        <div className="mt-4 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                            Definir Preferências →
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-8 text-center">
                <button onClick={() => navigate('/onboarding/preset')} className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-cyan-600 transition-all">
                    Pular e Continuar
                </button>
            </div>
        </OnboardingLayout>
    );
};

export default OnboardingSpotsPage;