import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Bot,
  Network,
  Dna,
  Database,
  HelpCircle
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
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between p-4 min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        <div>
          <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-md font-mono ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800/80 text-slate-500 group-hover:text-slate-400'
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
        <div className="pt-4 border-t border-slate-800/80">
          <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Data Domains</span>
            <Database className="h-3 w-3 text-slate-500" />
          </h2>
          <div className="space-y-2 px-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                Argo Physical Ocean
              </span>
              <span className="text-[10px] font-mono text-slate-500">142.5k</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                OBIS Biodiversity
              </span>
              <span className="text-[10px] font-mono text-slate-500">89.4k</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                FAO FishStat Landings
              </span>
              <span className="text-[10px] font-mono text-slate-500">34.2k</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-400"></span>
                MGnify Metagenomics
              </span>
              <span className="text-[10px] font-mono text-slate-500">51.8k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between font-semibold text-slate-300">
          <span>MARLIN Engine</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        </div>
        <p className="text-[10px] text-slate-400">
          PostgreSQL + PostGIS PostGIS spatial indexing & WoRMS AphiaID resolution.
        </p>
      </div>
    </aside>
  );
};
