import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Bot,
  Network,
  Dna,
  Database,
  Anchor
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'System Dashboard',
      icon: LayoutDashboard,
      badge: 'Stats'
    },
    {
      id: 'explorer',
      label: 'Domain Explorer',
      icon: Compass,
      badge: 'Map/Chart'
    },
    {
      id: 'workspace',
      label: 'Agent AI Workspace',
      icon: Bot,
      badge: 'SIH LLM'
    },
    {
      id: 'graph',
      label: 'Ecosystem Graph',
      icon: Network,
      badge: 'Claims'
    },
    {
      id: 'taxonomy',
      label: 'WoRMS Taxonomy',
      icon: Dna,
      badge: 'Resolver'
    }
  ];

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen z-50 border-r border-[#1e2d4a] bg-[#0e1626] flex flex-col justify-between p-4 overflow-y-auto shadow-2xl">
      <div className="space-y-5">
        {/* Full Height Top-to-Bottom Brand Header */}
        <div className="flex items-center space-x-3 px-2 py-2 border-b border-[#1e2d4a] pb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/40 border border-cyan-400/30">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-wider flex items-center gap-1.5">
              MARLIN
              <span className="text-[9px] bg-cyan-950 text-cyan-400 font-mono px-1.5 py-0.5 rounded border border-cyan-800 uppercase">
                v2.0
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Marine AI Platform</p>
          </div>
        </div>

        <div>
          <h2 className="px-3 text-[11px] font-bold text-cyan-400/90 uppercase tracking-widest mb-3">
            Platform Navigation
          </h2>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/15 text-white border border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-[#16233b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-md font-mono font-bold ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-[#18263e] text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Data Domains Panel */}
        <div className="pt-4 border-t border-[#1e2d4a]">
          <h2 className="px-3 text-[11px] font-bold text-cyan-400/90 uppercase tracking-widest mb-3 flex items-center justify-between">
            <span>Integrated Domains</span>
            <Database className="h-3.5 w-3.5 text-cyan-400" />
          </h2>
          <div className="space-y-2.5 px-3">
            <div className="flex items-center justify-between text-xs text-slate-200 font-medium">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
                Argo Physical Ocean
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">142.5k</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-200 font-medium">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
                OBIS Biodiversity
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">89.4k</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-200 font-medium">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></span>
                FAO FishStat Landings
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">34.2k</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-200 font-medium">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400"></span>
                MGnify Metagenomics
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">51.8k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 rounded-2xl bg-[#121d33] border border-[#1e2d4a] text-[11px] text-slate-300 space-y-1 shadow-inner">
        <div className="flex items-center justify-between font-bold text-white">
          <span>MARLIN Engine</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-[10px] text-slate-300 leading-snug">
          PostgreSQL + PostGIS spatial indexing & WoRMS AphiaID taxonomy.
        </p>
      </div>
    </aside>
  );
};
