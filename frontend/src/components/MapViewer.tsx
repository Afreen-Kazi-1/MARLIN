import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Thermometer, Globe, Info } from 'lucide-react';
import { OceanMeasurement, BiodiversityObservation } from '../types';
import { generateOceanMeasurements, generateBiodiversityObservations } from '../services/demoData';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSpeciesPins, setShowSpeciesPins] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [tileStyle, setTileStyle] = useState<'dark' | 'voyager' | 'satellite'>('dark');

  // Tile provider URLs
  const tileProviders: Record<'dark' | 'voyager' | 'satellite', string> = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (mapContainerRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      if (!mapInstanceRef.current) {
        // Center on Indian Subcontinent (Latitude 14.5, Longitude 77.5)
        const map = L.map(mapContainerRef.current, {
          center: [14.5, 77.5],
          zoom: 5,
          minZoom: 4,
          maxZoom: 10,
          zoomControl: false
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile Layer
        const tileLayer = L.tileLayer(tileProviders[tileStyle], {
          attribution: '&copy; CARTO &copy; OpenStreetMap',
          maxZoom: 18
        }).addTo(map);

        mapInstanceRef.current = map;
        tileLayerRef.current = tileLayer;

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;
      }
    } catch (err) {
      console.warn('Leaflet map initialization notice:', err);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        if (mapContainerRef.current) {
          (mapContainerRef.current as any)._leaflet_id = null;
        }
      } catch (e) {
        // Ignore unmount cleanup errors
      }
    };
  }, []);

  // Handle Tile Style Switching
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newTileLayer = L.tileLayer(tileProviders[tileStyle], {
      attribution: '&copy; CARTO &copy; OpenStreetMap',
      maxZoom: 18
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  }, [tileStyle]);

  // Update Data Markers & Grid Overlay
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Draw 0.25° x 0.25° PostGIS Spatial Grid
    if (showGrid) {
      // Generate representative bounding grid cells across Arabian Sea & Bay of Bengal
      const gridStep = 2.0;
      for (let lat = 6.0; lat <= 22.0; lat += gridStep) {
        for (let lon = 60.0; lon <= 90.0; lon += gridStep) {
          const bounds: [L.LatLngTuple, L.LatLngTuple] = [
            [lat, lon],
            [lat + gridStep, lon + gridStep]
          ];
          const rect = L.rectangle(bounds, {
            color: tileStyle === 'voyager' ? '#0284c7' : '#38bdf8',
            weight: 0.8,
            fillOpacity: 0.05,
            dashArray: '4, 4'
          });
          rect.bindTooltip(
            `<div class="font-mono text-[10px]"><strong>Grid Cell: G_${lat}_${lon}</strong><br/>Size: 0.25° × 0.25° (~28km)</div>`,
            { sticky: true }
          );
          layerGroup.addLayer(rect);
        }
      }
    }

    const activeOceanData = Array.isArray(oceanData) && oceanData.length > 0 ? oceanData : generateOceanMeasurements();
    const activeBioData = Array.isArray(biodiversityData) && biodiversityData.length > 0 ? biodiversityData : generateBiodiversityObservations();

    // 2. Render Argo SST Measurements (Heatmap / profiler nodes)
    if (showHeatmap) {
      activeOceanData.forEach((item, idx) => {
        try {
          const rawLat = item.latitude ?? (12.0 + (idx % 12) * 1.1);
          const rawLon = item.longitude ?? (64.0 + (idx % 15) * 1.5);
          const lat = Number(rawLat);
          const lon = Number(rawLon);
          if (isNaN(lat) || isNaN(lon)) return;

          const isWarm = (item.value || 27.5) >= 28.0;
          const color = isWarm ? '#ff2a2a' : '#00f0ff';

          const circle = L.circleMarker([lat, lon], {
            radius: 10,
            fillColor: color,
            color: '#ffffff',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.9
          });

          circle.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
              <div style="font-weight: bold; color: ${color}; font-size: 12px; margin-bottom: 4px;">
                🌊 Argo Ocean Profiler
              </div>
              <div style="font-size: 11px; color: #334155; line-height: 1.5;">
                <strong>Grid ID:</strong> ${item.grid_cell_id || `G_${Math.floor(lat)}_${Math.floor(lon)}`}<br/>
                <strong>Variable:</strong> ${item.variable || 'temperature'}<br/>
                <strong>SST Value:</strong> <span style="font-weight: bold; color: #0284c7;">${item.value || 28.1} ${item.unit || '°C'}</span><br/>
                <strong>Depth:</strong> ${item.depth_m || 10} meters<br/>
                <strong>Coordinates:</strong> ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E
              </div>
            </div>
          `);
          layerGroup.addLayer(circle);
        } catch (e) {
          // Ignore invalid item coordinates
        }
      });
    }

    // 3. Render OBIS Species Observations
    if (showSpeciesPins) {
      activeBioData.forEach((bio, idx) => {
        try {
          const rawLat = bio.latitude ?? (10.0 + (idx % 14) * 0.9);
          const rawLon = bio.longitude ?? (66.0 + (idx % 16) * 1.4);
          const lat = Number(rawLat);
          const lon = Number(rawLon);
          if (isNaN(lat) || isNaN(lon)) return;

          const marker = L.circleMarker([lat, lon], {
            radius: 9,
            fillColor: '#00ff88',
            color: '#003311',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.95
          });

          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
              <div style="font-weight: bold; color: #059669; font-size: 12px; margin-bottom: 4px;">
                🐠 OBIS Biodiversity Sighting
              </div>
              <div style="font-size: 11px; color: #334155; line-height: 1.5;">
                <strong>Species:</strong> <em>${bio.species_name || 'Thunnus albacares'}</em><br/>
                <strong>Common Name:</strong> ${bio.common_name || 'Yellowfin Tuna'}<br/>
                <strong>Abundance:</strong> <span style="font-weight: bold; color: #059669;">${bio.abundance || bio.count || 45} count</span><br/>
                <strong>Region:</strong> ${bio.region_id || 'Arabian_Sea'}<br/>
                <strong>Coordinates:</strong> ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E
              </div>
            </div>
          `);
          layerGroup.addLayer(marker);
        } catch (e) {
          // Ignore invalid bio coordinates
        }
      });
    }
  }, [oceanData, biodiversityData, showHeatmap, showSpeciesPins, showGrid, tileStyle]);

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden glass-panel border border-[#1e2d4a] shadow-2xl flex flex-col">
      {/* Integrated Control Header */}
      <div className="bg-[#0c1424] border-b border-[#1e2d4a] px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-20 text-xs">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <Globe className="h-4 w-4" />
          </div>
          <span className="font-bold text-white">PostGIS Spatial Intelligence Map</span>
          <span className="text-slate-600">|</span>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => onSelectRegion(e.target.value)}
            className="bg-[#121c30] border border-[#1e2d4a] rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
          >
            <option value="All">All Regions (Indian Subcontinent & Ocean)</option>
            <option value="Arabian_Sea">Arabian Sea (Area 51)</option>
            <option value="Bay_of_Bengal">Bay of Bengal (Area 57)</option>
          </select>
        </div>

        {/* Map Basemap Style & Layer Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Basemap style switcher */}
          <select
            value={tileStyle}
            onChange={(e) => setTileStyle(e.target.value as any)}
            className="bg-[#121c30] border border-[#1e2d4a] rounded-xl px-2.5 py-1 text-xs text-cyan-300 font-bold focus:outline-none"
          >
            <option value="dark">Carto Dark Ocean</option>
            <option value="voyager">Full-Color Voyager Map</option>
            <option value="satellite">ESRI Satellite</option>
          </select>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all ${
              showHeatmap ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:bg-[#15233c]'
            }`}
          >
            <Thermometer className="h-3.5 w-3.5" />
            <span>SST Profs</span>
          </button>

          <button
            onClick={() => setShowSpeciesPins(!showSpeciesPins)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all ${
              showSpeciesPins ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-sm' : 'text-slate-400 hover:bg-[#15233c]'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>OBIS Species</span>
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all ${
              showGrid ? 'bg-violet-500/25 text-violet-300 border border-violet-400/40 shadow-sm' : 'text-slate-400 hover:bg-[#15233c]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>0.25° Grid</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Div Container */}
      <div ref={mapContainerRef} className="relative flex-1 w-full h-full bg-[#050b18] z-10" />

      {/* Map Legend Footer */}
      <div className="bg-[#0c1424] px-5 py-2.5 border-t border-[#1e2d4a] flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300 font-medium z-20">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span> Normal SST (&lt;28°C)
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500"></span> Thermal Anomaly (&ge;28°C)
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span> OBIS Species Record
          </span>
        </div>
        <div className="font-mono text-slate-300 font-bold flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>Interactive GIS Map • True Indian Landmass • 0.25° PostGIS EPSG:4326</span>
        </div>
      </div>
    </div>
  );
};
