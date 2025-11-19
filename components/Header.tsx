
import React from 'react';
import { Moon, Sun, History, Key } from 'lucide-react';

interface HeaderProps {
  toggleHistory: () => void;
  toggleTheme: () => void;
  onOpenApiKeyModal: () => void;
  isDark: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleHistory, toggleTheme, onOpenApiKeyModal, isDark }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3 cursor-default select-none">
          <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            {/* Custom OmniRead Logo: Circle (Omni) + Lines (Read) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.5" />
              <path d="M9 12h6" />
              <path d="M9 8h6" />
              <path d="M9 16h4" />
            </svg>
          </div>
          <span className="hidden sm:inline text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Omni<span className="text-blue-600">Read</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
           <button
            onClick={onOpenApiKeyModal}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
            aria-label="API Key Settings"
            title="Configurer la clé API"
          >
            <Key size={20} />
          </button>

          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button
            onClick={toggleHistory}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            <History size={18} />
            <span className="hidden sm:inline">Historique</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
