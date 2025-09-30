import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfile, useSpots, useUpdateSpotPreferences, useCreatePreset, useSpotPreferences } from '../hooks';
import { ProfileUpdate, Spot, PreferenceUpdate, PresetCreate } from '../types';
import { OnboardingLayout } from '../components/layout/OnboardingLayout';
import { PreferenceFormSections } from '../components/preferences/PreferenceFormFields';
import { toUTCTime } from '../utils/utils';

// --- Sub-componente ProfileStep (sem alterações) ---
const ProfileStep: React.FC<{ onComplete: (data: ProfileUpdate) => void }> = ({ onComplete }) => {
    const [profile, setProfile] = useState<ProfileUpdate>({ surf_level: 'intermediario', stance: 'regular' });
    const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        await updateProfile(profile);
        onComplete(profile);
    };

    return (
        <div className="space-y-6">
            <p className="text-center text-slate-300">Para começar, nos diga um pouco sobre seu surf.</p>
            <div>
                <label htmlFor="surf_level" className="block text-sm font-medium text-slate-300">Nível de Surf</label>
                <select name="surf_level" id="surf_level" value={profile.surf_level} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg">
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="maroleiro">Maroleiro</option>
                    <option value="pro">Pro</option>
                </select>
            </div>
            <div>
                <label htmlFor="stance" className="block text-sm font-medium text-slate-300">Base (Stance)</label>
                <select name="stance" id="stance" value={profile.stance} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg">
                    <option value="regular">Regular</option>
                    <option value="goofy">Goofy</option>
                </select>
            </div>
            <button onClick={handleSubmit} disabled={isPending} className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                {isPending ? 'Salvando...' : 'Continuar'}
            </button>
        </div>
    );
};

// --- Sub-componente SpotsStep ---
const SpotsStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { data: spots, isLoading } = useSpots();
    const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

    if (isLoading) return <p>Carregando spots...</p>;

    if (selectedSpot) {
        return <SpotPreferencesForm spot={selectedSpot} onBack={() => setSelectedSpot(null)} />;
    }

    return (
        <div className="space-y-6">
            <p className="text-center text-slate-300">Agora, se quiser, ajuste suas preferências para os spots que você mais surfa. Isso ajuda a dar as melhores recomendações.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2 bg-slate-900/50 rounded-lg">
                {spots?.map(spot => (
                    <button key={spot.spot_id} onClick={() => setSelectedSpot(spot)} className="text-left p-3 rounded-md bg-slate-700 hover:bg-slate-600">
                        {spot.name}
                    </button>
                ))}
            </div>
            <button onClick={onComplete} className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-600">
                Continuar para o Próximo Passo
            </button>
        </div>
    );
};

// --- Sub-componente SpotPreferencesForm ---
const SpotPreferencesForm: React.FC<{ spot: Spot; onBack: () => void }> = ({ spot, onBack }) => {
    const { mutateAsync: updatePreferences, isPending: isSubmitting } = useUpdateSpotPreferences();
    const { data: initialPreferences, isLoading: isLoadingPrefs } = useSpotPreferences(spot.spot_id);
    const [preferences, setPreferences] = useState<Partial<PreferenceUpdate>>({});

    useEffect(() => {
        if (initialPreferences) {
            setPreferences({
                ideal_swell_height: initialPreferences.ideal_swell_height,
                max_swell_height: initialPreferences.max_swell_height,
                max_wind_speed: initialPreferences.max_wind_speed,
                ideal_water_temperature: initialPreferences.ideal_water_temperature,
                ideal_air_temperature: initialPreferences.ideal_air_temperature,
                is_active: true,
            });
        }
    }, [initialPreferences]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setPreferences(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : parseFloat(value) }));
    };

    const handleSave = async () => {
        if (Object.values(preferences).some(v => v === undefined || isNaN(v as number))) {
            return;
        }
        await updatePreferences({ spotId: spot.spot_id, updates: preferences });
        onBack();
    };
    
    if (isLoadingPrefs) {
        return (
            <div className="flex justify-center items-center p-10">
                <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
         <div className="space-y-4">
            <h3 className="text-xl text-center font-bold text-cyan-400">{spot.name}</h3>
            <p className="text-sm text-center text-slate-400">Ajuste os valores padrão ou salve como estão.</p>
            <PreferenceFormSections preferences={preferences} handleChange={handleChange} />
            <div className="flex gap-4 pt-4">
                 <button onClick={onBack} className="w-full bg-slate-600 text-white font-bold py-2 rounded-lg hover:bg-slate-500">
                    Voltar
                </button>
                <button onClick={handleSave} disabled={isSubmitting} className="w-full bg-cyan-500 text-white font-bold py-2 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                    {isSubmitting ? 'Salvando...' : 'Salvar e Fechar'}
                </button>
            </div>
        </div>
    );
};

