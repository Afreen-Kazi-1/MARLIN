import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Explorer } from './pages/Explorer';
import { AgentChat } from './components/AgentChat';
import { EcosystemGraph } from './components/EcosystemGraph';
import { TaxonomyResolver } from './pages/TaxonomyResolver';
import { apiService } from './services/api';
import {
  SystemStats,
  OceanMeasurement,
  BiodiversityObservation,
  FisheriesRecord,
  MolecularSample,
  QueryResponse
} from './types';
import { DEMO_SYSTEM_STATS, MOCK_QUERY_RESPONSE } from './services/demoData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stats, setStats] = useState<SystemStats>(DEMO_SYSTEM_STATS);
  const [oceanData, setOceanData] = useState<OceanMeasurement[]>([]);
  const [biodiversityData, setBiodiversityData] = useState<BiodiversityObservation[]>([]);
  const [fisheriesData, setFisheriesData] = useState<FisheriesRecord[]>([]);
  const [molecularData, setMolecularData] = useState<MolecularSample[]>([]);
  const [currentQueryResponse, setCurrentQueryResponse] = useState<QueryResponse | null>(MOCK_QUERY_RESPONSE);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const s = await apiService.getSystemStats();
        setStats(s);

        const ocean = await apiService.getOceanMeasurements();
        setOceanData(ocean);

        const bio = await apiService.getBiodiversityObservations();
        setBiodiversityData(bio);

        const fish = await apiService.getFisheriesRecords();
        setFisheriesData(fish);

        const mol = await apiService.getMolecularSamples();
        setMolecularData(mol);
      } catch (err) {
        console.error('Error loading MARLIN frontend state:', err);
      }
    };
    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Header */}
      <Header
        stats={stats}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* View Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              oceanData={oceanData}
              biodiversityData={biodiversityData}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'explorer' && (
            <Explorer
              oceanData={oceanData}
              biodiversityData={biodiversityData}
              fisheriesData={fisheriesData}
              molecularData={molecularData}
            />
          )}

          {activeTab === 'workspace' && (
            <AgentChat
              onResponseReceived={(res) => {
                setCurrentQueryResponse(res);
                setActiveTab('workspace');
              }}
              currentResponse={currentQueryResponse}
            />
          )}

          {activeTab === 'graph' && (
            <EcosystemGraph
              claims={currentQueryResponse?.claims}
              evidence={currentQueryResponse?.evidence}
              bridges={currentQueryResponse?.bridges}
              queryText={currentQueryResponse?.user_query}
            />
          )}

          {activeTab === 'taxonomy' && <TaxonomyResolver />}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-3 text-center text-xs text-slate-400 bg-slate-950/80 backdrop-blur-md">
        Unified Marine Intelligence & Ecosystem Reasoning Platform • SIH PS 20 • Branch: <span className="font-mono text-cyan-400">Frontend-Mudit</span>
      </footer>
    </div>
  );
}
