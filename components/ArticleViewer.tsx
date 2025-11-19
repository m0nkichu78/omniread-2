
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, Copy, Type, FileText, Check, Volume2, Settings2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ArticleData, AudioState } from '../types';
import { audioBufferToWav } from '../services/audioUtils';

interface ArticleViewerProps {
  article: ArticleData;
  audioState: AudioState;
  onPlayAudio: () => void;
  onSeek: (time: number) => void;
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({ article, audioState, onPlayAudio, onSeek }) => {
  const [fontSize, setFontSize] = useState(2); // 1..4
  const [highContrast, setHighContrast] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Audio visualization refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Simple visualization effect
  useEffect(() => {
     if (audioState.isPlaying && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        
        const draw = () => {
           ctx.clearRect(0, 0, canvas.width, canvas.height);
           // Clearer visualizer
           const bars = 5;
           const barWidth = (canvas.width / bars) - 2;
           
           for(let i=0; i<bars; i++) {
             const height = Math.random() * canvas.height * 0.8;
             ctx.fillStyle = highContrast ? '#000000' : '#3b82f6';
             // Use rounded bars if possible, or just rects
             ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);
           }
           animationRef.current = requestAnimationFrame(draw);
        }
        draw();
     } else {
         if(animationRef.current) cancelAnimationFrame(animationRef.current);
     }
     return () => {
         if(animationRef.current) cancelAnimationFrame(animationRef.current);
     }
  }, [audioState.isPlaying, highContrast]);


  const handleCopy = () => {
    navigator.clipboard.writeText(`${article.translatedTitle}\n\n${article.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([`${article.translatedTitle}\n\n${article.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.translatedTitle.slice(0, 20)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudio = () => {
    if (!audioState.audioBuffer) return;
    const wavBlob = audioBufferToWav(audioState.audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.translatedTitle.slice(0, 20)}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Font size classes
  const fontSizeClasses = ['text-sm', 'text-base', 'text-lg', 'text-xl'];
  
  return (
    <div className={`max-w-4xl mx-auto pb-20 transition-all duration-300 ${highContrast ? 'contrast-more' : ''}`}>
      
      {/* Toolbar */}
      <div className="sticky top-20 z-30 mb-8 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col gap-4">
         
         <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
                <button 
                  onClick={onPlayAudio}
                  disabled={audioState.isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                  aria-label={audioState.isPlaying ? "Pause" : "Play"}
                >
                  {audioState.isLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : audioState.isPlaying ? (
                      <Pause size={18} fill="currentColor" />
                  ) : (
                      <Play size={18} fill="currentColor" />
                  )}
                  <span className="hidden sm:inline font-bold">{audioState.isPlaying ? "Pause" : "Écouter"}</span>
                </button>
                
                {audioState.isPlaying && (
                    <canvas ref={canvasRef} width={40} height={24} className="opacity-70 hidden xs:block" />
                )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={() => setFontSize(prev => Math.max(0, prev - 1))} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400" aria-label="Decrease font size">
                    <Type size={14} />
                </button>
                <button onClick={() => setFontSize(prev => Math.min(3, prev + 1))} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400" aria-label="Increase font size">
                    <Type size={20} />
                </button>
                
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                <button onClick={() => setHighContrast(!highContrast)} className={`p-2 rounded-md transition-colors ${highContrast ? 'bg-yellow-400 text-black shadow-sm' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`} aria-label="High Contrast">
                    <Settings2 size={18} />
                </button>

                <button onClick={handleCopy} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 transition-colors">
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
                
                <button onClick={handleDownloadTxt} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 transition-colors">
                    <FileText size={18} />
                </button>
                
                {audioState.audioBuffer && (
                    <button onClick={handleDownloadAudio} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 transition-colors">
                        <Volume2 size={18} />
                    </button>
                )}
            </div>
         </div>

         {/* Audio Timeline */}
         {audioState.duration > 0 && (
             <div className="flex items-center gap-3 px-1 pb-1 animate-in fade-in slide-in-from-top-1">
                 <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 min-w-[35px]">
                    {formatTime(audioState.currentTime)}
                 </span>
                 <div className="relative flex-1 h-6 flex items-center group">
                    <input
                        type="range"
                        min={0}
                        max={audioState.duration}
                        value={audioState.currentTime}
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className="absolute w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        style={{
                             background: `linear-gradient(to right, #2563eb ${(audioState.currentTime / audioState.duration) * 100}%, transparent ${(audioState.currentTime / audioState.duration) * 100}%)`
                        }}
                    />
                 </div>
                 <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 min-w-[35px] text-right">
                    {formatTime(audioState.duration)}
                 </span>
             </div>
         )}
      </div>

      {/* Content */}
      <article className={`bg-white dark:bg-zinc-900 p-6 md:p-12 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 ${highContrast ? 'grayscale contrast-125' : ''}`}>
         <div className="mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
             <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-mono font-medium">
                    {article.language.toUpperCase()}
                </span>
                <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono font-medium">
                    {article.readingTime} MIN READ
                </span>
                {article.url !== 'Raw Text' && (
                    <a href={article.url} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-blue-600 dark:text-zinc-400 transition-colors text-xs font-mono font-medium flex items-center gap-1">
                        SOURCE <span className="text-[10px]">↗</span>
                    </a>
                )}
             </div>
             <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4 leading-tight">
                 {article.translatedTitle}
             </h1>
             <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border-l-4 border-blue-500">
                 <p className="font-medium text-zinc-700 dark:text-zinc-300 italic">
                     "{article.summary}"
                 </p>
             </div>
         </div>

         <div className={`prose prose-zinc dark:prose-invert max-w-none ${fontSizeClasses[fontSize]} leading-relaxed`}>
             <ReactMarkdown
                components={{
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 text-zinc-900 dark:text-zinc-100" {...props} />,
                    p: ({node, ...props}) => <p className="mb-6 text-zinc-700 dark:text-zinc-300" {...props} />,
                    li: ({node, ...props}) => <li className="mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-zinc-900 dark:text-white" {...props} />,
                }}
             >
                {article.content}
             </ReactMarkdown>
         </div>
      </article>
    </div>
  );
};

export default ArticleViewer;
