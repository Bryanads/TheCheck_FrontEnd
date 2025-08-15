import React from 'react';

interface OnboardingLayoutProps {
  title: string;
  step: string;
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ title, step, children }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
      <p className="text-slate-400 mb-8">{step}</p>
      <div className="bg-slate-800 rounded-xl p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
};