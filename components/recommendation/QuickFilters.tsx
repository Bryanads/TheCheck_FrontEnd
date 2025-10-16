// src/components/recommendation/QuickFilters.tsx
import React from 'react';

// Exportando o tipo para que a página pai saiba quais são as opções
export type QuickFilterOption = 'today' | 'tomorrow' | string;

interface QuickFiltersProps {
  activeFilter: QuickFilterOption;
  onFilterChange: (filter: QuickFilterOption) => void;
  defaultPresetName: string | null;
  loading: boolean;
}

const FilterButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled: boolean;
}> = ({ label, isActive, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            px-4 py-2 text-sm font-bold rounded-full transition-colors
            ${isActive ? 'bg-cyan-500 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}
            disabled:opacity-50 disabled:cursor-not-allowed
        `}
    >
        {label}
    </button>
);

export const QuickFilters: React.FC<QuickFiltersProps> = ({ activeFilter, onFilterChange, defaultPresetName, loading }) => {
    return (
        <div className="flex items-center justify-center space-x-2 my-8">
            <FilterButton label="Hoje" isActive={activeFilter === 'today'} onClick={() => onFilterChange('today')} disabled={loading} />
            <FilterButton label="Amanhã" isActive={activeFilter === 'tomorrow'} onClick={() => onFilterChange('tomorrow')} disabled={loading} />
            {defaultPresetName && (
                <FilterButton
                    label={defaultPresetName}
                    isActive={activeFilter === defaultPresetName}
                    onClick={() => onFilterChange(defaultPresetName)}
                    disabled={loading}
                />
            )}
        </div>
    );
};