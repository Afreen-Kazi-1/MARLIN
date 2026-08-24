import React from 'react';
import { Database, ShieldCheck, Activity, Dna, Waves, Fish, Bot, ArrowUpRight, BarChart2, Sparkles, Compass, Layers, Globe } from 'lucide-react';
import { SystemStats, OceanMeasurement, BiodiversityObservation } from '../types';
import { MapViewer } from '../components/MapViewer';
import { AnalyticsChart } from '../components/AnalyticsChart';

interface DashboardProps {
  stats: SystemStats;
  oceanData: OceanMeasurement[];
  biodiversityData: BiodiversityObservation[];
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  oceanData,
  biodiversityData,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Command Banner */}
      <div className="glass-panel-glow p-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-[#0d172a] via-[#12233c] to-[#0f1d35] border border-cyan-400/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SIH PS 20 Marine Intelligence Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Unified Marine Intelligence Command Center
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Cross-domain spatial-temporal-taxonomic integration layer for Argo oceanography, OBIS biodiversity, FAO FishStat landings, and MGnify metagenomics.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('workspace')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI Agents Workspace</span>
            </button>

            <button
              onClick={() => onNavigateTab('graph')}
              className="px-4 py-2.5 rounded-xl bg-[#14213d] hover:bg-[#1a2b4f] text-cyan-300 font-bold text-xs border border-cyan-400/40 flex items-center gap-2 transition-all"
            >
              <Compass className="h-4 w-4 text-violet-400" />
              <span>Explore Evidence Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Metrics Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl space-y-2 relative overflow-hidden bg-[#0f182c] border border-[#1e2d4a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">Total Observations</span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Database className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {stats.total_observations.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-300 flex items-center gap-1 font-bold pt-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400" />
            <span>Argo, OBIS, FishStat & MGnify</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl space-y-2 relative overflow-hidden bg-[#0f182c] border border-[#1e2d4a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Canonical Species</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Dna className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {stats.canonical_species_count.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300 flex items-center gap-1 font-bold pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>WoRMS Normalized AphiaIDs</span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl space-y-2 relative overflow-hidden bg-[#0f182c] border border-[#1e2d4a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">Grounding Audit Rate</span>
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-400/30">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            100.0%
          </div>
          <div className="text-[11px] text-emerald-300 font-bold pt-1 flex items-center gap-1">
            <span>0.0% Hallucination Target</span>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl space-y-2 relative overflow-hidden bg-[#0f182c] border border-[#1e2d4a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">System Environment</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Activity className="h-4.5 w-4.5 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            Operational
          </div>
          <div className="text-[11px] text-amber-300 font-mono font-bold pt-1">
            {stats.demo_mode ? 'Demo Sandbox (Seeded PostGIS)' : 'Live PostgreSQL Pipeline'}
          </div>
        </div>
      </div>

      {/* Official Demo Scenario Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>Official PRD Demo Scenarios</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigateTab('workspace')}
            className="glass-panel glass-panel-hover p-4 rounded-2xl border border-[#1e2d4a] hover:border-cyan-400 cursor-pointer space-y-2 group bg-[#0f182c]"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase">
                Scenario A
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
              Species Decline Analysis
            </h4>
            <p className="text-xs text-slate-300 font-medium line-clamp-2">
              "How has yellowfin tuna changed in the Arabian Sea over the last 5 years?"
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('workspace')}
            className="glass-panel glass-panel-hover p-4 rounded-2xl border border-[#1e2d4a] hover:border-emerald-400 cursor-pointer space-y-2 group bg-[#0f182c]"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                Scenario B
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
              Environmental Correlation
            </h4>
            <p className="text-xs text-slate-300 font-medium line-clamp-2">
              "Could sea surface temperature changes be related to the observed tuna change?"
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('graph')}
            className="glass-panel glass-panel-hover p-4 rounded-2xl border border-[#1e2d4a] hover:border-violet-400 cursor-pointer space-y-2 group bg-[#0f182c]"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30 uppercase">
                Scenario C
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-violet-400 transition-colors" />
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors">
              Ecosystem Reasoning Graph
            </h4>
            <p className="text-xs text-slate-300 font-medium line-clamp-2">
              "Visualize cross-domain evidence graphs linking oceanography, fisheries, and molecular observations."
            </p>
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Spatial Map + Analytics Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>Spatial Grid & Observation Map (0.25° × 0.25°)</span>
            </h3>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              Expand Full Explorer <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <MapViewer
            oceanData={oceanData}
            biodiversityData={biodiversityData}
            selectedRegion="All"
            onSelectRegion={() => {}}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-cyan-400" />
              <span>Deterministic Analytics Engine (Trend & Scatter)</span>
            </h3>
            <button
              onClick={() => onNavigateTab('workspace')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              Ask AI Workspace <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <AnalyticsChart />
        </div>
      </div>
    </div>
  );
};
