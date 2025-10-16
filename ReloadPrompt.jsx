// src/ReloadPrompt.tsx
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { XIcon } from './components/icons'; // Usaremos o ícone 'X' que você já tem

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Opcional: log para debug
      console.log('Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.error('Erro no registro do Service Worker:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  // Se uma nova versão está disponível, mostra este pop-up
  if (needRefresh) {
    return (
      <div className="fixed right-0 bottom-24 z-50 p-4 m-4 rounded-lg shadow-2xl bg-slate-800 border border-slate-700 animate-fade-in">
        <div className="flex items-start">
          <div className="ml-3 w-0 flex-1">
            <p className="text-base font-medium text-white">
              Nova versão disponível!
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Recarregue para ver as últimas atualizações.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
             <button
              type="button"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none"
              onClick={() => updateServiceWorker(true)}
            >
              Recarregar
            </button>
            <button
              type="button"
              className="ml-2 p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none"
              onClick={() => close()}
            >
              <XIcon />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se o app está pronto para ser usado offline, mostra esta mensagem temporariamente
  if (offlineReady) {
      return (
         <div className="fixed right-0 bottom-24 z-50 p-4 m-4 rounded-lg shadow-2xl bg-slate-800 border border-slate-700 animate-fade-in">
             <p className="text-white font-medium">App pronto para funcionar offline!</p>
         </div>
      )
  }

  return null;
}

export default ReloadPrompt;