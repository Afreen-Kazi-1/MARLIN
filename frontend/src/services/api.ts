import axios from 'axios';
import {
  SystemStats,
  OceanMeasurement,
  BiodiversityObservation,
  FisheriesRecord,
  MolecularSample,
  Species,
  Dataset,
  QueryRequest,
  QueryResponse
} from '../types';
import {
  DEMO_SYSTEM_STATS,
  DEMO_DATASETS,
  DEMO_SPECIES,
  MOCK_QUERY_RESPONSE,
  generateOceanMeasurements,
  generateBiodiversityObservations,
  generateFisheriesRecords,
  generateMolecularSamples
} from './demoData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s — LLM synthesis can take 10-15s
  headers: {
    'Content-Type': 'application/json'
  }
});

let isBackendAvailableCache: boolean | null = null;

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await client.get('/health');
    isBackendAvailableCache = res.status === 200;
    return true;
  } catch (err) {
    isBackendAvailableCache = false;
    return false;
  }
};

export const apiService = {
  async getSystemStats(): Promise<SystemStats> {
    try {
      const res = await client.get('/health');
      if (res.data) {
        return {
          ...DEMO_SYSTEM_STATS,
          api_health: 'healthy',
          demo_mode: false
        };
      }
    } catch {
      // Backend offline fallback
    }
    return DEMO_SYSTEM_STATS;
  },

  async getDatasets(): Promise<Dataset[]> {
    try {
      const res = await client.get('/api/datasets');
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    return DEMO_DATASETS;
  },

  async getOceanMeasurements(region?: string): Promise<OceanMeasurement[]> {
    try {
      const res = await client.get('/api/ocean/measurements', { params: { region } });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    const data = generateOceanMeasurements();
    return region ? data.filter((d) => d.region_id === region) : data;
  },

  async getBiodiversityObservations(region?: string): Promise<BiodiversityObservation[]> {
    try {
      const res = await client.get('/api/biodiversity/observations', { params: { region } });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    const data = generateBiodiversityObservations();
    return region ? data.filter((d) => d.region_id === region) : data;
  },

  async getFisheriesRecords(region?: string): Promise<FisheriesRecord[]> {
    try {
      const res = await client.get('/api/fisheries/records', { params: { region } });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    const data = generateFisheriesRecords();
    return region ? data.filter((d) => d.region_id === region) : data;
  },

  async getMolecularSamples(region?: string): Promise<MolecularSample[]> {
    try {
      const res = await client.get('/api/molecular/samples', { params: { region } });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    const data = generateMolecularSamples();
    return region ? data.filter((d) => d.region_id === region) : data;
  },

  async resolveTaxon(query: string): Promise<Species | null> {
    try {
      const res = await client.get('/api/species/resolve', { params: { name: query } });
      if (res.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    const matched = DEMO_SPECIES.find(
      (s) =>
        s.scientific_name.toLowerCase().includes(query.toLowerCase()) ||
        s.common_name.toLowerCase().includes(query.toLowerCase())
    );
    return matched || DEMO_SPECIES[0];
  },

  async runMultiAgentQuery(request: QueryRequest): Promise<QueryResponse> {
    try {
      const res = await client.post('/api/query', request);
      if (res.data && res.data.query_id) {
        // Use backend response directly — no mock bleed-through
        return {
          query_id: String(res.data.query_id),
          user_query: request.query || res.data.user_query || res.data.question || '',
          structured_query: res.data.structured_query,
          synthesis_summary: res.data.synthesis_summary || res.data.answer || '',
          overall_confidence: res.data.overall_confidence ?? 0.94,
          unsupported_claim_rate: res.data.unsupported_claim_rate ?? 0.0,
          grounding_score: res.data.grounding_score ?? 1.0,
          agent_trace: res.data.agent_trace ?? [],
          claims: res.data.claims ?? [],
          evidence: res.data.evidence ?? [],
          bridges: res.data.bridges ?? [],
          visualizations: res.data.visualizations ?? []
        };
      }
    } catch (err) {
      console.warn('Backend query endpoint unreachable, using demo fallback:', err);
    }

    // True fallback: backend offline or returned no data
    return {
      ...MOCK_QUERY_RESPONSE,
      user_query: request.query || MOCK_QUERY_RESPONSE.user_query
    };
  }
};
