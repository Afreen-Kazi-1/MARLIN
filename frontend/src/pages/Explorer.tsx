import React, { useState } from 'react';
import { Compass, Filter, Download, Table, Layers, Search } from 'lucide-react';
import { OceanMeasurement, BiodiversityObservation, FisheriesRecord, MolecularSample } from '../types';
import { MapViewer } from '../components/MapViewer';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { generateOceanMeasurements, generateBiodiversityObservations, generateFisheriesRecords, generateMolecularSamples } from '../services/demoData';

interface ExplorerProps {
  oceanData: OceanMeasurement[];
  biodiversityData: BiodiversityObservation[];
  fisheriesData: FisheriesRecord[];
  molecularData: MolecularSample[];
}

export const Explorer: React.FC<ExplorerProps> = ({
  oceanData = [],
  biodiversityData = [],
  fisheriesData = [],
  molecularData = []
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Datasets fallback
  const rawOcean = Array.isArray(oceanData) && oceanData.length > 0 ? oceanData : generateOceanMeasurements();
  const rawBio = Array.isArray(biodiversityData) && biodiversityData.length > 0 ? biodiversityData : generateBiodiversityObservations();
  const rawFish = Array.isArray(fisheriesData) && fisheriesData.length > 0 ? fisheriesData : generateFisheriesRecords();
  const rawMol = Array.isArray(molecularData) && molecularData.length > 0 ? molecularData : generateMolecularSamples();

  // Region Filtering
  const filteredOcean = selectedRegion === 'All' ? rawOcean : rawOcean.filter((d) => d.region_id === selectedRegion);
  const filteredBio = selectedRegion === 'All' ? rawBio : rawBio.filter((d) => d.region_id === selectedRegion);
  const filteredFish = selectedRegion === 'All' ? rawFish : rawFish.filter((d) => d.region_id === selectedRegion);
  const filteredMol = selectedRegion === 'All' ? rawMol : rawMol.filter((d) => d.region_id === selectedRegion);

  // Map Data Filtering by Selected Domain
  const mapOceanData = selectedDomain === 'all' || selectedDomain === 'oceanography' ? filteredOcean : [];
  const mapBioData = selectedDomain === 'all' || selectedDomain === 'biodiversity' ? filteredBio : [];

  // Master Table Unified Row Interface
  interface TableRow {
    id: string;
    domain: 'oceanography' | 'biodiversity' | 'fisheries' | 'molecular';
    dataset_id: string;
    region_id: string;
    locationText: string;
    descriptor: string;
    valText: string;
  }

  const allTableRows: TableRow[] = [
    ...(selectedDomain === 'all' || selectedDomain === 'oceanography'
      ? filteredOcean.map((item) => ({
          id: `ocn_${item.id}`,
          domain: 'oceanography' as const,
          dataset_id: item.dataset_id,
          region_id: item.region_id,
          locationText: `${item.latitude}°N, ${item.longitude}°E`,
          descriptor: item.variable,
          valText: `${item.value} ${item.unit}`
        }))
      : []),
    ...(selectedDomain === 'all' || selectedDomain === 'biodiversity'
      ? filteredBio.map((item) => ({
          id: `bio_${item.id}`,
          domain: 'biodiversity' as const,
          dataset_id: item.dataset_id,
          region_id: item.region_id,
          locationText: `${item.latitude}°N, ${item.longitude}°E`,
          descriptor: `${item.species_name} (${item.common_name})`,
          valText: `${item.abundance} count`
        }))
      : []),
    ...(selectedDomain === 'all' || selectedDomain === 'fisheries'
      ? filteredFish.map((item) => ({
          id: `fish_${item.id}`,
          domain: 'fisheries' as const,
          dataset_id: item.dataset_id,
          region_id: item.region_id,
          locationText: `Year: ${item.year}`,
          descriptor: `${item.species_name} (${item.common_name})`,
          valText: `${item.catch.toLocaleString()} tonnes`
        }))
      : []),
    ...(selectedDomain === 'all' || selectedDomain === 'molecular'
      ? filteredMol.map((item) => ({
          id: `mol_${item.id}`,
          domain: 'molecular' as const,
          dataset_id: item.dataset_id,
          region_id: item.region_id,
          locationText: `${item.latitude}°N, ${item.longitude}°E`,
          descriptor: item.species_name,
          valText: `${item.abundance} ratio (${item.value} reads)`
        }))
      : [])
  ];

  // Search Filter
  const displayedRows = allTableRows.filter((r) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.domain.toLowerCase().includes(q) ||
      r.dataset_id.toLowerCase().includes(q) ||
      r.region_id.toLowerCase().includes(q) ||
      r.descriptor.toLowerCase().includes(q) ||
      r.valText.toLowerCase().includes(q)
    );
  });

  const domainStyles: Record<string, { badge: string; text: string }> = {
    oceanography: { badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', text: 'text-cyan-400 font-semibold' },
    biodiversity: { badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', text: 'text-emerald-300 italic' },
    fisheries: { badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20', text: 'text-amber-300 font-semibold' },
    molecular: { badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20', text: 'text-violet-300 font-mono' }
  };

  return (
    <div className="space-y-6">
      {/* Explorer Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Compass className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="font-bold text-sm text-slate-100">Cross-Domain Unified Explorer</h2>
            <p className="text-xs text-slate-400">Filter physical oceanography, OBIS taxonomy, FAO landings, and MGnify OTUs</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Domain Filter Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['all', 'oceanography', 'biodiversity', 'fisheries', 'molecular'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  selectedDomain === d
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Region Selector */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Marine Regions</option>
            <option value="Arabian_Sea">Arabian Sea</option>
            <option value="Bay_of_Bengal">Bay of Bengal</option>
          </select>
        </div>
      </div>

      {/* Main Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MapViewer
          oceanData={mapOceanData}
          biodiversityData={mapBioData}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />
        <AnalyticsChart />
      </div>

      {/* Observation Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-200">Normalized Observation Master Table</h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 font-mono border border-slate-800">
              Showing {displayedRows.length} Records
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter table rows..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={() => alert(`Exporting ${displayedRows.length} normalized observations as CSV...`)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px] sticky top-0 z-10">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Dataset ID</th>
                <th className="p-3">Region</th>
                <th className="p-3">Coordinates / Year</th>
                <th className="p-3">Variable / Species</th>
                <th className="p-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {displayedRows.map((row) => {
                const style = domainStyles[row.domain] || domainStyles.oceanography;
                return (
                  <tr key={row.id} className="hover:bg-slate-900/50">
                    <td className="p-3 text-slate-500">#{row.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] border capitalize ${style.badge}`}>
                        {row.domain}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{row.dataset_id}</td>
                    <td className="p-3 font-semibold text-slate-200">{row.region_id}</td>
                    <td className="p-3">{row.locationText}</td>
                    <td className={`p-3 ${style.text}`}>{row.descriptor}</td>
                    <td className="p-3 text-right font-bold text-slate-100">
                      {row.valText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
