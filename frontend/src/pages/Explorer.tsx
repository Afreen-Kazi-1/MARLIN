import React, { useState } from 'react';
import { Compass, Filter, Download, Table, Layers, Search } from 'lucide-react';
import { OceanMeasurement, BiodiversityObservation, FisheriesRecord, MolecularSample } from '../types';
import { MapViewer } from '../components/MapViewer';
import { AnalyticsChart } from '../components/AnalyticsChart';

interface ExplorerProps {
  oceanData: OceanMeasurement[];
  biodiversityData: BiodiversityObservation[];
  fisheriesData: FisheriesRecord[];
  molecularData: MolecularSample[];
}

export const Explorer: React.FC<ExplorerProps> = ({
  oceanData,
  biodiversityData,
  fisheriesData,
  molecularData
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredOcean = selectedRegion === 'All' ? oceanData : oceanData.filter((d) => d.region_id === selectedRegion);
  const filteredBio = selectedRegion === 'All' ? biodiversityData : biodiversityData.filter((d) => d.region_id === selectedRegion);

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
          oceanData={filteredOcean}
          biodiversityData={filteredBio}
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
              onClick={() => alert('Exporting normalized observations as CSV...')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
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
              {filteredOcean.slice(0, 8).map((item) => (
                <tr key={`tbl_ocn_${item.id}`} className="hover:bg-slate-900/50">
                  <td className="p-3 text-slate-500">#{item.id}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Ocean
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{item.dataset_id}</td>
                  <td className="p-3">{item.region_id}</td>
                  <td className="p-3">{item.latitude}°N, {item.longitude}°E</td>
                  <td className="p-3 text-cyan-400 font-semibold">{item.variable}</td>
                  <td className="p-3 text-right font-bold text-cyan-300">
                    {item.value} {item.unit}
                  </td>
                </tr>
              ))}
              {filteredBio.slice(0, 8).map((item) => (
                <tr key={`tbl_bio_${item.id}`} className="hover:bg-slate-900/50">
                  <td className="p-3 text-slate-500">#{item.id}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Bio
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{item.dataset_id}</td>
                  <td className="p-3">{item.region_id}</td>
                  <td className="p-3">{item.latitude}°N, {item.longitude}°E</td>
                  <td className="p-3 text-emerald-300 italic">{item.species_name}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">
                    {item.abundance} count
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
