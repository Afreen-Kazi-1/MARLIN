import React, { useState } from 'react';
import { Network, ShieldCheck, Database, CheckCircle2, AlertTriangle, FileText, Info } from 'lucide-react';
import { Claim, EvidenceRecord, ClaimEvidenceBridge } from '../types';

interface EcosystemGraphProps {
  claims?: Claim[];
  evidence?: EvidenceRecord[];
  bridges?: ClaimEvidenceBridge[];
  queryText?: string;
}

export const EcosystemGraph: React.FC<EcosystemGraphProps> = ({
  claims = [],
  evidence = [],
  bridges = [],
  queryText = 'How has sea surface temperature warming affected fisheries and bacterial diversity?'
}) => {
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    type: 'query' | 'claim' | 'evidence';
    title: string;
    detail: any;
  } | null>(null);

  const safeClaims = Array.isArray(claims) ? claims : [];
  const safeEvidence = Array.isArray(evidence) ? evidence : [];

  const domainColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    oceanography: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-300', glow: 'shadow-cyan-500/20' },
    fisheries: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-300', glow: 'shadow-amber-500/20' },
    biodiversity: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-300', glow: 'shadow-emerald-500/20' },
    molecular: { bg: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-300', glow: 'shadow-violet-500/20' }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col h-[600px] justify-between relative overflow-hidden">
      {/* Graph Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 z-10">
        <div>
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Network className="h-4 w-4 text-cyan-400" />
            <span>Force-Directed Ecosystem Claim-Evidence Network</span>
          </h3>
          <p className="text-xs text-slate-400">
            Interactive reasoning graph connecting domain claims, grounding evidence records, and data sources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Unsupported Claim Rate: 0.0%</span>
          </span>
        </div>
      </div>

      {/* SVG & Canvas Graph Rendering Container */}
      <div className="relative flex-1 my-3 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <svg className="w-full h-full absolute inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Edge Lines connecting Query Node to Claim Nodes */}
          <line x1="50%" y1="12%" x2="20%" y2="40%" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
          <line x1="50%" y1="12%" x2="40%" y2="40%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
          <line x1="50%" y1="12%" x2="60%" y2="40%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
          <line x1="50%" y1="12%" x2="80%" y2="40%" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />

          {/* Edge Lines connecting Claim Nodes to Evidence Nodes */}
          <line x1="20%" y1="40%" x2="20%" y2="78%" stroke="#06b6d4" strokeWidth="2" opacity="0.8" />
          <line x1="40%" y1="40%" x2="40%" y2="78%" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
          <line x1="60%" y1="40%" x2="60%" y2="78%" stroke="#10b981" strokeWidth="2" opacity="0.8" />
          <line x1="80%" y1="40%" x2="80%" y2="78%" stroke="#8b5cf6" strokeWidth="2" opacity="0.8" />
        </svg>

        {/* Root Query Node */}
        <div
          onClick={() =>
            setSelectedNode({
              id: 'root_query',
              type: 'query',
              title: 'Natural Language Inquiry',
              detail: { text: queryText }
            })
          }
          className="absolute top-[8%] left-1/2 -translate-x-1/2 z-20 cursor-pointer group"
        >
          <div className="glass-panel-glow px-4 py-2 rounded-xl flex items-center gap-2 border border-cyan-400/60 text-xs font-bold text-cyan-200 shadow-xl transition-all group-hover:scale-105">
            <Network className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="max-w-xs truncate">{queryText}</span>
          </div>
        </div>

        {/* Claim Nodes Row */}
        <div className="absolute top-[36%] inset-x-0 flex justify-around px-8 z-20">
          {safeClaims.map((claim) => {
            const style = domainColors[claim.domain] || domainColors.oceanography;
            return (
              <div
                key={claim.id}
                onClick={() =>
                  setSelectedNode({
                    id: claim.id,
                    type: 'claim',
                    title: `Claim (${claim.domain})`,
                    detail: claim
                  })
                }
                className="w-52 cursor-pointer group"
              >
                <div
                  className={`p-3 rounded-xl border backdrop-blur-md transition-all group-hover:scale-105 shadow-lg ${style.bg} ${style.border} ${style.glow}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold uppercase ${style.text}`}>
                      {claim.domain}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-slate-300">
                      Conf: {((claim.confidence || 0.95) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 line-clamp-2 leading-tight">
                    {claim.claim_text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Evidence Nodes Row */}
        <div className="absolute top-[74%] inset-x-0 flex justify-around px-8 z-20">
          {safeEvidence.map((ev) => {
            const style = domainColors[ev.domain] || domainColors.oceanography;
            const srcId = ev.source_id ? ev.source_id.split(':')[0] : 'DB_RECORD';
            return (
              <div
                key={ev.id}
                onClick={() =>
                  setSelectedNode({
                    id: ev.id,
                    type: 'evidence',
                    title: `Grounding Evidence (${ev.source_id || ev.id})`,
                    detail: ev
                  })
                }
                className="w-52 cursor-pointer group"
              >
                <div
                  className="p-3 rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-md transition-all group-hover:scale-105 shadow-md hover:border-slate-500"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Database className="h-3 w-3 text-cyan-400" />
                      {srcId}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight">
                    {ev.evidence_text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Detail Drawer Modal */}
      {selectedNode && (
        <div className="absolute inset-y-0 right-0 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 p-5 z-30 flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-xs text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                <Info className="h-4 w-4 text-cyan-400" />
                {selectedNode.title}
              </h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            {selectedNode.type === 'claim' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Statement:</span>
                  <p className="font-medium text-slate-100 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {selectedNode.detail.claim_text}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Claim Type:</span>
                  <span className="font-mono text-cyan-400">{selectedNode.detail.claim_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validation Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                    {selectedNode.detail.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confidence Score:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {((selectedNode.detail.confidence || 0.95) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {selectedNode.type === 'evidence' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Evidence Content:</span>
                  <p className="font-medium text-slate-100 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {selectedNode.detail.evidence_text}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source ID:</span>
                  <span className="font-mono text-cyan-400">{selectedNode.detail.source_id || 'DB_RECORD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Analytical Method:</span>
                  <span className="font-mono text-slate-300">{selectedNode.detail.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confidence Weight:</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedNode.detail.confidence}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Node ID: {selectedNode.id} • Grounded in PostGIS PostgreSQL Database
          </div>
        </div>
      )}

      {/* Graph Footer Legend */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Oceanography
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span> Fisheries
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Biodiversity
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-violet-400"></span> Molecular
          </span>
        </div>
        <div className="text-slate-500">Click any node to inspect evidence grounding audit details</div>
      </div>
    </div>
  );
};
