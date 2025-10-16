// src/components/recommendation/RecommendationView.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DailyRecommendation, SpotDailySummary } from '../../types';
import { degreesToCardinal } from '../../utils/utils';
import { WaveIcon, WindIcon, ChartBarIcon, ChevronDownIcon } from '../icons';
import { ScoreGauge } from './ScoreGauge'; 

// Componente para o resumo expandido que aparece ao clicar
const ExpandedDetails: React.FC<{ spot: SpotDailySummary }> = ({ spot }) => {
    const { forecast_conditions: cond, detailed_scores: scores } = spot;
    return (
        <div className="bg-slate-900/50 p-4 rounded-b-lg animate-fade-in text-sm space-y-2">
            <div className="flex justify-between items-center">
                <span className="flex items-center text-slate-300"><WaveIcon className="w-4 h-4 mr-2 text-cyan-400"/> Onda</span>
                <span className="text-slate-200">{cond.swell_height_sg?.toFixed(1)}m {degreesToCardinal(cond.swell_direction_sg ?? 0)} {cond.swell_period_sg?.toFixed(0)}s <span className="font-bold text-white">({scores.wave_score.toFixed(0)})</span></span>
            </div>
            <div className="flex justify-between items-center">
                <span className="flex items-center text-slate-300"><WindIcon className="w-4 h-4 mr-2 text-cyan-400"/> Vento</span>
                <span className="text-slate-200">{cond.wind_speed_sg?.toFixed(1)} m/s {degreesToCardinal(cond.wind_direction_sg ?? 0)} <span className="font-bold text-white">({scores.wind_score.toFixed(0)})</span></span>
            </div>
            <div className="flex justify-between items-center">
                <span className="flex items-center text-slate-300"><ChartBarIcon className="w-4 h-4 mr-2 text-cyan-400"/> Maré</span>
                <span className="text-slate-200">{cond.sea_level_sg?.toFixed(2)}m ({cond.tide_type}) <span className="font-bold text-white">({scores.tide_score.toFixed(0)})</span></span>
            </div>
            <div className="text-right mt-3">
                <Link
                    to={`/forecasts/${spot.spot_id}`}
                    state={{ highlightedTimestamp: spot.best_hour_utc }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs"
                >
                    Ver previsão completa →
                </Link>
            </div>
        </div>
    );
};

// Componente para a linha clicável de cada pico
const SpotRow: React.FC<{ spot: SpotDailySummary }> = ({ spot }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // 2. A função getRatingDetails e a variável 'rating' não são mais necessárias
    const bestTime = new Date(spot.best_hour_utc).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700/60 cursor-pointer transition-colors ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'}`}
            >
                <div className="flex items-center">
                    <ChevronDownIcon className={`w-5 h-5 mr-3 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    <span className="font-bold text-white">{spot.spot_name}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-300">{bestTime}</span>
                    {/* 3. Substitua o texto pelo ScoreGauge, controlando o tamanho aqui */}
                    <div className="w-12 h-12">
                        <ScoreGauge score={spot.best_overall_score} />
                    </div>
                </div>
            </div>
            {isExpanded && <ExpandedDetails spot={spot} />}
        </div>
    );
};

interface RecommendationViewProps {
    dailyRecommendations: DailyRecommendation[];
    loading: boolean;
    error: any;
}

// Componente principal que organiza a visualização por dia
export const RecommendationView: React.FC<RecommendationViewProps> = ({ dailyRecommendations, loading, error }) => {
    if (loading) {
        return <div className="text-center p-10"><div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 text-slate-300">Procurando as melhores ondas...</p></div>;
    }
    if (error) {
        return <p className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center">{error.message || "Ocorreu um erro ao buscar recomendações."}</p>;
    }
    if (!dailyRecommendations || dailyRecommendations.length === 0) {
        return <div className="text-center p-10 bg-slate-800/50 rounded-xl"><WaveIcon className="w-12 h-12 mx-auto text-slate-500" /><h3 className="mt-4 text-xl font-bold text-white">Nenhuma onda encontrada</h3><p className="text-slate-400">Tente ajustar seus filtros para encontrar boas recomendações.</p></div>;
    }

    return (
        <div className="space-y-6">
            {dailyRecommendations.map(day => (
                (day.ranked_spots && day.ranked_spots.length > 0) && (
                    <div key={day.date}>
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {new Date(day.date + 'T12:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </h2>
                        <div className="space-y-2">
                            {day.ranked_spots.map(spot => <SpotRow key={spot.spot_id} spot={spot} />)}
                        </div>
                    </div>
                )
            ))}
        </div>
    );
};