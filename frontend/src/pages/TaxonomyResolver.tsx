import React, { useState } from 'react';
import { Dna, Search, CheckCircle2, Globe, Database, ExternalLink } from 'lucide-react';
import { Species } from '../types';
import { apiService } from '../services/api';

export const TaxonomyResolver: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('Thunnus albacares');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Species | null>({
    id: 101,
    aphia_id: 127027,
    scientific_name: 'Thunnus albacares',
    canonical_name: 'Thunnus albacares',
    common_name: 'Yellowfin Tuna',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Teleostei',
    order: 'Scombriformes',
    family: 'Scombridae',
    genus: 'Thunnus',
    species: 'albacares'
  });

  const handleResolve = async (name?: string) => {
    const q = name || searchTerm;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const sp = await apiService.resolveTaxon(q);
      setResult(sp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resolver Header & Search Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <Dna className="h-6 w-6 text-emerald-400" />
          <div>
            <h2 className="font-bold text-base text-slate-100">WoRMS Taxonomy Resolution Core Engine</h2>
            <p className="text-xs text-slate-400">
              Normalizes marine species synonyms to canonical AphiaIDs to prevent database naming collisions.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter scientific name or common synonym (e.g. Thunnus albacares, Yellowfin Tuna)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => handleResolve()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? 'Resolving WoRMS...' : 'Resolve Taxonomy'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500 font-medium">Quick Test Synonyms:</span>
          {['Yellowfin Tuna', 'Sardinella longiceps', 'Skipjack Tuna', 'Synechococcus'].map((name) => (
            <button
              key={name}
              onClick={() => {
                setSearchTerm(name);
                handleResolve(name);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-300 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Taxonomy Result Breakdown */}
      {result && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wide">Canonical Match Found</span>
              <h3 className="text-xl font-bold text-slate-100 italic mt-0.5">{result.canonical_name}</h3>
              <p className="text-xs text-slate-400">Common Name: <strong className="text-slate-200">{result.common_name}</strong></p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                AphiaID: <strong>{result.aphia_id}</strong>
              </div>
              <a
                href={`https://www.marinespecies.org/aphia.php?p=taxdetails&id=${result.aphia_id}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs flex items-center gap-1.5"
              >
                <span>WoRMS Register</span> <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Taxonomic Hierarchy */}
          <div>
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wide mb-3">Taxonomic Classification Hierarchy:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: 'Kingdom', val: result.kingdom },
                { label: 'Phylum', val: result.phylum },
                { label: 'Class', val: result.class },
                { label: 'Order', val: result.order },
                { label: 'Family', val: result.family },
                { label: 'Genus', val: result.genus },
                { label: 'Species', val: result.species }
              ].map((rank, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">{rank.label}</span>
                  <span className="font-semibold text-xs text-slate-200 font-mono truncate block">{rank.val || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
