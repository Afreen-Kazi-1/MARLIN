import React from 'react';
import { Database, ShieldCheck, Activity, Dna, Waves, Fish, Bot, ArrowUpRight, BarChart2 } from 'lucide-react';
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
      {/* System Metrics Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Observations</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {stats.total_observations.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Argo, OBIS, FishStat & MGnify</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Canonical Species</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Dna className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {stats.canonical_species_count.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>WoRMS Normalized AphiaIDs</span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Reasoning Grounding Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            100.0%
          </div>
          <div className="text-[11px] text-emerald-300 font-medium">
            0.0% Unsupported Claim Rate
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">System Status</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono uppercase text-sm flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            Operational
          </div>
          <div className="text-[11px] text-amber-400 font-mono">
            {stats.demo_mode ? 'Demo Sandbox Active' : 'Postgres API Live'}
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Spatial Map + Analytics Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Waves className="h-4 w-4 text-cyan-400" />
              <span>Spatial Grid & Observation Distribution</span>
            </h3>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              Expand Explorer <ArrowUpRight className="h-3.5 w-3.5" />
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
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-emerald-400" />
              <span>Deterministic Correlation Visualizer</span>
            </h3>
            <button
              onClick={() => onNavigateTab('workspace')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              Ask AI Agents <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <AnalyticsChart />
        </div>
      </div>
    </div>
  );
};
