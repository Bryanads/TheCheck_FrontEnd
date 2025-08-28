import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { getSpots } from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // <-- Importe o useAuth
import { Spot } from '../../types';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';
import { toUTCTime, toLocalTime } from '../../utils/utils';

const WeekdaySelector: React.FC<{
    selectedDays: number[];
    onToggle: (dayIndex: number) => void;
}> = ({ selectedDays, onToggle }) => {
    const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    return (
        <div>
            <label className="block text-slate-300 font-medium mb-2">Dias da Semana para o Check</label>
            <div className="flex justify-between items-center space-x-1">
                {days.map((day, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onToggle(index)}
                        className={`w-10 h-10 rounded-full font-bold transition-colors ${
                            selectedDays.includes(index)
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
};


const OnboardingPresetPage: React.FC = () => {
    const navigate = useNavigate();
    const { onboardingData, finalizeOnboarding } = useOnboarding();
    const { userId } = useAuth(); // <-- Obtenha o userId do contexto de autenticação
    const [spots, setSpots] = useState<Spot[]>([]);
    
    const [presetName, setPresetName] = useState('Meu Primeiro Preset');
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([]);
    const [startTime, setStartTime] = useState(toLocalTime(onboardingData.preset.start_time));
    const [endTime, setEndTime] = useState(toLocalTime(onboardingData.preset.end_time));
    const [weekdays, setWeekdays] = useState<number[]>([1,2,3,4,5]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSpots = async () => {
            const spotsData = await getSpots();
            setSpots(spotsData);
            setSelectedSpotIds(Object.keys(onboardingData.spotPreferences).map(Number));
        };
        fetchSpots();
    }, [onboardingData.spotPreferences]);

    const handleWeekdayToggle = (dayIndex: number) => {
        setWeekdays(prev =>
            prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
        );
    };

    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
    };
    
    const handleFinalize = async () => {
        setError(null);
        // --- VERIFICAÇÃO INICIAL ---
        if (!userId) {
            setError("Usuário não autenticado, não é possível finalizar.");
            return;
        }

        if (!presetName.trim()) {
            setError('Por favor, dê um nome ao seu preset.');
            return;
        }
        if (selectedSpotIds.length === 0) {
            setError('Por favor, selecione pelo menos um spot para o seu preset.');
            return;
        }
        if (weekdays.length === 0) {
            setError("Selecione pelo menos um dia da semana.");
            return;
        }
        if (!startTime || !endTime) {
            setError("Defina um horário de início e fim.");
            return;
        }
        
        setLoading(true);
        
        const finalPresetData = {
            preset_name: presetName,
            spot_ids: selectedSpotIds,
            start_time: toUTCTime(startTime),
            end_time: toUTCTime(endTime),
            weekdays: weekdays,
        };

        try {
            // --- CORREÇÃO AQUI: PASSE O userId PARA A FUNÇÃO ---
            await finalizeOnboarding(finalPresetData, userId);
            
            // O login não é mais necessário aqui, apenas o redirecionamento
            navigate('/loading');

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao finalizar o cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <OnboardingLayout title="Último Passo!" step="Passo 3 de 3" onBack={() => navigate('/onboarding/spots')}>
            <div className="space-y-6">
                <div>
                    <label className="block text-slate-300 font-medium mb-2">Nome do Preset</label>
                    <input type="text" value={presetName} onChange={(e) => setPresetName(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                </div>
                <div>
                    <label className="block text-slate-300 font-medium mb-2">Spots para este Preset</label>
                    <div className="max-h-48 overflow-y-auto bg-slate-700 p-2 rounded-lg grid grid-cols-2 gap-2">
                        {spots.map(spot => (
                            <button key={spot.spot_id} type="button" onClick={() => handleSpotToggle(spot.spot_id)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-slate-600'}`}>
                                {spot.spot_name}
                            </button>
                        ))}
                    </div>
                </div>
                
                <WeekdaySelector selectedDays={weekdays} onToggle={handleWeekdayToggle} />

                <div>
                    <label className="block text-slate-300 font-medium mb-2">Seu Horário de Surf (Local)</label>
                    <div className="flex items-center space-x-4">
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        <span className="text-slate-400">até</span>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                </div>

                {error && <p className="text-red-400 text-center">{error}</p>}

                <button onClick={handleFinalize} disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all disabled:bg-slate-600 disabled:cursor-wait">
                    {loading ? 'Finalizando...' : 'Concluir e Surfar!'}
                </button>
            </div>
        </OnboardingLayout>
    );
};

export default OnboardingPresetPage;