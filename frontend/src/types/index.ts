// Types definition for Unified Marine Intelligence & Ecosystem Reasoning Platform (MARLIN)

export type DomainType = 'oceanography' | 'fisheries' | 'biodiversity' | 'molecular';

export type ClaimType = 'trend' | 'anomaly' | 'correlation' | 'association';
export type ClaimStatus = 'supported' | 'partially_supported' | 'contradicted' | 'insufficient_evidence';
export type EvidenceRelationship = 'supported_by' | 'contradicted_by' | 'derived_from';

export interface Location {
  id: number;
  latitude: number;
  longitude: number;
  grid_cell_id: string;
  region_id: string;
}

export interface Species {
  id: number;
  aphia_id: number;
  scientific_name: string;
  canonical_name: string;
  common_name: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  taxonomy_json?: Record<string, any>;
}

export interface Dataset {
  id: string;
  name: string;
  domain: DomainType;
  description: string;
  source_url: string;
  license: string;
  version: string;
  retrieved_at: string;
  record_count: number;
  status: 'active' | 'synced' | 'pending';
}

export interface OceanMeasurement {
  id: number;
  dataset_id: string;
  location_id: number;
  latitude: number;
  longitude: number;
  grid_cell_id: string;
  timestamp: string;
  depth_m: number;
  variable: 'temperature' | 'salinity' | 'oxygen' | 'chlorophyll';
  value: number;
  unit: string;
  quality_flag: string;
  region_id: string;
}

export interface BiodiversityObservation {
  id: number;
  dataset_id: string;
  species_id: number;
  species_name: string;
  common_name: string;
  location_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  depth_m: number;
  observation_type: 'occurrence' | 'abundance_count' | 'biomass';
  abundance: number;
  count: number;
  region_id: string;
}

export interface FisheriesRecord {
  id: number;
  dataset_id: string;
  species_id: number;
  species_name: string;
  common_name: string;
  region_id: string;
  year: number;
  catch: number; // tonnes
  production: number; // aquaculture yield
  unit: string;
}

export interface MolecularSample {
  id: number;
  dataset_id: string;
  sample_identifier: string;
  location_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  species_id: number;
  species_name: string;
  abundance: number; // relative abundance ratio 0-1
  measurement_type: string;
  value: number;
  unit: string;
  region_id: string;
}

export interface QueryRequest {
  query: string;
  region_id?: string;
  time_range?: [number, number];
  domains?: DomainType[];
}

export interface EvidenceRecord {
  id: string;
  query_id: string;
  source_type: 'database_record' | 'publication_reference' | 'derived_analysis';
  source_id: string;
  evidence_text: string;
  numeric_value: number;
  method: string;
  confidence: number;
  domain: DomainType;
  metadata?: Record<string, any>;
}

export interface Claim {
  id: string;
  query_id: string;
  claim_text: string;
  claim_type: ClaimType;
  status: ClaimStatus;
  confidence: number; // 0.0 to 1.0
  domain: DomainType;
  evidence_ids: string[];
}

export interface ClaimEvidenceBridge {
  id: number;
  claim_id: string;
  evidence_id: string;
  relationship: EvidenceRelationship;
  weight: number;
}

export interface AgentExecutionStep {
  id: string;
  agent_name: 'Oceanography Agent' | 'Fisheries Agent' | 'Biodiversity Agent' | 'Molecular Agent' | 'Synthesis Agent';
  agent_icon: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  log_text: string;
  findings?: string[];
  metrics_analyzed?: number;
}

export interface QueryResponse {
  query_id: string;
  user_query: string;
  structured_query: {
    intent: string;
    regions: string[];
    target_species: string[];
    variables: string[];
    time_window: string;
  };
  synthesis_summary: string;
  overall_confidence: number; // 0.0 to 1.0
  unsupported_claim_rate: number; // target 0.0
  grounding_score: number;
  agent_trace: AgentExecutionStep[];
  claims: Claim[];
  evidence: EvidenceRecord[];
  bridges: ClaimEvidenceBridge[];
  visualizations: Array<{
    type: 'scatter_plot' | 'line_chart' | 'bar_chart' | 'depth_profile';
    title: string;
    x_axis: string;
    y_axis: string;
    data: Array<Record<string, any>>;
  }>;
}

export interface SystemStats {
  total_observations: number;
  ocean_measurements_count: number;
  biodiversity_records_count: number;
  fisheries_records_count: number;
  molecular_samples_count: number;
  canonical_species_count: number;
  dataset_count: number;
  active_queries_count: number;
  unsupported_claim_rate: number;
  api_health: 'healthy' | 'degraded' | 'offline';
  demo_mode: boolean;
}
