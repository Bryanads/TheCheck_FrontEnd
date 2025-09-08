// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/pages/SpotsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSpots } from '../hooks';
import { Spot } from '../types';
import { LocationMarkerIcon, WaveIcon } from '../components/icons';

const SpotCard: React.FC<{ spot: Spot }> = ({ spot }) => (
    <Link to={`/spots/${spot.spot_id}/preferences`} className="block bg-slate-800 rounded-lg p-6 shadow-lg hover:shadow-cyan-500/20 transition-shadow transform hover:-translate-y-1">
        <h3 className="text-xl font-bold text-white flex items-center"><WaveIcon className="mr-2 text-cyan-400" /> {spot.name}</h3>
        <p className="text-slate-400 mt-2 flex items-center text-sm">
            <LocationMarkerIcon className="mr-2"/>
            Lat: {spot.latitude.toFixed(3)}, Lon: {spot.longitude.toFixed(3)}
        </p>
         <div className="mt-4 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Set Preferences →
        </div>
    </Link>
);

const SpotsPage: React.FC = () => {
    const { data: spots, isLoading, error } = useSpots();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">Failed to load spots.</p>;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-white mb-8">Surf Spots</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spots?.map(spot => (
                    <SpotCard key={spot.spot_id} spot={spot} />
                ))}
            </div>
        </div>
    );
};

export default SpotsPage;