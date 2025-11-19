
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ArticleViewer from './components/ArticleViewer';
import HistorySidebar from './components/HistorySidebar';
import ApiKeyModal from './components/ApiKeyModal';
import { ArticleData, AppSettings, ProcessingStatus, HistoryItem, AudioState } from './types';
import { processArticleUrl, generateArticleAudio } from './services/geminiService';

function App() {
  // Theme Management
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // API Key Management
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('omniread_gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('omniread_gemini_api_key', key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  // Application State
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({
    audioBuffer: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0
  });

  // Audio Context Ref for playback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem('zen_reader_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (sourceNodeRef.current) sourceNodeRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const handleProcess = async (input: string, settings: AppSettings) => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setStatus(ProcessingStatus.LOADING);
    setError(null);
    stopAudio(false); // Reset audio completely
    setAudioState({
      audioBuffer: null,
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0
    });

    try {
      // Step 1: Process Text
      const data = await processArticleUrl(input, settings, apiKey);
      setArticle(data);
      
      // Update History
      const newItem: HistoryItem = {
        id: data.id,
        title: data.translatedTitle,
        summary: data.summary,
        timestamp: data.timestamp
      };
      
      const newHistory = [newItem, ...history.filter(h => h.id !== data.id)].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('zen_reader_history', JSON.stringify(newHistory));
      
      setStatus(ProcessingStatus.SUCCESS);

      // Step 2: Automatically Trigger Audio Generation
      // We don't await this to allow the UI to show the text immediately
      autoGenerateAudio(data.content, apiKey);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors du traitement.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const autoGenerateAudio = async (text: string, key: string) => {
    setAudioState(prev => ({ ...prev, isLoading: true }));
    try {
      const buffer = await generateArticleAudio(text, key);
      setAudioState(prev => ({ 
        ...prev, 
        audioBuffer: buffer, 
        isLoading: false,
        duration: buffer.duration,
        currentTime: 0 
      }));
    } catch (err) {
      console.error("Auto TTS Error", err);
      setAudioState(prev => ({ ...prev, isLoading: false }));
      // We don't alert here to avoid disturbing the user reading experience if audio fails silently
    }
  };

  const handleAudioPlay = async () => {
    if (!article) return;
    
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }

    // Case 1: Playing -> Pause
    if (audioState.isPlaying) {
      stopAudio(true); // true = pause
      return;
    }

    // Case 2: Paused (Resuming) or Stopped
    if (audioState.audioBuffer) {
      playAudio(audioState.audioBuffer, pauseTimeRef.current);
      return;
    }

    // Case 3: No Buffer (Manual retry if auto-gen failed or wasn't triggered)
    setAudioState(prev => ({ ...prev, isLoading: true }));
    try {
      const buffer = await generateArticleAudio(article.content, apiKey);
      setAudioState(prev => ({ 
        ...prev, 
        audioBuffer: buffer, 
        isLoading: false,
        duration: buffer.duration,
        currentTime: 0 
      }));
      playAudio(buffer, 0);
    } catch (err) {
      console.error("TTS Error", err);
      setAudioState(prev => ({ ...prev, isLoading: false }));
      alert("Impossible de générer l'audio pour cet article. Vérifiez votre clé API.");
    }
  };

  const playAudio = (buffer: AudioBuffer, offset: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    // Recreate source node
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    
    source.onended = () => {
       // We rely on RAF to detect end of duration for UI consistency
    };
    
    source.start(0, offset);
    sourceNodeRef.current = source;
    startTimeRef.current = audioCtxRef.current.currentTime - offset;
    
    setAudioState(prev => ({ ...prev, isPlaying: true }));
    startTimer(buffer.duration);
  };

  const startTimer = (duration: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    const update = () => {
      if (!audioCtxRef.current) return;
      
      const now = audioCtxRef.current.currentTime - startTimeRef.current;
      
      if (now >= duration) {
        stopAudio(false); // Natural end
      } else {
        setAudioState(prev => ({ ...prev, currentTime: now }));
        rafRef.current = requestAnimationFrame(update);
      }
    };
    
    rafRef.current = requestAnimationFrame(update);
  };

  const stopAudio = (pause: boolean = false) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }

    if (pause && audioCtxRef.current) {
       // Calculate precise pause time
       pauseTimeRef.current = audioCtxRef.current.currentTime - startTimeRef.current;
       // Ensure we don't exceed duration
       if (audioState.duration && pauseTimeRef.current > audioState.duration) {
         pauseTimeRef.current = 0;
       }
    } else {
       pauseTimeRef.current = 0;
    }

    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      currentTime: pause ? pauseTimeRef.current : 0 
    }));
  };

  const handleSeek = (time: number) => {
    if (!audioState.audioBuffer) return;
    
    const newTime = Math.max(0, Math.min(time, audioState.duration));
    pauseTimeRef.current = newTime;

    if (audioState.isPlaying) {
      // If playing, restart from new position
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {}
      }
      playAudio(audioState.audioBuffer, newTime);
    } else {
      // If paused, just update UI and internal ref
      setAudioState(prev => ({ ...prev, currentTime: newTime }));
    }
  };

  const handleSelectHistory = (id: string) => {
    alert("Fonctionnalité de restauration complète à implémenter avec IndexedDB pour le stockage lourd.");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('zen_reader_history');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 selection:bg-blue-200 dark:selection:bg-blue-900">
      <Header 
        toggleHistory={() => setIsHistoryOpen(true)} 
        toggleTheme={() => setIsDark(!isDark)}
        onOpenApiKeyModal={() => setShowApiKeyModal(true)}
        isDark={isDark}
      />

      <main className="flex-1 relative">
        {article ? (
           <>
             <div className="container mx-auto px-4 py-8">
                <button 
                  onClick={() => { setArticle(null); setStatus(ProcessingStatus.IDLE); stopAudio(false); }}
                  className="mb-4 text-sm font-mono text-zinc-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                >
                  ← NOUVELLE RECHERCHE
                </button>
                <ArticleViewer 
                  article={article} 
                  audioState={audioState}
                  onPlayAudio={handleAudioPlay}
                  onSeek={handleSeek}
                />
             </div>
           </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
             <InputSection onProcess={handleProcess} status={status} />
             
             {status === ProcessingStatus.ERROR && (
               <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg max-w-md text-center animate-in fade-in slide-in-from-bottom-4">
                 <p className="font-semibold">Oups !</p>
                 <p className="text-sm">{error}</p>
               </div>
             )}
          </div>
        )}
      </main>

      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistory}
        onClear={clearHistory}
      />

      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
        hasKey={!!apiKey}
      />
    </div>
  );
}

export default App;