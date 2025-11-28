import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Globe, Sparkles, TrendingUp, Shield, Share2, Download, AlertTriangle, Search, X, Instagram, Youtube, Linkedin, Facebook, Twitter, Smartphone } from 'lucide-react';
import { generateSocialStrategy, huntTrends } from './services/geminiService';
import { Platform, Mode, SocialSEOResult, FilterState, TrendHunterResponse } from './types';
import { PLATFORMS, MODES } from './constants';

// --- Sub-Components ---

const LoadingOverlay: React.FC<{ progress: number; phase: string }> = ({ progress, phase }) => (
  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm rounded-2xl">
    <div className="w-64">
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-indigo-300 font-mono text-sm animate-pulse">{phase}</p>
    </div>
  </div>
);

const FilterInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
    />
  </div>
);

const ResultCard: React.FC<{ result: SocialSEOResult }> = ({ result }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.title || 'Social Strategy',
          text: result.caption,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(result, null, 2)], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "strategy.json";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="relative mt-8 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Vibe Badge */}
      <div className="absolute -top-4 right-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
        {result.sentiment_analysis.vibe_badge}
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="border-b border-slate-700 pb-4">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <TrendingUp size={16} />
            <span className="uppercase text-xs font-bold tracking-widest">{result.platform} Strategy</span>
          </div>
          {result.title && <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{result.title}</h2>}
          <div className="bg-slate-800/50 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="text-xs text-slate-400 uppercase mb-1">The Hook</h3>
            <p className="text-lg font-medium text-white italic">"{result.hook}"</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2">
               <FileText size={16} /> Caption
             </h3>
             <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-light">{result.caption}</p>
             <div className="flex flex-wrap gap-2">
               {result.hashtags.map(tag => (
                 <span key={tag} className="text-indigo-400 text-xs bg-indigo-500/10 px-2 py-1 rounded-md">{tag}</span>
               ))}
             </div>
          </div>
          
          <div className="space-y-6">
             {/* Trend Badge */}
             {result.trend_metadata?.trend_detected && (
               <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                 <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                   <Sparkles size={16} /> Trend Detected
                 </div>
                 <p className="text-emerald-100 text-sm">{result.trend_metadata.trend_name}</p>
                 <p className="text-xs text-slate-400 mt-2">{result.trend_metadata.how_to_apply_trend}</p>
               </div>
             )}

             {/* Spy Insights */}
             {result.competitor_insights && (
               <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                 <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                   <Search size={16} /> Spy Insights
                 </div>
                 <div className="space-y-2 text-xs text-slate-300">
                    <p><strong className="text-slate-400">CTA Strategy:</strong> {result.competitor_insights.cta_strategy}</p>
                    <p><strong className="text-slate-400">Visual Theme:</strong> {result.competitor_insights.visual_theme}</p>
                 </div>
               </div>
             )}

             {/* Strategy Stats */}
             <div className="grid grid-cols-2 gap-3">
               <div className="bg-slate-800/30 p-3 rounded-lg">
                 <p className="text-xs text-slate-500">Format</p>
                 <p className="text-sm font-semibold capitalize">{result.recommended_post_format.replace('_', ' ')}</p>
               </div>
               <div className="bg-slate-800/30 p-3 rounded-lg">
                 <p className="text-xs text-slate-500">Tone</p>
                 <p className="text-sm font-semibold capitalize">{result.sentiment_analysis.overall_tone}</p>
               </div>
             </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t border-slate-700 pt-6 flex flex-wrap gap-4 items-center justify-between">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Share2 size={16} /> Smart Share
            </button>
            <div className="flex items-center gap-2">
               <button className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"><Twitter size={16} /></button>
               <button className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"><Linkedin size={16} /></button>
               <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors border border-slate-700">
                  <Download size={16} /> .TXT
               </button>
            </div>
        </div>

        {/* Brand Guard Notice */}
        {result.brand_guard && (
          <div className={`mt-2 text-xs flex items-center gap-1.5 ${result.brand_guard.brand_safe ? 'text-slate-500' : 'text-red-400'}`}>
            <Shield size={12} />
            {result.brand_guard.brand_safe ? 'Brand Safe Verified' : 'Brand Policy Issues Detected'}
          </div>
        )}

      </div>
    </div>
  );
};

