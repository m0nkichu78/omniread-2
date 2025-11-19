import React, { useState } from 'react';
import { ArrowRight, Settings2, Loader2, FileText, Sparkles } from 'lucide-react';
import { AppSettings, ProcessingStatus } from '../types';
import { LANGUAGES, TONES } from '../constants';

interface InputSectionProps {
  onProcess: (url: string, settings: AppSettings) => void;
  status: ProcessingStatus;
}

const InputSection: React.FC<InputSectionProps> = ({ onProcess, status }) => {
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    fontSize: 2,
    lineHeight: 1.75,
    highContrast: false,
    targetLanguage: 'fr',
    tone: 'neutral',
    mode: 'full'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onProcess(input, settings);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
          Lecture sans distraction
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Collez une URL ou un texte. OmniRead traduit, résume et génère l'audio automatiquement.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        
        {/* Mode Selection */}
        <div className="flex justify-center gap-4 mb-2">
          <button
            type="button"
            onClick={() => setSettings({ ...settings, mode: 'full' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              settings.mode === 'full'
                ? 'bg-white dark:bg-zinc-800 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-blue-500'
                : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FileText size={16} />
            Article Complet
          </button>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, mode: 'summary' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              settings.mode === 'summary'
                ? 'bg-white dark:bg-zinc-800 border-purple-500 text-purple-600 dark:text-purple-400 shadow-md ring-1 ring-purple-500'
                : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles size={16} />
            Résumé Détaillé
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-zinc-200/50 dark:shadow-black/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/article ou collez le texte ici..."
            className="flex-1 bg-transparent border-none px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-0 outline-none"
          />
          
          <div className="flex items-center gap-2 px-2 sm:px-0">
             <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              <Settings2 size={20} />
            </button>

            <button
              type="submit"
              disabled={status === ProcessingStatus.LOADING || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[120px] justify-center"
            >
              {status === ProcessingStatus.LOADING ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Traiter</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Settings Dropdown */}
        {showSettings && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                Langue Cible
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSettings({ ...settings, targetLanguage: lang.code })}
                    className={`px-3 py-2 text-sm rounded-md text-left transition-colors border ${
                      settings.targetLanguage === lang.code
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                Ton de traduction
              </label>
              <div className="flex flex-col gap-1">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, tone: tone.id as any })}
                    className={`px-3 py-2 text-sm rounded-md text-left transition-colors border ${
                      settings.tone === tone.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {tone.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default InputSection;