// src/components/recommendation/DashboardHighlight.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { SpotDailySummary } from '../../types';
import { degreesToCardinal } from '../../utils/utils';
import { ScoreGauge } from './ScoreGauge';
import { WaveIcon, WindIcon, ChartBarIcon } from '../icons';

interface DashboardHighlightProps {
  topRecommendation: SpotDailySummary | null;
}

const HighlightDetail: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => (
    <div className="flex flex-col items-center text-center">
        <div className="text-cyan-400 w-8 h-8 mb-1">{icon}</div>
        <p className="font-bold text-lg text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
    </div>
);

export const DashboardHighlight: React.FC<DashboardHighlightProps> = ({ topRecommendation }) => {
    if (!topRecommendation) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-8 text-center">
                <h2 className="text-xl font-bold text-white">Nenhuma onda encontrada</h2>
                <p className="text-slate-400 mt-2">Tente ajustar seus filtros para encontrar boas recomendações para este período.</p>
            </div>
        );
    }

    const { spot_name, best_hour_utc, best_overall_score, forecast_conditions: cond, spot_id } = topRecommendation;
    const bestTime = new Date(best_hour_utc).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl shadow-cyan-500/10 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Score e Info Principal */}
                <div className="flex-1 text-center md:text-left">
                    <p className="text-sm font-semibold text-cyan-400">A MELHOR ONDA</p>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mt-1">{spot_name}</h2>
                    <p className="text-xl font-medium text-slate-300">às {bestTime}</p>
                </div>

                {/* Gauge */}
                <div className="flex-shrink-0">
                    <ScoreGauge score={best_overall_score} />
                </div>

                {/* Detalhes e CTA */}
                <div className="flex-1 flex flex-col items-center md:items-end">
                     <div className="flex items-center justify-center gap-6 md:gap-8 mb-4">
                        <HighlightDetail
                            icon={<WaveIcon />}
                            value={`${cond.swell_height_sg?.toFixed(1)}m`}
                            label={`${cond.swell_period_sg?.toFixed(0)}s ${degreesToCardinal(cond.swell_direction_sg ?? 0)}`}
                        />
                         <HighlightDetail
                            icon={<WindIcon />}
                            value={`${cond.wind_speed_sg?.toFixed(1)}m/s`}
                            label={degreesToCardinal(cond.wind_direction_sg ?? 0)}
                        />
                        <HighlightDetail
                            icon={<ChartBarIcon />}
                            value={`${cond.sea_level_sg?.toFixed(2)}m`}
                            label={cond.tide_type || ''}
                        />
                    </div>
                    <Link
                        to={`/forecasts/${spot_id}`}
                        state={{ highlightedTimestamp: best_hour_utc }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-colors"
                    >
                        Ver previsão completa →
                    </Link>
                </div>
            </div>
        </div>
    );
};