import React, { useState, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TerminalOutput } from './components/TerminalOutput';
import { IntelVault } from './components/IntelVault';
import { minePromptData } from './services/geminiService';
import { IntelItem, LogEntry, ModelOption, MiningStats, TeamType } from './types';
import { MOCK_LOGS, INITIAL_VAULT_DATA } from './constants';
import { Play, Activity, Hexagon, Search, Download } from 'lucide-react';

const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [isMining, setIsMining] = useState(false);
  const [intelVault, setIntelVault] = useState<IntelItem[]>([...INITIAL_VAULT_DATA]);
  const [logs, setLogs] = useState<LogEntry[]>([...MOCK_LOGS]);
  
  // New States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TeamType>('RED');

  const [stats, setStats] = useState<MiningStats>({
    vaultCount: INITIAL_VAULT_DATA.length,
    lastFound: INITIAL_VAULT_DATA[INITIAL_VAULT_DATA.length - 1].title.substring(0, 20) + '...',
    activeModel: 'Gemini 3 Pro',
    status: 'IDLE'
  });

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      message,
      type
    }]);
  };

  const handleStartMining = useCallback(async () => {
    if (!selectedModel || isMining) return;

    setIsMining(true);
    setStats(prev => ({ ...prev, status: 'MINING', activeModel: selectedModel.name }));
    addLog(`INITIATING ${activeTab} OPS SEQUENCE for ${selectedModel.name}...`, 'info');
    
    // Simulate initial connection delay
    await new Promise(resolve => setTimeout(resolve, 800));
    addLog(`SEARCH_VECTORS_DEPLOYED. Targeting ${activeTab} sectors...`, 'info');

    try {
      // Pass activeTab as mode
      const { intel, logs: serviceLogs } = await minePromptData(selectedModel.name, intelVault.length, activeTab);
      
      serviceLogs.forEach(log => {
        const type = log.includes('FAILURE') ? 'error' : log.includes('SUCCESS') ? 'success' : 'info';
        addLog(log, type);
      });

      if (intel.length > 0) {
        setIntelVault(prev => [...intel, ...prev]);
        setStats(prev => ({
          ...prev,
          vaultCount: prev.vaultCount + intel.length,
          lastFound: intel[0].title.substring(0, 20) + '...',
          status: 'IDLE'
        }));
      } else {
         setStats(prev => ({ ...prev, status: 'IDLE' }));
      }

    } catch (error) {
      addLog('FATAL_ERROR: Mining sequence aborted.', 'error');
      setStats(prev => ({ ...prev, status: 'IDLE' }));
    } finally {
      setIsMining(false);
      addLog('SEQUENCE_COMPLETE. Waiting for input.', 'warning');
    }
  }, [selectedModel, isMining, intelVault.length, activeTab]);

  const handleDownload = () => {
    // Format for Promptfoo
    const promptfooFormat = {
      description: `Prompt Miner v2.6 Export - ${new Date().toISOString()}`,
      prompts: intelVault.map(item => ({
        label: item.title,
        description: `Team: ${item.team} | Type: ${item.type} | Model: ${item.model}`,
        raw: item.content
      })),
      // Optional: Add basic test structure
      tests: intelVault.map(item => ({
         vars: {
            topic: item.title
         }
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(promptfooFormat, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `promptfoo_vault_${activeTab.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addLog('EXPORT_CONFIRMED: Promptfoo compatible JSON generated.', 'success');
  };

  const filteredItems = useMemo(() => {
    return intelVault.filter(item => {
      // Filter by Team Tab
      if (item.team !== activeTab) return false;
      
      // Filter by Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.model.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [intelVault, activeTab, searchQuery]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Left Sidebar */}
      <Sidebar 
        selectedModel={selectedModel} 
        onSelectModel={setSelectedModel} 
        isMining={isMining} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        
        {/* Top Header / HUD */}
        <header className="h-16 border-b border-cyan-900 bg-slate-900/50 flex items-center justify-between px-6 backdrop-blur shrink-0">
          <div className="flex items-center gap-6 flex-1">
             {/* Global Search Bar */}
             <div className="relative group w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH VAULT (KEYWORD / HASH)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded pl-10 pr-4 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600"
                />
             </div>

             <div className="h-8 w-px bg-slate-800 mx-2"></div>
             
             {/* Mode Toggles */}
             <div className="flex gap-1 p-1 bg-slate-950 border border-slate-800 rounded">
                <button
                  onClick={() => setActiveTab('RED')}
                  className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'RED' ? 'bg-red-900/40 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                   Red Ops
                </button>
                <button
                  onClick={() => setActiveTab('BLUE')}
                  className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'BLUE' ? 'bg-blue-900/40 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                   Blue Ops
                </button>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 mr-4">
               <Activity size={16} className={`${isMining ? 'text-green-400 animate-pulse' : 'text-slate-600'}`} />
               <span className="text-xs font-mono hidden md:inline">{stats.status}</span>
             </div>

             <button
              onClick={handleDownload}
              className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-600 transition-all"
              title="Export for Promptfoo"
             >
                <Download size={16} />
             </button>

             <button
              onClick={handleStartMining}
              disabled={!selectedModel || isMining}
              className={`
                flex items-center gap-2 px-6 py-2 rounded font-bold uppercase text-sm tracking-wider transition-all duration-300
                ${!selectedModel || isMining 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                  : activeTab === 'RED' 
                    ? 'bg-red-700 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500'
                    : 'bg-blue-700 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-500'
                }
              `}
             >
                {isMining ? (
                  <>
                    <Hexagon className="animate-spin" size={16} /> PROCESSING
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" /> {activeTab === 'RED' ? 'ATTACK' : 'OPTIMIZE'}
                  </>
                )}
             </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 p-6 grid grid-rows-[35%_65%] gap-6 overflow-hidden">
          {/* Top: Live Feed (Terminal) */}
          <section className="h-full min-h-0">
             <TerminalOutput logs={logs} />
          </section>

          {/* Bottom: Vault (Grid) */}
          <section className="h-full min-h-0">
            <IntelVault items={filteredItems} onDownload={handleDownload} />
          </section>
        </main>
        
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-20 z-0"></div>
      </div>
    </div>
  );
};

export default App;