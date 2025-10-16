// src/pages/OnboardingPage.tsx
import React, { useState } from 'react'; // LINHA CORRIGIDA
import { useNavigate } from 'react-router-dom';
import { useSpots, useCreatePreset } from '../hooks';
import { toUTCTime } from '../utils/utils';
import { PresetCreate } from '../types';
import { LogoIcon } from '../components/icons';

const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: spots, isLoading: isLoadingSpots } = useSpots();
    const { mutateAsync: createPreset, isPending: isSaving } = useCreatePreset();

    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([]);
    const [startTime, setStartTime] = useState('06:00');
    const [endTime, setEndTime] = useState('18:00');
    const [error, setError] = useState<string | null>(null);

    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev =>
            prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]
        );
    };

    const handleFinish = async () => {
        setError(null);
        if (selectedSpotIds.length === 0) {
            setError("Por favor, selecione pelo menos um pico de surf.");
            return;
        }

        const presetData: PresetCreate = {
            name: 'Meu Check Padrão',
            spot_ids: selectedSpotIds,
            start_time: toUTCTime(startTime),
            end_time: toUTCTime(endTime),
            day_selection_type: 'offsets',
            day_selection_values: [0, 1], // Sempre "Hoje" e "Amanhã" por padrão
            is_default: true,
        };

        try {
            await createPreset(presetData);
            navigate('/recommendations');
        } catch (err) {
            setError("Ocorreu um erro ao salvar suas preferências. Tente novamente.");
        }
    };

    return (
        <div className="flex flex-col justify-center min-h-screen p-4">
            <div className="max-w-xl mx-auto w-full">
                <div className="text-center mb-10">
                    <LogoIcon className="mx-auto w-12 h-12 text-cyan-400" />
                    <h1 className="text-4xl font-bold text-white mt-4">Bem-vindo ao TheCheck!</h1>
                    <p className="text-slate-400 mt-2">Vamos configurar seu primeiro "check" para encontrar as melhores ondas.</p>
                </div>

                <div className="bg-slate-800 p-8 rounded-xl space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-slate-300 mb-3">Quais seus picos de surf frequentes?</label>
                        {isLoadingSpots ? <p className="text-slate-400">Carregando picos...</p> : (
                            <div className="max-h-48 overflow-y-auto bg-slate-700/50 p-2 rounded-lg grid grid-cols-2 gap-2">
                                {spots?.map(spot => (
                                    <button
                                        key={spot.spot_id}
                                        onClick={() => handleSpotToggle(spot.spot_id)}
                                        className={`w-full text-left p-3 rounded-md transition-colors text-sm font-semibold ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                        {spot.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-slate-300 mb-3">Qual seu horário de surf habitual?</label>
                        <div className="flex items-center space-x-4">
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg"/>
                            <span className="text-slate-400 font-bold">até</span>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg"/>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-center">{error}</p>}

                    <button
                        onClick={handleFinish}
                        disabled={isSaving || isLoadingSpots || selectedSpotIds.length === 0}
                        className="w-full bg-cyan-500 text-white font-bold py-4 rounded-lg hover:bg-cyan-600 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {isSaving ? 'Salvando...' : 'Concluir e Ver as Ondas!'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;