// --- *** VERSÃO CORRETA E SIMPLIFICADA DO PRESETSTEP *** ---
const PresetStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { data: spots } = useSpots();
    const { mutateAsync: createPreset, isPending } = useCreatePreset();

    const [name, setName] = useState('Meu Check Rápido');
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([]);
    const [startTime, setStartTime] = useState('06:00');
    const [endTime, setEndTime] = useState('18:00');
    const [error, setError] = useState<string | null>(null);

    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
    };

    const handleFinalize = async () => {
        setError(null);
        if (!name.trim()) { setError("O nome do preset é obrigatório."); return; }
        if (selectedSpotIds.length === 0) { setError("Selecione pelo menos um spot."); return; }

        const presetData: PresetCreate = {
            name,
            spot_ids: selectedSpotIds,
            start_time: toUTCTime(startTime),
            end_time: toUTCTime(endTime),
            // Lógica travada: Sempre buscará recomendações para hoje e amanhã.
            day_selection_type: 'offsets',
            day_selection_values: [0, 1], 
            is_default: true,
        };
        await createPreset(presetData);
        onComplete();
    };
    
    return (
        <div className="space-y-6">
            <p className="text-center text-slate-300">Para finalizar, crie seu primeiro "Check Rápido". É um filtro salvo para checar as ondas nas próximas 24h.</p>
            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center">{error}</p>}
            
            <input type="text" placeholder="Nome do Preset" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
            
            <div>
                <label className="block text-slate-300 font-medium mb-2">Selecione os Spots</label>
                <div className="max-h-32 overflow-y-auto bg-slate-700 p-2 rounded-lg grid grid-cols-2 gap-2">
                {spots?.map(spot => (
                    <button key={spot.spot_id} type="button" onClick={() => handleSpotToggle(spot.spot_id)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-slate-600'}`}>
                        {spot.name}
                    </button>
                ))}
                </div>
            </div>
            
            <div>
                <label className="block text-slate-300 font-medium mb-2">Seu Horário de Surf (Local)</label>
                <div className="flex items-center space-x-4">
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"/>
                    <span className="text-slate-400">até</span>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"/>
                </div>
            </div>

            <button onClick={handleFinalize} disabled={isPending || selectedSpotIds.length === 0} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 disabled:bg-slate-600">
                {isPending ? 'Finalizando...' : 'Concluir e ver as ondas!'}
            </button>
        </div>
    );
};

// --- Componente Principal da Página (sem alterações) ---
const OnboardingPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const steps = [
        { num: 1, title: "Seu Perfil de Surfista", component: <ProfileStep onComplete={() => setStep(2)} /> },
        { num: 2, title: "Preferências dos Spots", component: <SpotsStep onComplete={() => setStep(3)} /> },
        { num: 3, title: "Crie seu Primeiro Preset", component: <PresetStep onComplete={() => navigate('/recommendations')} /> },
    ];

    const currentStep = steps[step - 1];

    return (
        <OnboardingLayout title={currentStep.title} step={`Passo ${currentStep.num} de 3`} onBack={step > 1 ? () => setStep(step - 1) : undefined}>
            {currentStep.component}
        </OnboardingLayout>
    );
};

export default OnboardingPage;