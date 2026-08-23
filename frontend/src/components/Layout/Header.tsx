import React from 'react';
import { ShieldCheck, Activity, GitBranch, Search, Waves, Sparkles } from 'lucide-react';
import { SystemStats } from '../../types';

interface HeaderProps {
  stats: SystemStats;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ stats, searchTerm, onSearchChange }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <Waves className="h-5 w-5 text-white" />
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              MARLIN
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v1.0 PRD
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <span>Unified Marine Intelligence & Ecosystem Reasoning</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">SIH PS 20</span>
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center relative w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search species (WoRMS), datasets, or region..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 transition-all"
        />
      </div>

      {/* System Indicators */}
      <div className="flex items-center gap-3">
        {/* Branch Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-slate-950/60 text-cyan-300 border border-slate-800">
          <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
          <span>Frontend-Mudit</span>
        </div>

        {/* Grounding Audit Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Grounding: 100%</span>
        </div>

        {/* Health / Mode Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium border ${
            stats.demo_mode
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
          }`}
        >
          <Activity className="h-3.5 w-3.5 animate-pulse text-amber-400" />
          <span>{stats.demo_mode ? 'Demo Sandbox Active' : 'Backend Connected'}</span>
        </div>
      </div>
    </header>
  );
};
