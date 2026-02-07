import React from 'react';
import { TARGET_MODELS } from '../constants';
import { ModelOption } from '../types';
import { ShieldAlert, Terminal, Database, Cpu } from 'lucide-react';

interface SidebarProps {
  selectedModel: ModelOption | null;
  onSelectModel: (model: ModelOption) => void;
  isMining: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedModel, onSelectModel, isMining }) => {
  return (
    <div className="w-64 h-full bg-slate-900 border-r border-cyan-900 flex flex-col relative z-20">
      <div className="p-4 border-b border-cyan-900 bg-slate-950">
        <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2 tracking-tighter">
          <Terminal size={20} />
          PROMPT_MINER
        </h1>
        <p className="text-xs text-slate-500 mt-1">v2.6.0 // AUTH: GUEST</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
          Target Selection
        </div>
        
        <div className="space-y-2">
          {TARGET_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => !isMining && onSelectModel(model)}
              disabled={isMining}
              className={`w-full text-left p-3 rounded border transition-all duration-200 group relative overflow-hidden ${
                selectedModel?.id === model.id
                  ? 'bg-cyan-950/30 border-cyan-500 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-cyan-700 hover:text-cyan-200'
              } ${isMining ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">{model.name}</span>
                {selectedModel?.id === model.id && <Cpu size={14} className="animate-pulse text-cyan-400" />}
              </div>
              <div className="text-[10px] uppercase text-slate-500 font-mono">
                VER: {model.version}
              </div>
              
              {/* Decorative corner accent */}
              {selectedModel?.id === model.id && (
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400"></div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 border border-pink-900/50 bg-pink-950/10 rounded">
          <div className="flex items-center gap-2 text-pink-500 mb-2">
            <ShieldAlert size={16} />
            <span className="text-xs font-bold uppercase">System Warning</span>
          </div>
          <p className="text-[10px] text-pink-400/80 leading-relaxed">
            Unauthorized probing of AI safety layers may violate terms of service. 
            Proceed with caution. Miner is running in RESEARCH_MODE.
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-cyan-900 bg-slate-950 text-xs text-slate-600 font-mono">
        <div className="flex items-center gap-2">
          <Database size={12} />
          <span>STATUS: ONLINE</span>
        </div>
        <div className="mt-1">
          LATENCY: 24ms
        </div>
      </div>
    </div>
  );
};
