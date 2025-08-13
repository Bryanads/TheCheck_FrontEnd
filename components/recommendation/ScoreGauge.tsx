import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ScoreGaugeProps {
    score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
    const getScoreColor = (s: number) => {
        if (s > 75) return '#22c55e'; // green-500
        if (s > 50) return '#eab308'; // yellow-500
        return '#ef4444'; // red-500
    };
    const data = [{ name: 'score', value: score }];

    return (
        <div className="w-24 h-24 relative">
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
                        background
                        dataKey="value"
                        cornerRadius={10}
                        fill={getScoreColor(score)}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{color: getScoreColor(score)}}>{Math.round(score)}</span>
            </div>
        </div>
    );
};