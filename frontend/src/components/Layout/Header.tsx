import React from 'react';
import { ShieldCheck, Activity, Search, Waves, Compass, Bot } from 'lucide-react';
import { SystemStats } from '../../types';

interface HeaderProps {
  stats: SystemStats;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeTab: string;
  onSelectTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  searchTerm,
  onSearchChange,
  activeTab,
  onSelectTab
}) => {
  return (
    <header className="border-b border-[#1e2d4a] bg-[#0b1322] px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-lg shadow-cyan-500/25 border border-cyan-400/40 transform hover:rotate-6 transition-transform">
          <Waves className="h-5 w-5 text-white" />
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-xl tracking-tight text-white">
              MARLIN
            </h1>
            <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              SIH PS 20 Engine
            </span>
          </div>
          <p className="text-[11px] text-slate-300 flex items-center gap-1.5 font-medium">
            <span>Unified Marine Intelligence & Ecosystem Reasoning</span>
          </p>
        </div>
      </div>

      {/* Quick Navigation Tab Buttons */}
      {onSelectTab && (
        <div className="hidden xl:flex items-center gap-2 bg-[#121c30] p-1 rounded-2xl border border-[#1e2d4a]">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/25 text-white border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                : 'text-slate-300 hover:text-white hover:bg-[#192742]'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-cyan-400" /> Command Center
          </button>
          <button
            onClick={() => onSelectTab('workspace')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'workspace'
                ? 'bg-cyan-500/25 text-white border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                : 'text-slate-300 hover:text-white hover:bg-[#192742]'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-cyan-400" /> AI Reasoning
          </button>
          <button
            onClick={() => onSelectTab('graph')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'graph'
                ? 'bg-violet-500/25 text-white border border-violet-400/50 shadow-md shadow-violet-500/10'
                : 'text-slate-300 hover:text-white hover:bg-[#192742]'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-violet-400" /> Evidence Graph
          </button>
        </div>
      )}

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center relative w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search species (WoRMS), region..."
          className="w-full bg-[#121c30] border border-[#1e2d4a] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all font-medium"
        />
      </div>

      {/* System Status Badges */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Grounding: 100%</span>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
            stats.demo_mode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
          }`}
        >
          <Activity className="h-3.5 w-3.5 animate-pulse text-amber-400" />
          <span>{stats.demo_mode ? 'PostGIS Live' : 'Backend API Live'}</span>
        </div>
      </div>
    </header>
  );
};
