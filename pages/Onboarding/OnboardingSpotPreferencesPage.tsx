import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpotPreferences } from '../../types';
import { useOnboarding } from '../../context/OnboardingContext';

// Reutilizando componentes de UI da SpotPreferencesPage
const NumberInput: React.FC<{
  label: string;
  name: keyof SpotPreferences;
  value?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
  placeholder?: string;
}> = ({ label, name, value, onChange, step = '0.1', placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300">{label}</label>
    <input
      type="number"
      step={step}
      name={name}
      id={name}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full mt-1 p-2 bg-slate-700 rounded border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
    />
  </div>
);

const SelectInput: React.FC<{
  label: string;
  name: keyof SpotPreferences;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}> = ({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300">{label}</label>
    <select
      name={name}
      id={name}
      value={value || ''}
      onChange={onChange}
      className="w-full mt-1 p-2 bg-slate-700 rounded border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4 p-4 border border-slate-700 rounded-lg">
    <h2 className="text-xl font-semibold text-cyan-400">{title}</h2>
    {children}
  </div>
);

const FieldGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
);

const OnboardingSpotPreferencesPage: React.FC = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  
  // Inicia o estado com dados do contexto (se o usuário estiver voltando) ou um objeto vazio.
  const existingPrefs = spotId ? onboardingData.spotPreferences[parseInt(spotId)] : undefined;
  const [preferences, setPreferences] = useState<Partial<SpotPreferences>>(existingPrefs || { is_active: true });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    let inputValue: string | number | boolean;

    if (isCheckbox) {
        inputValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number' && value !== '') {
        inputValue = parseFloat(value);
    } else {
        inputValue = value;
    }
    setPreferences(prev => ({ ...prev, [name]: inputValue }));
  };
  
  const handleSave = () => {
    if (!spotId) return;
    const numericSpotId = parseInt(spotId);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_preference_id, user_id, ...prefsToSave } = preferences;

    updateOnboardingData({
        spotPreferences: {
            ...onboardingData.spotPreferences,
            [numericSpotId]: prefsToSave as Omit<SpotPreferences, 'user_preference_id' | 'user_id'>,
        },
    });
    navigate('/onboarding/spots');
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Preferências para o Spot {spotId}</h1>
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-6">
          <Section title="Onda">
              <FieldGroup>
                <NumberInput label="Altura Min. (m)" name="min_wave_height" value={preferences.min_wave_height} onChange={handleChange} placeholder="0.5" />
                <NumberInput label="Altura Máx. (m)" name="max_wave_height" value={preferences.max_wave_height} onChange={handleChange} placeholder="2.5" />
                <NumberInput label="Altura Ideal (m)" name="ideal_wave_height" value={preferences.ideal_wave_height} onChange={handleChange} placeholder="1.5" />
              </FieldGroup>
              <FieldGroup>
                <NumberInput label="Período Min. (s)" name="min_wave_period" value={preferences.min_wave_period} onChange={handleChange} placeholder="5" />
                <NumberInput label="Período Máx. (s)" name="max_wave_period" value={preferences.max_wave_period} onChange={handleChange} placeholder="16" />
                <NumberInput label="Período Ideal (s)" name="ideal_wave_period" value={preferences.ideal_wave_period} onChange={handleChange} placeholder="10" />
              </FieldGroup>
              <SelectInput
                label="Direção Preferida"
                name="preferred_wave_direction"
                value={preferences.preferred_wave_direction}
                onChange={handleChange}
                options={[{ value: '', label: 'Qualquer' }, ...['N','NE','E','SE','S','SW','W','NW'].map(d => ({ value: d, label: d }))]}
              />
          </Section>
          {/* Adicione as outras seções (Swell, Vento, Maré, etc.) aqui, se necessário */}
          

        <button
          onClick={handleSave}
          className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all"
        >
          Salvar e Voltar
        </button>
      </div>
    </div>
  );
};

export default OnboardingSpotPreferencesPage;