// src/components/recommendation/ScoreGauge.tsx
import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ScoreGaugeProps {
    score: number;
    className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, className }) => {
    const getScoreColor = (s: number) => {
        if (s > 80) return '#22d3ee'; // text-cyan-400 for 'Ótimo'
        if (s > 65) return '#4ade80'; // text-green-400 for 'Bom'
        if (s > 40) return '#eab308'; // text-yellow-500 for 'Surfável'
        return '#f87171'; // text-red-400 for 'Ruim'
    };
    const data = [{ name: 'score', value: score }];

    return (
        <div className={`w-full h-full relative ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={data}
                    startAngle={90}
                    endAngle={-270}
                >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                        background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        dataKey="value"
                        cornerRadius={10}
                        fill={getScoreColor(score)}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{color: getScoreColor(score)}}>{Math.round(score)}</span>
            </div>
        </div>
    );
};