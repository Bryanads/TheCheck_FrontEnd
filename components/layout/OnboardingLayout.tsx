import React from 'react';

// Ícone de check
const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

// Ícone de seta para voltar
const ArrowLeftIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);


interface OnboardingLayoutProps {
  title: string;
  step: string; // Ex: "Passo 1 de 3"
  children: React.ReactNode;
  onBack?: () => void; // Prop opcional para a função de voltar
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ title, step, children, onBack }) => {
    const match = step.match(/(\d+)\s*de\s*(\d+)/);
    const currentStep = match ? parseInt(match[1], 10) : 0;
    const totalSteps = match ? parseInt(match[2], 10) : 0;
    
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    return (
        <div className="max-w-3xl mx-auto px-4">
            {/* Cabeçalho com Título e Botão Voltar */}
            <div className="relative text-center mb-10 h-16 flex flex-col justify-center items-center">
                 {/* Botão Voltar com Posicionamento Absoluto */}
                {onBack && currentStep > 1 && (
                    <button
                        onClick={onBack}
                        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium">Voltar</span>
                    </button>
                )}
                
                <h1 className="text-4xl font-bold text-white">{title}</h1>
                <p className="text-cyan-400 font-medium">{step}</p>
            </div>
            
            {/* Indicador de Passos Visual */}
            <div className="flex items-center mb-12">
                {steps.map((stepNumber, index) => {
                    const isCompleted = currentStep > stepNumber;
                    const isActive = currentStep === stepNumber;
                    
                    return (
                        <React.Fragment key={stepNumber}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                        transition-all duration-300
                                        ${isCompleted ? 'bg-cyan-500 text-white' : ''}
                                        ${isActive ? 'bg-cyan-500 ring-4 ring-cyan-500/30 text-white' : ''}
                                        ${!isCompleted && !isActive ? 'bg-slate-700 text-slate-400' : ''}
                                    `}
                                >
                                    {isCompleted ? <CheckIcon className="w-5 h-5" /> : stepNumber}
                                </div>
                            </div>
                            
                            {index < steps.length - 1 && (
                                <div className={`
                                    flex-1 h-1 transition-all duration-300
                                    ${currentStep > stepNumber ? 'bg-cyan-500' : 'bg-slate-700'}
                                `}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            
            <div className="bg-slate-800 rounded-xl p-8 shadow-2xl shadow-cyan-500/10">
                {children}
            </div>
        </div>
    );
};