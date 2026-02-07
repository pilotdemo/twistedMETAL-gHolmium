import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalOutputProps {
  logs: LogEntry[];
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded font-mono text-sm relative overflow-hidden group">
      {/* Header */}
      <div className="bg-slate-900 p-2 border-b border-slate-800 flex justify-between items-center">
        <span className="text-xs text-slate-400 uppercase tracking-wider">Live Feed // Net_Trace_v4</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative z-10">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-slate-600 shrink-0 text-[10px] pt-1">
              [{log.timestamp.split('T')[1].split('.')[0]}]
            </span>
            <span className={`
              break-all
              ${log.type === 'info' ? 'text-slate-300' : ''}
              ${log.type === 'success' ? 'text-green-400' : ''}
              ${log.type === 'warning' ? 'text-yellow-400' : ''}
              ${log.type === 'error' ? 'text-pink-500 font-bold' : ''}
            `}>
              <span className="mr-2 opacity-50">{'>'}</span>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Matrix-like subtle background text */}
      <div className="absolute inset-0 pointer-events-none opacity-5 text-[10px] leading-3 text-green-900 overflow-hidden z-0 select-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i}>{Math.random().toString(36).substring(2)}</div>
        ))}
      </div>
    </div>
  );
};
