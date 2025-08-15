import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, THECHECK_CACHE_KEY } from '../context/AuthContext';
import { 
    getSpotPreferences, 
    setUserSpotPreferences, 
    getLevelSpotPreferences, 
    toggleSpotPreferenceActive,
    getRecommendations
} from '../services/api';
import { SpotPreferences, Preset } from '../types';
import { weekdaysToDayOffset } from '../utils/utils';

// --- Componentes de UI (Inputs e Seções - sem alterações) ---
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


// --- Componente Principal ---
const SpotPreferencesPage: React.FC = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState<Partial<SpotPreferences>>({ is_active: true });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDefaults, setIsUsingDefaults] = useState(false);

  useEffect(() => {
    if (!userId || !spotId) return;

    const fetchPreferences = async () => {
      setLoading(true);
      setError(null);
      try {
        const userPrefs = await getSpotPreferences(userId, parseInt(spotId));
        setPreferences(userPrefs);
        setIsUsingDefaults(false);
      } catch (err: any) {
        if (err.message?.includes('não encontradas')) {
          try {
            const levelDefaults = await getLevelSpotPreferences(userId, parseInt(spotId));
            setPreferences({ ...levelDefaults, is_active: true }); 
            setIsUsingDefaults(true);
          } catch {
            setError('Nenhum padrão encontrado. Comece a criar suas preferências!');
            setPreferences({ is_active: true });
          }
        } else {
          setError(err.message || 'Erro ao carregar preferências.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, [userId, spotId]);

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
    if (name !== 'is_active' && isUsingDefaults) setIsUsingDefaults(false);
  };
  
  // Função para invalidar e refazer o fetch das recomendações afetadas
  const invalidateAndUpdateAffectedRecommendations = async (currentSpotId: number) => {
      if (!userId) return;

      const cachedDataStr = localStorage.getItem(THECHECK_CACHE_KEY);
      if (!cachedDataStr) return;

      const cache = JSON.parse(cachedDataStr);
      const affectedPresets: Preset[] = cache.presets.filter((p: Preset) => p.spot_ids.includes(currentSpotId));

      if (affectedPresets.length === 0) return;

      // 1. Remove as recomendações antigas do cache
      affectedPresets.forEach(preset => {
          if (cache.recommendations) {
              delete cache.recommendations[preset.preset_id];
          }
      });
      localStorage.setItem(THECHECK_CACHE_KEY, JSON.stringify(cache));
      window.dispatchEvent(new Event('thecheck-cache-updated')); // Notifica a UI

      // 2. Busca as novas recomendações para cada preset afetado em segundo plano
      for (const preset of affectedPresets) {
          try {
              const recommendations = await getRecommendations({
                  user_id: userId,
                  spot_ids: preset.spot_ids,
                  day_offset: weekdaysToDayOffset(preset.weekdays),
                  start_time: preset.start_time,
                  end_time: preset.end_time,
              });
              
              // Atualiza o cache com a nova recomendação
              const currentCacheStr = localStorage.getItem(THECHECK_CACHE_KEY);
              if(currentCacheStr) {
                  const currentCache = JSON.parse(currentCacheStr);
                  if (!currentCache.recommendations) currentCache.recommendations = {};
                  currentCache.recommendations[preset.preset_id] = {
                      timestamp: Date.now(),
                      data: recommendations,
                  };
                  localStorage.setItem(THECHECK_CACHE_KEY, JSON.stringify(currentCache));
                  // Notifica a UI novamente a cada recomendação que chega
                  window.dispatchEvent(new Event('thecheck-cache-updated'));
              }
          } catch (err) {
              console.error(`Falha ao atualizar recomendação para o preset ${preset.preset_name}:`, err);
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !spotId) return;

    setIsSubmitting(true);
    setError(null);
    const numericSpotId = parseInt(spotId);

    try {
        const currentIsActive = preferences.is_active ?? false;
        if (!currentIsActive && !isUsingDefaults) {
            await toggleSpotPreferenceActive(userId, numericSpotId, false);
        } else {
            const validKeys: (keyof SpotPreferences)[] = [
                'min_wave_height', 'max_wave_height', 'ideal_wave_height',
                'min_wave_period', 'max_wave_period', 'ideal_wave_period',
                'min_swell_height', 'max_swell_height', 'ideal_swell_height',
                'min_swell_period', 'max_swell_period', 'ideal_swell_period',
                'preferred_wave_direction', 'preferred_swell_direction',
                'ideal_tide_type', 'min_sea_level', 'max_sea_level', 'ideal_sea_level',
                'min_wind_speed', 'max_wind_speed', 'ideal_wind_speed',
                'preferred_wind_direction', 'ideal_water_temperature',
                'ideal_air_temperature', 'is_active'
            ];
            const dataToSave = validKeys.reduce<Partial<SpotPreferences>>((acc, key) => {
                if (preferences[key] !== undefined) {
                    (acc[key] as any) = preferences[key];
                }
                return acc;
            }, {});
            await setUserSpotPreferences(userId, numericSpotId, dataToSave);
        }
        
        // Invalida e atualiza as recomendações em segundo plano
        await invalidateAndUpdateAffectedRecommendations(numericSpotId);

        // Navega de volta para a lista de spots
        navigate('/spots');

    } catch (err: any) {
        setError(err.message || 'Erro ao salvar preferências.');
        setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-10"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Suas Preferências para o Spot {spotId}</h1>
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded mb-4">{error}</p>}
      {isUsingDefaults && (
        <div className="bg-blue-900/50 text-blue-200 p-3 rounded-md mb-4 text-center text-sm">
          Estamos mostrando preferências padrão do seu nível. Altere qualquer valor para criar personalizadas.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-6">
        <div className="flex justify-between items-center p-3 bg-slate-700 rounded-md">
          <label htmlFor="is_active" className="font-medium text-white">Usar Minhas Preferências</label>
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={preferences.is_active ?? false}
            onChange={handleChange}
            className="w-6 h-6 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-600 focus:ring-2"
          />
        </div>

        <fieldset disabled={!preferences.is_active || isSubmitting} className="space-y-6 disabled:opacity-50 transition-opacity">
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

            <Section title="Swell">
              <FieldGroup>
                <NumberInput label="Altura Min. (m)" name="min_swell_height" value={preferences.min_swell_height} onChange={handleChange} placeholder="0.5" />
                <NumberInput label="Altura Máx. (m)" name="max_swell_height" value={preferences.max_swell_height} onChange={handleChange} placeholder="3.0" />
                <NumberInput label="Altura Ideal (m)" name="ideal_swell_height" value={preferences.ideal_swell_height} onChange={handleChange} placeholder="1.8" />
              </FieldGroup>
              <FieldGroup>
                <NumberInput label="Período Min. (s)" name="min_swell_period" value={preferences.min_swell_period} onChange={handleChange} placeholder="7" />
                <NumberInput label="Período Máx. (s)" name="max_swell_period" value={preferences.max_swell_period} onChange={handleChange} placeholder="18" />
                <NumberInput label="Período Ideal (s)" name="ideal_swell_period" value={preferences.ideal_swell_period} onChange={handleChange} placeholder="12" />
              </FieldGroup>
              <SelectInput
                label="Direção Preferida"
                name="preferred_swell_direction"
                value={preferences.preferred_swell_direction}
                onChange={handleChange}
                options={[{ value: '', label: 'Qualquer' }, ...['N','NE','E','SE','S','SW','W','NW'].map(d => ({ value: d, label: d }))]}
              />
            </Section>

            <Section title="Vento">
              <FieldGroup>
                <NumberInput label="Veloc. Min. (m/s)" name="min_wind_speed" value={preferences.min_wind_speed} onChange={handleChange} placeholder="0" />
                <NumberInput label="Veloc. Máx. (m/s)" name="max_wind_speed" value={preferences.max_wind_speed} onChange={handleChange} placeholder="8" />
                <NumberInput label="Veloc. Ideal (m/s)" name="ideal_wind_speed" value={preferences.ideal_wind_speed} onChange={handleChange} placeholder="2" />
              </FieldGroup>
              <SelectInput
                label="Direção Preferida"
                name="preferred_wind_direction"
                value={preferences.preferred_wind_direction}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Qualquer' },
                  { value: 'N', label: 'Norte' }, { value: 'NE', label: 'Nordeste' },
                  { value: 'E', label: 'Leste' }, { value: 'SE', label: 'Sudeste' },
                  { value: 'S', label: 'Sul' }, { value: 'SW', label: 'Sudoeste' },
                  { value: 'W', label: 'Oeste' }, { value: 'NW', label: 'Noroeste' }
                ]}
              />
            </Section>

            <Section title="Maré">
              <FieldGroup>
                <NumberInput label="Nível Min. (m)" name="min_sea_level" value={preferences.min_sea_level} onChange={handleChange} placeholder="0.2" />
                <NumberInput label="Nível Máx. (m)" name="max_sea_level" value={preferences.max_sea_level} onChange={handleChange} placeholder="1.5" />
                <NumberInput label="Nível Ideal (m)" name="ideal_sea_level" value={preferences.ideal_sea_level} onChange={handleChange} placeholder="0.8" />
              </FieldGroup>
              <SelectInput
                label="Fase Ideal"
                name="ideal_tide_type"
                value={preferences.ideal_tide_type}
                onChange={handleChange}
                options={[
                  { value: 'any', label: 'Qualquer' },
                  { value: 'low', label: 'Seca' },
                  { value: 'high', label: 'Cheia' },
                  { value: 'rising', label: 'Enchendo' },
                  { value: 'falling', label: 'Vazando' }
                ]}
              />
            </Section>

            <Section title="Temperatura">
              <FieldGroup>
                <NumberInput label="Temp. Água Ideal (°C)" name="ideal_water_temperature" value={preferences.ideal_water_temperature} onChange={handleChange} placeholder="22" />
                <NumberInput label="Temp. Ar Ideal (°C)" name="ideal_air_temperature" value={preferences.ideal_air_temperature} onChange={handleChange} placeholder="25" />
              </FieldGroup>
            </Section>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all disabled:bg-slate-600 disabled:cursor-wait"
        >
          {isSubmitting ? 'Salvando! Isso pode demorar um pouco, estamos atualizando suas recomendações.' : 'Salvar Preferências'}
        </button>
      </form>
    </div>
  );
};

export default SpotPreferencesPage;