const TrendHunterCard: React.FC<{ idea: any; onUse: (idea: any) => void }> = ({ idea, onUse }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-indigo-500/50 transition-colors group">
    <div className="flex justify-between items-start mb-3">
      <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{idea.idea_title}</h4>
      <button onClick={() => onUse(idea)} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-full transition-colors">
        Use This
      </button>
    </div>
    <p className="text-sm text-slate-400 mb-3">{idea.idea_description}</p>
    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 mb-3">
      <p className="text-xs text-indigo-300 font-medium mb-1">Why it works:</p>
      <p className="text-xs text-slate-500">{idea.why_it_works}</p>
    </div>
    <div className="flex gap-2">
      {idea.suggested_platforms.map((p: string) => (
        <span key={p} className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded">
          {p}
        </span>
      ))}
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const apiKey = process.env.API_KEY || ''; // Injected by Gemini environment
  const [mode, setMode] = useState<Mode>('creator');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [files, setFiles] = useState<File[]>([]);
  const [brandGuidelines, setBrandGuidelines] = useState<File | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    niche: '',
    geography: '',
    targetAudience: '',
    targetLanguage: '',
    targetDemographics: ''
  });
  const [liveTrendMode, setLiveTrendMode] = useState(false);
  
  // States for Execution
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Results
  const [result, setResult] = useState<SocialSEOResult | null>(null);
  const [trendIdeas, setTrendIdeas] = useState<TrendHunterResponse | null>(null);

  // Loading Logic
  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgress(0);
      setLoadingPhase('Phase 1: Encrypting & Uploading...');
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProg = prev + (Math.random() * 5);
          if (newProg > 25 && newProg < 50) setLoadingPhase('Phase 2: Scanning Content...');
          if (newProg > 50 && newProg < 75) setLoadingPhase(liveTrendMode ? 'Phase 3: Hunting Live Trends...' : 'Phase 3: Analyzing Algorithms...');
          if (newProg > 75) setLoadingPhase('Phase 4: Finalizing Strategy...');
          return newProg > 90 ? 90 : newProg;
        });
      }, 500);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
    return () => clearInterval(interval);
  }, [loading, liveTrendMode]);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("API Key missing. Please restart and select a paid key.");
      return;
    }
    if (files.length === 0 && mode !== 'trend_hunter') {
      setError("Please upload content to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateSocialStrategy(apiKey, mode, platform, files, brandGuidelines, filters, liveTrendMode);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Connection Failed. Please check your API Key or Internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrendHunt = async () => {
    if (!filters.niche) {
      setError("Please enter a Niche to hunt trends for.");
      return;
    }
    setLoading(true);
    setError(null);
    setTrendIdeas(null);
    setLiveTrendMode(true); // Implicitly true for this mode

    try {
      const data = await huntTrends(apiKey, filters.niche);
      setTrendIdeas(data);
    } catch (err: any) {
      console.error(err);
      setError("Trend Hunt Failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const useTrendIdea = (idea: any) => {
    setMode('creator');
    setResult(null);
    setTrendIdeas(null);
    // Simulate populating a text file with the idea
    const blob = new Blob([`Create content based on this trend: ${idea.idea_title}\n\n${idea.idea_description}`], { type: 'text/plain' });
    const file = new File([blob], "trend_idea.txt", { type: "text/plain" });
    setFiles([file]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20">
      
      {/* Header */}
      <header className="mb-10 text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-glow">
          SocialSEO AI
        </h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase">v.Andromeda • Operational</p>
      </header>

      {/* Mode Selection Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 bg-slate-900/50 p-2 rounded-xl backdrop-blur-sm border border-slate-800 inline-flex mx-auto w-full md:w-auto">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setResult(null); setTrendIdeas(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === m.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Interface */}
      <div className="grid gap-8">
        
        {/* Trend Hunter View */}
        {mode === 'trend_hunter' ? (
           <div className="bg-slate-900/50 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
             {loading && <LoadingOverlay progress={progress} phase={loadingPhase} />}
             <div className="flex flex-col gap-4">
               <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                 <TrendingUp className="text-indigo-400" /> Viral Trend Hunter
               </h2>
               <p className="text-slate-400 text-sm">Use AI + Google Search to find real-time viral opportunities for your niche.</p>
               
               <div className="flex gap-4 items-end">
                 <div className="flex-grow">
                   <FilterInput label="Your Niche" value={filters.niche} onChange={(v) => setFilters({...filters, niche: v})} placeholder="e.g. SaaS Marketing, Vegan Cooking" />
                 </div>
                 <button 
                  onClick={handleTrendHunt}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 h-[42px]"
                 >
                   <Search size={18} /> Hunt
                 </button>
               </div>

               {trendIdeas && (
                 <div className="grid gap-4 mt-6 animate-in fade-in duration-500">
                   {trendIdeas.trend_hunter_ideas.map((idea, idx) => (
                     <TrendHunterCard key={idx} idea={idea} onUse={useTrendIdea} />
                   ))}
                 </div>
               )}
             </div>
           </div>
        ) : (
          /* Generator View */
          <>
            {/* Input Panel */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 relative overflow-hidden">
               {loading && <LoadingOverlay progress={progress} phase={loadingPhase} />}

               {/* File Uploads */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-300 mb-2">1. Upload Content</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        multiple 
                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className="border-2 border-dashed border-slate-700 group-hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center transition-colors bg-slate-900/30">
                        <Upload className="text-slate-500 group-hover:text-indigo-400 mb-3" size={32} />
                        <p className="text-slate-300 font-medium">Drag & Drop or Click</p>
                        <p className="text-xs text-slate-500 mt-1">Video, Images, PDF (Max 10GB)</p>
                        {files.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {files.map((f, i) => (
                              <span key={i} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{f.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-300 mb-2">2. Configuration</label>
                    
                    {/* Platform Selector */}
                    <div>
                      <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Target Platform</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setPlatform(p.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                              platform === p.id 
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
                            }`}
                          >
                            {/* Icon rendering mapping */}
                            {p.id === 'instagram' && <Instagram size={18} />}
                            {p.id === 'youtube' && <Youtube size={18} />}
                            {p.id === 'tiktok' && <Smartphone size={18} />}
                            {p.id === 'linkedin' && <Linkedin size={18} />}
                            {p.id === 'facebook' && <Facebook size={18} />}
                            {p.id === 'twitter_x' && <Twitter size={18} />}
                            <span className="text-[10px] mt-1">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Brand Guard */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                          <Shield size={12} /> Brand Guard
                        </label>
                        {brandGuidelines && <button onClick={() => setBrandGuidelines(null)}><X size={12} className="text-slate-500" /></button>}
                      </div>
                      <div className="relative">
                         <input 
                           type="file" 
                           onChange={(e) => setBrandGuidelines(e.target.files?.[0] || null)}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         />
                         <div className={`text-xs p-2 rounded border border-dashed flex items-center gap-2 ${brandGuidelines ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-500 hover:bg-slate-800'}`}>
                           {brandGuidelines ? `Uploaded: ${brandGuidelines.name}` : 'Upload Brand Guidelines (Optional)'}
                         </div>
                      </div>
                    </div>
                  </div>
               </div>

               {/* Advanced Context Filters */}
               <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 mb-4 text-indigo-400">
                    <Globe size={16} />
                    <span className="text-sm font-bold uppercase tracking-wider">Targeting Context</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FilterInput label="Niche" value={filters.niche} onChange={(v) => setFilters({...filters, niche: v})} placeholder="e.g. Fitness" />
                    <FilterInput label="Geo" value={filters.geography} onChange={(v) => setFilters({...filters, geography: v})} placeholder="e.g. USA, NYC" />
                    <FilterInput label="Language" value={filters.targetLanguage} onChange={(v) => setFilters({...filters, targetLanguage: v})} placeholder="e.g. English" />
                    <FilterInput label="Audience" value={filters.targetAudience} onChange={(v) => setFilters({...filters, targetAudience: v})} placeholder="e.g. Gen Z" />
                    <FilterInput label="Demographics" value={filters.targetDemographics} onChange={(v) => setFilters({...filters, targetDemographics: v})} placeholder="e.g. 18-24, Students" />
                  </div>
               </div>

               {/* Trend Toggle & Action */}
               <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-3 bg-slate-900 p-2 pr-4 rounded-full border border-slate-700">
                   <div 
                    onClick={() => setLiveTrendMode(!liveTrendMode)}
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${liveTrendMode ? 'bg-emerald-500' : 'bg-slate-700'}`}
                   >
                     <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${liveTrendMode ? 'translate-x-6' : 'translate-x-0'}`} />
                   </div>
                   <span className={`text-sm font-medium ${liveTrendMode ? 'text-emerald-400' : 'text-slate-400'}`}>
                     Aggressive Trend Mode {liveTrendMode && '🔥'}
                   </span>
                 </div>

                 <button 
                   onClick={handleGenerate}
                   disabled={loading}
                   className="w-full md:w-auto relative group bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-xl shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]" />
                   <span className="relative flex items-center justify-center gap-2">
                     <Sparkles size={20} /> Generate Viral Metadata
                   </span>
                 </button>
               </div>
               
               {/* Error Feedback */}
               {error && (
                 <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-300 animate-in fade-in slide-in-from-top-2">
                   <AlertTriangle size={20} />
                   <span>{error}</span>
                 </div>
               )}
            </div>

            {/* Results Display */}
            {result && <ResultCard result={result} />}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
