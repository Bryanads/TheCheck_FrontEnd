// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/pages/Onboarding/OnboardingPresetPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpots, useCreatePreset } from '../../hooks';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';
import { toUTCTime, toLocalTime } from '../../utils/utils';
import { PresetCreate } from '../../types';

const OnboardingPresetPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: spots } = useSpots();
    const { mutateAsync: createPreset, isPending: loading } = useCreatePreset();
    
    const [preset, setPreset] = useState<Partial<PresetCreate>>({
        name: 'Meu Primeiro Preset',
        spot_ids: [],
        start_time: '08:00:00',
        end_time: '20:00:00',
        day_selection_type: 'weekdays',
        day_selection_values: [1, 2, 3, 4, 5],
        is_default: true,
    });
    
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPreset(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleFinalize = async () => {
        setError(null);
        if (!preset.name?.trim() || !preset.spot_ids?.length) {
            setError('Por favor, preencha o nome e selecione ao menos um spot.');
            return;
        }

        try {
            await createPreset(preset as PresetCreate);
            navigate('/recommendations');
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao finalizar.');
        }
    };

    return (
        <OnboardingLayout title="Crie seu Preset" step="Passo 4 de 4" onBack={() => navigate('/onboarding/spots')}>
            <div className="space-y-6">
                {/* ... (Seu formulário de preset pode ser adicionado aqui) ... */}
                <p className="text-center text-slate-300">Você está pronto! Clique abaixo para ver suas primeiras recomendações.</p>
                {error && <p className="text-red-400 text-center">{error}</p>}
                <button onClick={handleFinalize} disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                    {loading ? 'Finalizando...' : 'Ver Recomendações!'}
                </button>
            </div>
        </OnboardingLayout>
    );
};

export default OnboardingPresetPage;