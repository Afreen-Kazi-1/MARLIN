import React, { useState } from 'react';
import { Layers, Eye, EyeOff, MapPin, Thermometer, Droplets, Compass, Maximize2 } from 'lucide-react';
import { OceanMeasurement, BiodiversityObservation } from '../types';

interface MapViewerProps {
  oceanData: OceanMeasurement[];
  biodiversityData: BiodiversityObservation[];
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  oceanData,
  biodiversityData,
  selectedRegion,
  onSelectRegion
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSpeciesPins, setShowSpeciesPins] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [activeHoverPoint, setActiveHoverPoint] = useState<any | null>(null);

  // Geographic boundaries (Indian Ocean / Arabian Sea / Bay of Bengal)
  const minLat = 5;
  const maxLat = 25;
  const minLon = 55;
  const maxLon = 95;

  const latToPercent = (lat: number) => 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
  const lonToPercent = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * 100;

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-2xl flex flex-col">
      {/* Map Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg text-xs">
        <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-cyan-400 animate-spin-slow" />
          Spatial Intelligence Map
        </span>
        <span className="text-slate-600">|</span>

        {/* Region Selector */}
        <select
          value={selectedRegion}
          onChange={(e) => onSelectRegion(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="All">All Regions (Indian Ocean System)</option>
          <option value="Arabian_Sea">Arabian Sea (Area 51)</option>
          <option value="Bay_of_Bengal">Bay of Bengal</option>
        </select>
      </div>

      {/* Layer Toggles */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-xs">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
            showHeatmap ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Thermometer className="h-3.5 w-3.5" />
          <span>SST Heatmap</span>
        </button>

        <button
          onClick={() => setShowSpeciesPins(!showSpeciesPins)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
            showSpeciesPins ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>OBIS Species</span>
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
            showGrid ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>0.25° Grid</span>
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative flex-1 bg-slate-950/90 overflow-hidden cursor-crosshair">
        {/* Ocean Bathymetry & Region Canvas Overlay */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Coastal Line Reference Simulation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* India Coastline Outline */}
          <path
            d="M 45% 15% Q 52% 40% 55% 65% Q 62% 45% 72% 20%"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {/* Arabian Sea Label */}
          <text x="25%" y="45%" fill="#475569" fontSize="14" fontWeight="600" letterSpacing="2">
            ARABIAN SEA
          </text>
          {/* Bay of Bengal Label */}
          <text x="75%" y="45%" fill="#475569" fontSize="14" fontWeight="600" letterSpacing="2">
            BAY OF BENGAL
          </text>
          {/* Equatorial Indian Ocean */}
          <text x="50%" y="88%" fill="#334155" fontSize="12" fontWeight="600" letterSpacing="3">
            EQUATORIAL INDIAN OCEAN
          </text>
        </svg>

        {/* 0.25 Grid Lines Layer */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        )}

        {/* SST Heatmap Cells */}
        {showHeatmap &&
          oceanData.map((item, idx) => {
            const top = latToPercent(item.latitude);
            const left = lonToPercent(item.longitude);
            // Temperature color gradient: blue (26°C) to yellow (27.5°C) to red (28.5°C)
            const isHighTemp = item.value >= 28.0;
            const bgClass = isHighTemp
              ? 'bg-red-500/30 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
              : 'bg-cyan-500/20 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]';

            return (
              <div
                key={`ocean_${item.id}_${idx}`}
                onMouseEnter={() => setActiveHoverPoint({ ...item, type: 'ocean' })}
                onMouseLeave={() => setActiveHoverPoint(null)}
                style={{ top: `${top}%`, left: `${left}%` }}
                className={`absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all hover:scale-125 z-10 flex items-center justify-center cursor-pointer ${bgClass}`}
              >
                <span className="text-[9px] font-mono font-bold text-slate-100">
                  {item.value}°
                </span>
              </div>
            );
          })}

        {/* Species Occurrence Pins */}
        {showSpeciesPins &&
          biodiversityData.map((bio, idx) => {
            const top = latToPercent(bio.latitude);
            const left = lonToPercent(bio.longitude);

            return (
              <div
                key={`bio_${bio.id}_${idx}`}
                onMouseEnter={() => setActiveHoverPoint({ ...bio, type: 'biodiversity' })}
                onMouseLeave={() => setActiveHoverPoint(null)}
                style={{ top: `${top}%`, left: `${left}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-15 group cursor-pointer"
              >
                <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-125">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                </div>
              </div>
            );
          })}

        {/* Point Detail Tooltip Modal */}
        {activeHoverPoint && (
          <div
            style={{
              top: `${latToPercent(activeHoverPoint.latitude)}%`,
              left: `${Math.min(75, lonToPercent(activeHoverPoint.longitude))}%`
            }}
            className="absolute z-30 translate-y-4 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-cyan-500/40 shadow-2xl w-64 text-xs space-y-2 pointer-events-none"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-cyan-300 flex items-center gap-1">
                {activeHoverPoint.type === 'ocean' ? (
                  <>
                    <Thermometer className="h-3.5 w-3.5 text-cyan-400" /> Argo Observation
                  </>
                ) : (
                  <>
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" /> OBIS Record
                  </>
                )}
              </span>
              <span className="font-mono text-[10px] text-slate-400">{activeHoverPoint.grid_cell_id || 'Grid Node'}</span>
            </div>

            {activeHoverPoint.type === 'ocean' ? (
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Variable:</span>
                  <span className="font-semibold text-slate-200 capitalize">{activeHoverPoint.variable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Value:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {activeHoverPoint.value} {activeHoverPoint.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Depth:</span>
                  <span className="font-mono text-slate-300">{activeHoverPoint.depth_m} meters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="font-mono text-slate-400">
                    {activeHoverPoint.latitude}°N, {activeHoverPoint.longitude}°E
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Species:</span>
                  <span className="font-semibold text-emerald-300 italic">{activeHoverPoint.species_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Common Name:</span>
                  <span className="text-slate-200">{activeHoverPoint.common_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Abundance:</span>
                  <span className="font-mono font-bold text-emerald-400">{activeHoverPoint.abundance} count</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Region:</span>
                  <span className="text-slate-300">{activeHoverPoint.region_id}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Footer Legend */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span> Normal SST (26-27.5°C)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400 animate-pulse"></span> Thermal Anomaly (&gt;28°C)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> OBIS Species Occurrence
          </span>
        </div>
        <div className="font-mono text-slate-500">Spatial Grid: 0.25° x 0.25° (EPSG:4326 PostGIS)</div>
      </div>
    </div>
  );
};
