
import React, { useState } from 'react';
import { Key, ExternalLink, Check, AlertCircle, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  hasKey: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, hasKey }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (trimmed.length < 10) {
      setError('La clé semble invalide (trop courte).');
      return;
    }
    onSave(trimmed);
    setInputKey('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={hasKey ? onClose : undefined} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
           <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 mx-auto">
              <Key size={24} />
           </div>
           <h2 className="text-xl font-bold text-center text-zinc-900 dark:text-white">
             Configuration requise
           </h2>
           <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-2">
             Pour utiliser OmniRead gratuitement et en illimité, vous devez utiliser votre propre clé API Gemini.
           </p>
        </div>

        <div className="p-6 space-y-6">
           <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 items-start">
                 <ShieldCheck className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" size={18} />
                 <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    Votre clé est stockée uniquement dans le <strong>stockage local</strong> de votre navigateur. Elle n'est jamais envoyée à nos serveurs.
                 </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Clé API Gemini
                  </label>
                  <input 
                    type="password" 
                    value={inputKey}
                    onChange={(e) => { setInputKey(e.target.value); setError(''); }}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                    autoFocus
                  />
                  {error && (
                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {error}
                    </p>
                  )}
                </div>
                
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Check size={18} />
                  Sauvegarder la clé
                </button>
              </form>
           </div>

           <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Obtenir une clé gratuite sur Google AI Studio
                <ExternalLink size={12} />
              </a>
           </div>
        </div>

        {hasKey && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  );
};

export default ApiKeyModal;
