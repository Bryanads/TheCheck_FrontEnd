// bryanads/thecheck_frontend/TheCheck_FrontEnd-1727b3a4122cab389de3a8341a5c0d2dc93cbca5/pages/OnboardingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfile, useSpots, useUpdateSpotPreferences, useCreatePreset } from '../hooks';
import { ProfileUpdate, Spot, PreferenceUpdate, PresetCreate } from '../types';
import { OnboardingLayout } from '../components/layout/OnboardingLayout';
import { PreferenceFormSections } from '../components/preferences/PreferenceFormFields';
import { toLocalTime, toUTCTime } from '../utils/utils';

// --- Sub-componentes para cada passo ---

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
                    <option value="avancado">Avançado</option>
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

const SpotsStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { data: spots, isLoading } = useSpots();
    const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

    if (isLoading) return <p>Carregando spots...</p>;

    if (selectedSpot) {
        return <SpotPreferencesForm spot={selectedSpot} onBack={() => setSelectedSpot(null)} />;
    }

    return (
        <div className="space-y-6">
            <p className="text-center text-slate-300">Agora, configure suas preferências para os spots que você mais surfa. Isso nos ajuda a dar as melhores recomendações.</p>
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

const SpotPreferencesForm: React.FC<{ spot: Spot; onBack: () => void }> = ({ spot, onBack }) => {
    const { mutateAsync: updatePreferences, isPending } = useUpdateSpotPreferences();
    const [preferences, setPreferences] = useState<Partial<PreferenceUpdate>>({ is_active: true });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setPreferences(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : parseFloat(value) }));
    };

    const handleSave = async () => {
        await updatePreferences({ spotId: spot.spot_id, updates: preferences });
        onBack();
    };

    return (
         <div className="space-y-4">
            <h3 className="text-xl text-center font-bold text-cyan-400">{spot.name}</h3>
            <PreferenceFormSections preferences={preferences} handleChange={handleChange} />
            <div className="flex gap-4">
                 <button onClick={onBack} className="w-full bg-slate-600 text-white font-bold py-2 rounded-lg hover:bg-slate-500">
                    Voltar
                </button>
                <button onClick={handleSave} disabled={isPending} className="w-full bg-cyan-500 text-white font-bold py-2 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                    {isPending ? 'Salvando...' : 'Salvar e Fechar'}
                </button>
            </div>
        </div>
    );
};

// --- NOVO PRESET STEP COMPLETO ---
const MAX_DAY_OFFSET = 6;

const PresetStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { data: spots } = useSpots();
    const { mutateAsync: createPreset, isPending } = useCreatePreset();

    const [name, setName] = useState('Meu Primeiro Preset');
    const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([]);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('20:00');
    const [daySelectionType, setDaySelectionType] = useState<'offsets' | 'weekdays'>('offsets');
    const [daySelectionValues, setDaySelectionValues] = useState<number[]>([0, 1, 2]);
    const [error, setError] = useState<string | null>(null);

    const handleSpotToggle = (spotId: number) => {
        setSelectedSpotIds(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
    };
    
    const handleDayTypeChange = (type: 'offsets' | 'weekdays') => {
        setDaySelectionType(type);
        setDaySelectionValues(type === 'offsets' ? [0] : []);
    };

    const handleOffsetChange = (newOffset: number) => {
        const offset = Math.max(0, Math.min(newOffset, MAX_DAY_OFFSET));
        const newValues = Array.from({ length: offset + 1 }, (_, i) => i);
        setDaySelectionValues(newValues);
    };

    const handleWeekdayToggle = (dayIndex: number) => {
        setDaySelectionValues(prev =>
            prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
        );
    };

    const handleFinalize = async () => {
        setError(null);
        if (!name.trim()) { setError("O nome do preset é obrigatório."); return; }
        if (selectedSpotIds.length === 0) { setError("Selecione pelo menos um spot."); return; }
        if (daySelectionValues.length === 0) { setError("Selecione pelo menos um dia."); return; }

        const presetData: PresetCreate = {
            name,
            spot_ids: selectedSpotIds,
            start_time: toUTCTime(startTime),
            end_time: toUTCTime(endTime),
            day_selection_type: daySelectionType,
            day_selection_values: daySelectionValues,
            is_default: true,
        };
        await createPreset(presetData);
        onComplete();
    };
    
    return (
        <div className="space-y-4">
            <p className="text-center text-slate-300">Para finalizar, crie seu primeiro "Preset". É um filtro salvo para checar rapidamente suas ondas.</p>
            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center">{error}</p>}
            
            <input type="text" placeholder="Nome do Preset" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
            
            <div>
                <label className="block text-slate-300 font-medium mb-2">Spots</label>
                <div className="max-h-32 overflow-y-auto bg-slate-700 p-2 rounded-lg grid grid-cols-2 gap-2">
                {spots?.map(spot => (
                    <button key={spot.spot_id} type="button" onClick={() => handleSpotToggle(spot.spot_id)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedSpotIds.includes(spot.spot_id) ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-slate-600'}`}>
                        {spot.name}
                    </button>
                ))}
                </div>
            </div>

            <div>
                <label className="block text-slate-300 font-medium mb-2">Dias para o Check</label>
                <div className="flex bg-slate-700 rounded-lg p-1">
                    <button type="button" onClick={() => handleDayTypeChange('offsets')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition ${daySelectionType === 'offsets' ? 'bg-cyan-500 text-slate-900' : 'text-slate-300'}`}>A partir de Hoje</button>
                    <button type="button" onClick={() => handleDayTypeChange('weekdays')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition ${daySelectionType === 'weekdays' ? 'bg-cyan-500 text-slate-900' : 'text-slate-300'}`}>Dias da Semana</button>
                </div>
                <div className="mt-2">
                    {daySelectionType === 'offsets' ? (
                        <div className="flex items-center justify-center space-x-4 bg-slate-700 p-2 rounded-lg">
                            <button type="button" onClick={() => handleOffsetChange(daySelectionValues.length - 2)} className="bg-slate-600 w-8 h-8 rounded-full font-bold">-</button>
                            <span className="font-bold w-24 text-center">{daySelectionValues.length} dia(s)</span>
                            <button type="button" onClick={() => handleOffsetChange(daySelectionValues.length)} className="bg-slate-600 w-8 h-8 rounded-full font-bold">+</button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center space-x-1">
                            {['D','S','T','Q','Q','S','S'].map((day, index) => (
                                <button key={index} type="button" onClick={() => handleWeekdayToggle(index)} className={`w-10 h-10 rounded-full font-bold transition-colors ${daySelectionValues.includes(index) ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'}`}>{day}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <div>
                <label className="block text-slate-300 font-medium mb-2">Intervalo de Horas (Local)</label>
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


// --- Componente Principal da Página ---

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