import React from 'react';
import { X, Clock, Trash2, ChevronRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (id: string) => void;
  onClear: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-80 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Historique
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 ? (
              <div className="text-center text-zinc-500 py-10">
                <p>Aucun article récent.</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); onClose(); }}
                  className="w-full text-left p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all group"
                >
                  <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                    {item.summary}
                  </p>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                     </span>
                     <ChevronRight size={14} className="text-zinc-300 group-hover:text-blue-500" />
                  </div>
                </button>
              ))
            )}
          </div>

          {history.length > 0 && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <button
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Effacer l'historique
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
