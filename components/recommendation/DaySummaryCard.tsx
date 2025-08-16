import React from 'react';
import { DayOffsetRecommendations } from '../../types';
import { ClockIcon, ChevronDownIcon } from '../icons'; 

interface DaySummaryCardProps {
    dayRec: DayOffsetRecommendations;
    onExpand: () => void;
    isExpanded: boolean;
}

const getRatingDetails = (score: number): { text: string; color: string } => {
    if (score > 90) return { text: 'Clássico', color: 'text-cyan-400' };
    if (score > 80) return { text: 'Muito Bom', color: 'text-green-400' };
    if (score > 75) return { text: 'Bom', color: 'text-emerald-500' };
    if (score > 40) return { text: 'Surfável', color: 'text-yellow-500' };
    if (score > 0) return { text: 'Ruim', color: 'text-orange-500' };
    return { text: 'Muito Ruim', color: 'text-red-500' };
};

export const DaySummaryCard: React.FC<DaySummaryCardProps> = ({ dayRec, onExpand, isExpanded }) => {
    const calculateAverageScore = () => {
        if (dayRec.recommendations.length === 0) return 0;
        const totalScore = dayRec.recommendations.reduce((acc, rec) => acc + rec.suitability_score, 0);
        return totalScore / dayRec.recommendations.length;
    };
    
    const getSurfableHours = () => {
        if (dayRec.recommendations.length === 0) return null;
        const sortedRecs = [...dayRec.recommendations].sort((a, b) => new Date(a.timestamp_utc).getTime() - new Date(b.timestamp_utc).getTime());
        const startTime = new Date(sortedRecs[0].timestamp_utc).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(sortedRecs[sortedRecs.length - 1].timestamp_utc).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return startTime === endTime ? `Às ${startTime}` : `Das ${startTime} às ${endTime}`;
    };

    const averageScore = calculateAverageScore();
    const rating = getRatingDetails(averageScore);
    const surfableHours = getSurfableHours();
    const dayDate = new Date(dayRec.recommendations[0]?.timestamp_utc || Date.now());

    return (
        <div 
            onClick={onExpand}
            className="bg-slate-800/70 rounded-lg p-4 flex justify-between items-center shadow-md cursor-pointer hover:bg-slate-700/90 transition-colors duration-200"
        >
            <div className='flex-1'>
                <h3 className="text-lg font-semibold text-cyan-400">
                    {dayDate.toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                {surfableHours && (
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                        <ClockIcon className="w-4 h-4 mr-1.5" />
                        <span>{surfableHours}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-4">
                {dayRec.recommendations.length > 0 ? (
                    <span className={`text-xl font-bold ${rating.color}`}>{rating.text}</span>
                ) : (
                    <span className="text-lg font-medium text-slate-400">Sem Condições</span>
                )}
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
        </div>
    );
};