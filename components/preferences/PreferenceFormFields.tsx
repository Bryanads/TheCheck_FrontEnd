import React from 'react';
import { SpotPreferences } from '../../types';

// --- Componentes de UI reutilizáveis ---

export const NumberInput: React.FC<{
  label: string;
  name: keyof SpotPreferences;
  value?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
  placeholder?: string;
  // NOVA PROPRIEDADE: para receber o estado de erro
  hasError?: boolean;
}> = ({ label, name, value, onChange, step = '0.1', placeholder, hasError }) => (
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
      // LÓGICA DE CLASSE ATUALIZADA: adiciona a borda vermelha se hasError for verdadeiro
      className={`w-full mt-1 p-2 bg-slate-700 rounded border transition-colors
                   ${hasError 
                      ? 'border-red-500 ring-2 ring-red-500/50' 
                      : 'border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none'
                   }`}
    />
  </div>
);

export const SelectInput: React.FC<{
  label: string;
  name: keyof SpotPreferences;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}> = ({ label, name, value, onChange, options }) => (
  // O SelectInput permanece o mesmo, pois geralmente tem um valor padrão
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

export const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4 p-4 border border-slate-700 rounded-lg">
    <h2 className="text-xl font-semibold text-cyan-400">{title}</h2>
    {children}
  </div>
);

export const FieldGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
);

// --- Componente principal do formulário ---

interface PreferenceFormSectionsProps {
    preferences: Partial<SpotPreferences>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    // NOVA PROPRIEDADE: para passar o objeto de erros
    errors: Partial<Record<keyof SpotPreferences, boolean>>;
}

// ATENÇÃO: Adicionamos a propriedade `errors` aqui
export const PreferenceFormSections: React.FC<PreferenceFormSectionsProps> = ({ preferences, handleChange, errors }) => (
    <>
        {/*
          Para cada NumberInput, adicionamos a propriedade `hasError`.
          A lógica `!!errors.nome_do_campo` converte o valor para booleano:
          - Se `errors.min_wave_height` for `true`, `hasError` será `true`.
          - Se for `undefined` ou `false`, `hasError` será `false`.
        */}
        <Section title="Onda">
          <FieldGroup>
            <NumberInput label="Altura Min. (m)" name="min_wave_height" value={preferences.min_wave_height} onChange={handleChange} placeholder="0.5" hasError={!!errors.min_wave_height} />
            <NumberInput label="Altura Máx. (m)" name="max_wave_height" value={preferences.max_wave_height} onChange={handleChange} placeholder="2.5" hasError={!!errors.max_wave_height} />
            <NumberInput label="Altura Ideal (m)" name="ideal_wave_height" value={preferences.ideal_wave_height} onChange={handleChange} placeholder="1.5" hasError={!!errors.ideal_wave_height} />
          </FieldGroup>
          <FieldGroup>
            <NumberInput label="Período Min. (s)" name="min_wave_period" value={preferences.min_wave_period} onChange={handleChange} placeholder="5" hasError={!!errors.min_wave_period} />
            <NumberInput label="Período Máx. (s)" name="max_wave_period" value={preferences.max_wave_period} onChange={handleChange} placeholder="16" hasError={!!errors.max_wave_period} />
            <NumberInput label="Período Ideal (s)" name="ideal_wave_period" value={preferences.ideal_wave_period} onChange={handleChange} placeholder="10" hasError={!!errors.ideal_wave_period} />
          </FieldGroup>
          <SelectInput
            label="Direção Preferida"
            name="preferred_wave_direction"
            value={preferences.preferred_wave_direction}
            onChange={handleChange}
            options={[{ value: '', label: 'Qualquer' }, ...['N','NE','E','SE','S','SW','W','NW'].map(d => ({ value: d, label: d }))]}
          />
        </Section>

        {/* ... Repita a adição de `hasError` para os outros NumberInputs ... */}

        <Section title="Swell">
          <FieldGroup>
            <NumberInput label="Altura Min. (m)" name="min_swell_height" value={preferences.min_swell_height} onChange={handleChange} placeholder="0.5" hasError={!!errors.min_swell_height} />
            <NumberInput label="Altura Máx. (m)" name="max_swell_height" value={preferences.max_swell_height} onChange={handleChange} placeholder="3.0" hasError={!!errors.max_swell_height} />
            <NumberInput label="Altura Ideal (m)" name="ideal_swell_height" value={preferences.ideal_swell_height} onChange={handleChange} placeholder="1.8" hasError={!!errors.ideal_swell_height} />
          </FieldGroup>
          <FieldGroup>
            <NumberInput label="Período Min. (s)" name="min_swell_period" value={preferences.min_swell_period} onChange={handleChange} placeholder="7" hasError={!!errors.min_swell_period} />
            <NumberInput label="Período Máx. (s)" name="max_swell_period" value={preferences.max_swell_period} onChange={handleChange} placeholder="18" hasError={!!errors.max_swell_period} />
            <NumberInput label="Período Ideal (s)" name="ideal_swell_period" value={preferences.ideal_swell_period} onChange={handleChange} placeholder="12" hasError={!!errors.ideal_swell_period} />
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
            <NumberInput label="Veloc. Min. (m/s)" name="min_wind_speed" value={preferences.min_wind_speed} onChange={handleChange} placeholder="0" hasError={!!errors.min_wind_speed} />
            <NumberInput label="Veloc. Máx. (m/s)" name="max_wind_speed" value={preferences.max_wind_speed} onChange={handleChange} placeholder="8" hasError={!!errors.max_wind_speed} />
            <NumberInput label="Veloc. Ideal (m/s)" name="ideal_wind_speed" value={preferences.ideal_wind_speed} onChange={handleChange} placeholder="2" hasError={!!errors.ideal_wind_speed} />
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
            <NumberInput label="Nível Min. (m)" name="min_sea_level" value={preferences.min_sea_level} onChange={handleChange} placeholder="0.2" hasError={!!errors.min_sea_level} />
            <NumberInput label="Nível Máx. (m)" name="max_sea_level" value={preferences.max_sea_level} onChange={handleChange} placeholder="1.5" hasError={!!errors.max_sea_level} />
            <NumberInput label="Nível Ideal (m)" name="ideal_sea_level" value={preferences.ideal_sea_level} onChange={handleChange} placeholder="0.8" hasError={!!errors.ideal_sea_level} />
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
            <NumberInput label="Temp. Água Ideal (°C)" name="ideal_water_temperature" value={preferences.ideal_water_temperature} onChange={handleChange} placeholder="22" hasError={!!errors.ideal_water_temperature} />
            <NumberInput label="Temp. Ar Ideal (°C)" name="ideal_air_temperature" value={preferences.ideal_air_temperature} onChange={handleChange} placeholder="25" hasError={!!errors.ideal_air_temperature} />
          </FieldGroup>
        </Section>
    </>
);