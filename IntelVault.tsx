import React, { useState } from 'react';
import { IntelItem, IntelType } from '../types';
import { Download, ExternalLink, Zap, Lock, Eye, AlertTriangle, Shield, Terminal, Cpu, Copy, Check } from 'lucide-react';

interface IntelVaultProps {
  items: IntelItem[];
  onDownload: () => void;
}

const getTypeColor = (type: IntelType) => {
  switch (type) {
    case IntelType.JAILBREAK: return 'text-red-500 border-red-900 bg-red-950/20';
    case IntelType.INJECTION: return 'text-orange-400 border-orange-900 bg-orange-950/20';
    case IntelType.LEAK: return 'text-pink-400 border-pink-900 bg-pink-950/20';
    case IntelType.OPTIMIZER: return 'text-cyan-400 border-cyan-900 bg-cyan-950/20';
    case IntelType.DEFENSE: return 'text-blue-400 border-blue-900 bg-blue-950/20';
    case IntelType.SYSTEM_PROMPT: return 'text-indigo-400 border-indigo-900 bg-indigo-950/20';
    default: return 'text-slate-400 border-slate-800';
  }
};

const getTypeIcon = (type: IntelType) => {
  switch (type) {
    case IntelType.JAILBREAK: return <Zap size={14} />;
    case IntelType.INJECTION: return <AlertTriangle size={14} />;
    case IntelType.LEAK: return <Eye size={14} />;
    case IntelType.OPTIMIZER: return <Cpu size={14} />;
    case IntelType.DEFENSE: return <Shield size={14} />;
    case IntelType.SYSTEM_PROMPT: return <Terminal size={14} />;
  }
};

export const IntelVault: React.FC<IntelVaultProps> = ({ items, onDownload }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
          Intel Vault 
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-cyan-400">{items.length} Units</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
            <Lock size={48} className="mb-4" />
            <p className="text-sm uppercase tracking-widest">No matching intel found</p>
            <p className="text-xs mt-2">Modify filters or initiate mining</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`bg-slate-950 border p-4 rounded transition-colors group relative overflow-hidden flex flex-col
                  ${item.team === 'RED' ? 'border-red-900/30 hover:border-red-700/50' : 'border-blue-900/30 hover:border-blue-700/50'}
                `}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-2">
                   <div className="flex gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-2 ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        {item.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1
                         ${item.team === 'RED' ? 'text-red-400 border-red-900 bg-red-950/10' : 'text-blue-400 border-blue-900 bg-blue-950/10'}
                      `}>
                        {item.team === 'RED' ? 'RED OPS' : 'BLUE OPS'}
                      </span>
                   </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.team === 'RED' ? 'SEVERITY:' : 'EFFICIENCY:'}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.impactScore > 80 ? (item.team === 'RED' ? 'bg-red-500' : 'bg-blue-400') : item.impactScore > 50 ? 'bg-yellow-500' : 'bg-slate-500'}`} 
                        style={{ width: `${item.impactScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-slate-200 mb-2 truncate pr-4">{item.title}</h3>
                
                <div className="flex-1 relative group/code">
                  <p className="text-xs text-slate-400 line-clamp-4 mb-3 leading-4 bg-slate-900/50 p-2 rounded font-mono border border-slate-900 min-h-[4rem]">
                    {item.content}
                  </p>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-900 mt-auto">
                  <span className="text-[10px] text-slate-600 uppercase">{item.model}</span>
                  
                  <div className="flex items-center gap-3">
                    {item.sourceUrl && (
                      <a 
                        href={item.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-cyan-600 hover:text-cyan-400 flex items-center gap-1"
                        title="Open Source"
                      >
                        SOURCE <ExternalLink size={10} />
                      </a>
                    )}
                    
                    <button
                      onClick={() => handleCopy(item.content, item.id)}
                      className={`text-[10px] flex items-center gap-1 transition-all ${
                        copiedId === item.id 
                          ? 'text-green-400' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="Copy Payload"
                    >
                      {copiedId === item.id ? (
                        <>COPIED <Check size={12} /></>
                      ) : (
                        <>COPY <Copy size={12} /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Team Decoration */}
                <div className={`absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl to-transparent pointer-events-none ${item.team === 'RED' ? 'from-red-900/10' : 'from-blue-900/10'}`}></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};