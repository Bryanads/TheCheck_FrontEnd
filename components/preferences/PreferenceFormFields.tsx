// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/components/preferences/PreferenceFormFields.tsx
import React from 'react';
import { PreferenceUpdate } from '../../types';

// Componentes de UI reutilizáveis
const NumberInput: React.FC<{
  label: string;
  name: keyof PreferenceUpdate;
  value?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}> = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300">{label}</label>
    <input
      type="number"
      step="0.1"
      name={name}
      id={name}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full mt-1 p-2 bg-slate-700 rounded border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
    />
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4 p-4 border border-slate-700 rounded-lg">
    <h2 className="text-xl font-semibold text-cyan-400">{title}</h2>
    {children}
  </div>
);

const FieldGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

// --- Componente principal do formulário ---
interface PreferenceFormSectionsProps {
    preferences: Partial<PreferenceUpdate>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const PreferenceFormSections: React.FC<PreferenceFormSectionsProps> = ({ preferences, handleChange }) => (
    <>
        <Section title="Swell">
          <FieldGroup>
            <NumberInput label="Altura Ideal (m)" name="ideal_swell_height" value={preferences.ideal_swell_height} onChange={handleChange} placeholder="1.8" />
            <NumberInput label="Altura Máx. (m)" name="max_swell_height" value={preferences.max_swell_height} onChange={handleChange} placeholder="3.0" />
          </FieldGroup>
        </Section>

        <Section title="Vento">
            <NumberInput label="Velocidade Máx. (m/s)" name="max_wind_speed" value={preferences.max_wind_speed} onChange={handleChange} placeholder="8" />
        </Section>

        <Section title="Temperatura">
          <FieldGroup>
            <NumberInput label="Temp. Água Ideal (°C)" name="ideal_water_temperature" value={preferences.ideal_water_temperature} onChange={handleChange} placeholder="22" />
            <NumberInput label="Temp. Ar Ideal (°C)" name="ideal_air_temperature" value={preferences.ideal_air_temperature} onChange={handleChange} placeholder="25" />
          </FieldGroup>
        </Section>
    </>
);