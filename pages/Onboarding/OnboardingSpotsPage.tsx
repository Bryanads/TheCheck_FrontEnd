import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSpots } from '../../services/api';
import { Spot } from '../../types';
import { LocationMarkerIcon, WaveIcon } from '../../components/icons';

const OnboardingSpotsPage: React.FC = () => {
    const [spots, setSpots] = useState<Spot[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSpots = async () => {
            try {
                const spotsData = await getSpots();
                setSpots(spotsData);
            } catch (error) {
                console.error("Failed to fetch spots", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSpots();
    }, []);

    if (loading) {
        return <div className="text-center p-10"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-white mb-2">Preferências dos Spots</h1>
            <p className="text-slate-400 mb-8">Passo 2 de 3 - Configure pelo menos um spot para continuar.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spots.map(spot => (
                    <Link key={spot.spot_id} to={`/onboarding/spots/${spot.spot_id}/preferences`} className="block bg-slate-800 rounded-lg p-6 shadow-lg hover:shadow-cyan-500/20 transition-shadow transform hover:-translate-y-1">
                        <h3 className="text-xl font-bold text-white flex items-center"><WaveIcon className="mr-2 text-cyan-400" /> {spot.spot_name}</h3>
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
                    Continuar
                </button>
            </div>
        </div>
    );
};

export default OnboardingSpotsPage;