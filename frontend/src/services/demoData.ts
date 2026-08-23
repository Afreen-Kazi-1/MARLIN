import {
  SystemStats,
  OceanMeasurement,
  BiodiversityObservation,
  FisheriesRecord,
  MolecularSample,
  Species,
  Dataset,
  QueryResponse,
  Claim,
  EvidenceRecord,
  ClaimEvidenceBridge,
  AgentExecutionStep
} from '../types';

export const DEMO_SPECIES: Species[] = [
  {
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
  },
  {
    id: 102,
    aphia_id: 126986,
    scientific_name: 'Sardinella longiceps',
    canonical_name: 'Sardinella longiceps',
    common_name: 'Indian Oil Sardine',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Teleostei',
    order: 'Clupeiformes',
    family: 'Dorosomatidae',
    genus: 'Sardinella',
    species: 'longiceps'
  },
  {
    id: 103,
    aphia_id: 127026,
    scientific_name: 'Katsuwonus pelamis',
    canonical_name: 'Katsuwonus pelamis',
    common_name: 'Skipjack Tuna',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Teleostei',
    order: 'Scombriformes',
    family: 'Scombridae',
    genus: 'Katsuwonus',
    species: 'pelamis'
  },
  {
    id: 104,
    aphia_id: 288301,
    scientific_name: 'Synechococcus sp.',
    canonical_name: 'Synechococcus',
    common_name: 'Picocyanobacteria',
    kingdom: 'Bacteria',
    phylum: 'Cyanobacteriota',
    class: 'Cyanophyceae',
    order: 'Synechococcales',
    family: 'Synechococcaceae',
    genus: 'Synechococcus',
    species: 'sp.'
  },
  {
    id: 105,
    aphia_id: 345678,
    scientific_name: 'Pelagibacter ubique',
    canonical_name: 'Pelagibacter ubique',
    common_name: 'SAR11 Clade Bacteria',
    kingdom: 'Bacteria',
    phylum: 'Pseudomonadota',
    class: 'Alphaproteobacteria',
    order: 'Pelagibacterales',
    family: 'Pelagibacteraceae',
    genus: 'Pelagibacter',
    species: 'ubique'
  }
];

export const DEMO_DATASETS: Dataset[] = [
  {
    id: 'argo_floats_global',
    name: 'Argo Float Global Ocean Profiles',
    domain: 'oceanography',
    description: 'Autonomous drifting profiling floats monitoring upper 2,000m ocean temperature & salinity.',
    source_url: 'https://argo.ucsd.edu/',
    license: 'CC-BY-4.0',
    version: '2026.1',
    retrieved_at: '2026-08-20T10:00:00Z',
    record_count: 142500,
    status: 'synced'
  },
  {
    id: 'obis_occurrences_io',
    name: 'OBIS Marine Biodiversity Records',
    domain: 'biodiversity',
    description: 'Ocean Biodiversity Information System records for Indian Ocean species distributions.',
    source_url: 'https://obis.org/',
    license: 'CC-BY-4.0',
    version: 'v2.8',
    retrieved_at: '2026-08-21T14:30:00Z',
    record_count: 89400,
    status: 'synced'
  },
  {
    id: 'fao_fishstat_area51',
    name: 'FAO FishStat Capture Production Area 51',
    domain: 'fisheries',
    description: 'FAO Western Indian Ocean annual commercial fisheries landings and aquaculture yield statistics.',
    source_url: 'https://www.fao.org/fishery/fishstat/',
    license: 'FAO Open Access',
    version: '2025.2',
    retrieved_at: '2026-08-19T09:15:00Z',
    record_count: 34200,
    status: 'synced'
  },
  {
    id: 'mgnify_metagenomics_sea',
    name: 'MGnify Marine Metagenomic Amplicon Profiles',
    domain: 'molecular',
    description: 'EMBL-EBI MGnify 16S/18S rRNA amplicon sequencing and OTU relative abundance profiles.',
    source_url: 'https://www.ebi.ac.uk/metagenomics/',
    license: 'EMBL-EBI Terms of Use',
    version: 'v5.0',
    retrieved_at: '2026-08-22T16:45:00Z',
    record_count: 51800,
    status: 'synced'
  }
];

export const DEMO_SYSTEM_STATS: SystemStats = {
  total_observations: 317900,
  ocean_measurements_count: 142500,
  biodiversity_records_count: 89400,
  fisheries_records_count: 34200,
  molecular_samples_count: 51800,
  canonical_species_count: 12480,
  dataset_count: 4,
  active_queries_count: 1284,
  unsupported_claim_rate: 0.0,
  api_health: 'healthy',
  demo_mode: true
};

// Generate realistic spatial coordinates around Arabian Sea & Bay of Bengal
export const generateOceanMeasurements = (): OceanMeasurement[] => {
  const measurements: OceanMeasurement[] = [];
  const baseLat = 15.0;
  const baseLon = 68.0;
  let idCounter = 1;

  for (let i = 0; i < 40; i++) {
    const lat = baseLat + (Math.sin(i * 0.5) * 6);
    const lon = baseLon + (Math.cos(i * 0.4) * 8);
    const temp = 27.2 + Math.sin(i * 0.3) * 2.1 + (Math.random() * 0.4);
    const salinity = 35.8 + Math.cos(i * 0.2) * 0.8;
    const depth = (i % 4) * 50 + 10;

    measurements.push({
      id: idCounter++,
      dataset_id: 'argo_floats_global',
      location_id: 200 + i,
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      grid_cell_id: `G_${Math.floor(lat)}_${Math.floor(lon)}`,
      timestamp: new Date(Date.now() - i * 86400000 * 3).toISOString(),
      depth_m: depth,
      variable: i % 2 === 0 ? 'temperature' : 'salinity',
      value: Number((i % 2 === 0 ? temp : salinity).toFixed(2)),
      unit: i % 2 === 0 ? '°C' : 'PSU',
      quality_flag: 'valid',
      region_id: lon < 78 ? 'Arabian_Sea' : 'Bay_of_Bengal'
    });
  }
  return measurements;
};

export const generateBiodiversityObservations = (): BiodiversityObservation[] => {
  const observations: BiodiversityObservation[] = [];
  const speciesList = DEMO_SPECIES;
  let id = 1;

  for (let i = 0; i < 30; i++) {
    const sp = speciesList[i % speciesList.length];
    const lat = 12.0 + Math.sin(i * 0.4) * 5;
    const lon = 65.0 + Math.cos(i * 0.5) * 10;
    const abundance = Math.floor(15 + Math.random() * 85);

    observations.push({
      id: id++,
      dataset_id: 'obis_occurrences_io',
      species_id: sp.id,
      species_name: sp.scientific_name,
      common_name: sp.common_name,
      location_id: 300 + i,
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      timestamp: new Date(Date.now() - i * 86400000 * 5).toISOString(),
      depth_m: Math.floor(Math.random() * 150) + 5,
      observation_type: 'abundance_count',
      abundance: abundance,
      count: abundance,
      region_id: lon < 78 ? 'Arabian_Sea' : 'Bay_of_Bengal'
    });
  }
  return observations;
};

export const generateFisheriesRecords = (): FisheriesRecord[] => {
  const records: FisheriesRecord[] = [];
  const startYear = 2010;
  let id = 1;

  for (let yr = startYear; yr <= 2025; yr++) {
    // Yellowfin Tuna (shows drop as temperature increases)
    const yftCatch = Math.max(12000, 48000 - (yr - 2010) * 1800 + Math.sin(yr) * 2000);
    records.push({
      id: id++,
      dataset_id: 'fao_fishstat_area51',
      species_id: 101,
      species_name: 'Thunnus albacares',
      common_name: 'Yellowfin Tuna',
      region_id: 'Arabian_Sea',
      year: yr,
      catch: Number(yftCatch.toFixed(0)),
      production: Number((yftCatch * 0.05).toFixed(0)),
      unit: 'tonnes'
    });

    // Indian Oil Sardine
    const iosCatch = 32000 + Math.cos(yr * 0.8) * 8000;
    records.push({
      id: id++,
      dataset_id: 'fao_fishstat_area51',
      species_id: 102,
      species_name: 'Sardinella longiceps',
      common_name: 'Indian Oil Sardine',
      region_id: 'Arabian_Sea',
      year: yr,
      catch: Number(iosCatch.toFixed(0)),
      production: Number((iosCatch * 0.02).toFixed(0)),
      unit: 'tonnes'
    });
  }
  return records;
};

export const generateMolecularSamples = (): MolecularSample[] => {
  const samples: MolecularSample[] = [];
  let id = 1;
  const microbialTaxa = [
    { id: 104, name: 'Synechococcus sp.', baseAbundance: 0.38 },
    { id: 105, name: 'Pelagibacter ubique', baseAbundance: 0.42 },
    { id: 106, name: 'Prochlorococcus marinus', baseAbundance: 0.15 }
  ];

  for (let i = 0; i < 20; i++) {
    const taxon = microbialTaxa[i % microbialTaxa.length];
    const lat = 14.5 + (i * 0.3);
    const lon = 67.2 + (i * 0.4);
    const ratio = Math.min(0.95, Math.max(0.05, taxon.baseAbundance + (Math.random() * 0.1 - 0.05)));

    samples.push({
      id: id++,
      dataset_id: 'mgnify_metagenomics_sea',
      sample_identifier: `MGYS0000${5400 + i}`,
      location_id: 400 + i,
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      timestamp: new Date(Date.now() - i * 86400000 * 2).toISOString(),
      species_id: taxon.id,
      species_name: taxon.name,
      abundance: Number(ratio.toFixed(4)),
      measurement_type: '16S_amplicon_OTU',
      value: Math.floor(ratio * 12500),
      unit: 'reads_ratio',
      region_id: lon < 78 ? 'Arabian_Sea' : 'Bay_of_Bengal'
    });
  }
  return samples;
};

export const MOCK_QUERY_RESPONSE: QueryResponse = {
  query_id: 'q_7f8a91c2-3e4b-4a5d-910e-8f2a6b3c4d5e',
  user_query: 'How has the 0.8°C sea surface temperature rise in the Arabian Sea affected Yellowfin Tuna catch rates and picocyanobacteria abundance over the last decade?',
  structured_query: {
    intent: 'ecosystem_correlation_analysis',
    regions: ['Arabian_Sea'],
    target_species: ['Thunnus albacares', 'Synechococcus sp.'],
    variables: ['temperature', 'catch_tonnes', 'otu_abundance'],
    time_window: '2010-2025'
  },
  synthesis_summary:
    'Empirical multi-agent synthesis confirms a statistically significant negative correlation (Pearson r = -0.84, p < 0.001) between sea surface temperature (SST) warming (+0.82°C over baseline) and Yellowfin Tuna (Thunnus albacares) commercial catch volume in the Arabian Sea. Concurrently, MGnify metagenomic amplicon sequencing reveals a +24.5% shift toward thermotolerant picocyanobacteria (Synechococcus sp.) in upper surface waters.',
  overall_confidence: 0.94,
  unsupported_claim_rate: 0.0,
  grounding_score: 1.0,
  agent_trace: [
    {
      id: 'step_1',
      agent_name: 'Oceanography Agent',
      agent_icon: '🌊',
      status: 'completed',
      timestamp: '2026-08-23T16:00:01Z',
      log_text: 'Fetched 14,250 Argo profile records across Arabian Sea grid cells (G_14_68 to G_18_72). Computed rolling 10-year SST mean baseline.',
      findings: [
        'Arabian Sea upper 50m mean SST rose from 27.42°C (2010) to 28.24°C (2025) (+0.82°C anomaly, z-score = 2.41).',
        'Salinity maintained a stable range of 35.8 - 36.2 PSU.'
      ],
      metrics_analyzed: 14250
    },
    {
      id: 'step_2',
      agent_name: 'Fisheries Agent',
      agent_icon: '🐟',
      status: 'completed',
      timestamp: '2026-08-23T16:00:02Z',
      log_text: 'Queried FAO FishStat Area 51 landings for Thunnus albacares (AphiaID: 127027). Executed linear regression model.',
      findings: [
        'Annual landings declined from 46,200 tonnes (2010) to 21,400 tonnes (2025) (-53.6% net change).',
        'Fisheries mortality index stabilized; catch drop aligns with temperature migration out of surface mixed layer.'
      ],
      metrics_analyzed: 3420
    },
    {
      id: 'step_3',
      agent_name: 'Biodiversity Agent',
      agent_icon: '🐋',
      status: 'completed',
      timestamp: '2026-08-23T16:00:03Z',
      log_text: 'Audited OBIS occurrence records for thermal range shifting.',
      findings: [
        'Yellowfin Tuna occurrences shifted southward toward deeper thermocline depth (>80m) during peak thermal anomalies.',
        'Zero false spatial range extrapolations detected.'
      ],
      metrics_analyzed: 8940
    },
    {
      id: 'step_4',
      agent_name: 'Molecular Agent',
      agent_icon: '🧬',
      status: 'completed',
      timestamp: '2026-08-23T16:00:04Z',
      log_text: 'Analyzed MGnify 16S rRNA amplicon relative abundance (OTU profiles MGYS00005400-5420).',
      findings: [
        'Synechococcus sp. OTU relative abundance increased from 0.28 to 0.41 in warm surface anomaly cells (+24.5% relative change).',
        'SAR11 clade (Pelagibacter ubique) maintained steady 0.38 background ratio.'
      ],
      metrics_analyzed: 5180
    },
    {
      id: 'step_5',
      agent_name: 'Synthesis Agent',
      agent_icon: '🤖',
      status: 'completed',
      timestamp: '2026-08-23T16:00:05Z',
      log_text: 'Orchestrated cross-domain claim verification, evaluated evidence bridge weights, and performed strict hallucination audit.',
      findings: [
        '4 atomic claims generated. 4 supported directly by database records with high confidence (weight >= 0.90).',
        'Unsupported Claim Rate: 0.0% (Zero hallucinated URLs or unbacked claims).'
      ],
      metrics_analyzed: 31790
    }
  ],
  claims: [
    {
      id: 'claim_01',
      query_id: 'q_7f8a91c2-3e4b-4a5d-910e-8f2a6b3c4d5e',
      claim_text: 'Arabian Sea sea surface temperature (0-50m) increased by +0.82°C over the 2010-2025 baseline observation period.',
      claim_type: 'trend',
      status: 'supported',
      confidence: 0.98,
      domain: 'oceanography',
      evidence_ids: ['ev_01']
    },
    {
      id: 'claim_02',
      query_id: 'q_7f8a91c2-3e4b-4a5d-910e-8f2a6b3c4d5e',
      claim_text: 'Yellowfin Tuna (Thunnus albacares) annual commercial catch in FAO Area 51 decreased by 53.6% concurrently with thermal warming.',
      claim_type: 'correlation',
      status: 'supported',
      confidence: 0.94,
      domain: 'fisheries',
      evidence_ids: ['ev_02', 'ev_01']
    },
    {
      id: 'claim_03',
      query_id: 'q_7f8a91c2-3e4b-4a5d-910e-8f2a6b3c4d5e',
      claim_text: 'OBIS occurrence data confirms Yellowfin Tuna spatial migration into deeper thermocline waters (>80m) during thermal spikes.',
      claim_type: 'association',
      status: 'supported',
      confidence: 0.91,
      domain: 'biodiversity',
      evidence_ids: ['ev_03']
    },
    {
      id: 'claim_04',
      query_id: 'q_7f8a91c2-3e4b-4a5d-910e-8f2a6b3c4d5e',
      claim_text: 'Metagenomic sequencing exhibits a 24.5% increase in thermotolerant Synechococcus sp. OTU relative abundance in warming waters.',
      claim_type: 'anomaly',
      status: 'supported',
      confidence: 0.93,
      domain: 'molecular',
      evidence_ids: ['ev_04']
    }
  ],
  evidence: [
    {
      id: 'ev_01',
      query_id: 'q_7f8a91c2-3e4b-4a5d-910e-8f2a6b3c4d5e',
      source_type: 'database_record',
      source_id: 'argo_floats_global:G_15_68',
      evidence_text: 'Argo profiling float array measurements recorded mean SST rise from 27.42°C to 28.24°C across 14,250 observations.',
      numeric_value: 0.82,
      method: 'rolling_mean_anomaly_zscore',
      confidence: 0.98,
      domain: 'oceanography'
    },
    {
      id: 'ev_02',
      query_id: 'q_7f8a91c2-3e4b-4a5d-910e-8f2a6b3c4d5e',
      source_type: 'database_record',
      source_id: 'fao_fishstat_area51:127027',
      evidence_text: 'FAO FishStat Area 51 statistics show landings drop from 46,200 t (2010) to 21,400 t (2025) (p < 0.001).',
      numeric_value: -24800,
      method: 'pearson_correlation_linear_reg',
      confidence: 0.95,
      domain: 'fisheries'
    },
    {
      id: 'ev_03',
      query_id: 'q_7f8a91c2-3e4b-4a5d-910e-8f2a6b3c4d5e',
      source_type: 'database_record',
      source_id: 'obis_occurrences_io:127027',
      evidence_text: 'OBIS depth stratification records show average occurrence depth shifted from 35m to 85m in high SST grid cells.',
      numeric_value: 85.0,
      method: 'spatial_depth_histogram',
      confidence: 0.91,
      domain: 'biodiversity'
    },
    {
      id: 'ev_04',
      query_id: 'q_7f8a91c2-3e4b-4a5d-910e-8f2a6b3c4d5e',
      source_type: 'database_record',
      source_id: 'mgnify_metagenomics_sea:MGYS00005400',
      evidence_text: '16S amplicon OTU relative abundance for Synechococcus sp. rose from 0.28 to 0.41 (reads_ratio).',
      numeric_value: 0.41,
      method: 'otu_relative_abundance_ratio',
      confidence: 0.93,
      domain: 'molecular'
    }
  ],
  bridges: [
    { id: 1, claim_id: 'claim_01', evidence_id: 'ev_01', relationship: 'supported_by', weight: 0.98 },
    { id: 2, claim_id: 'claim_02', evidence_id: 'ev_02', relationship: 'supported_by', weight: 0.95 },
    { id: 3, claim_id: 'claim_02', evidence_id: 'ev_01', relationship: 'derived_from', weight: 0.90 },
    { id: 4, claim_id: 'claim_03', evidence_id: 'ev_03', relationship: 'supported_by', weight: 0.91 },
    { id: 5, claim_id: 'claim_04', evidence_id: 'ev_04', relationship: 'supported_by', weight: 0.93 }
  ],
  visualizations: [
    {
      type: 'scatter_plot',
      title: 'Sea Surface Temperature vs. Yellowfin Tuna Abundance',
      x_axis: 'SST (°C)',
      y_axis: 'Abundance Index (catch tonnes / 100)',
      data: [
        { x: 27.2, y: 462, year: 2010 },
        { x: 27.4, y: 440, year: 2012 },
        { x: 27.6, y: 395, year: 2015 },
        { x: 27.9, y: 330, year: 2018 },
        { x: 28.1, y: 265, year: 2021 },
        { x: 28.4, y: 214, year: 2025 }
      ]
    },
    {
      type: 'line_chart',
      title: 'Decadal Trend: SST Anomaly vs Commercial Fisheries Landings',
      x_axis: 'Year',
      y_axis: 'Metrics',
      data: [
        { year: 2010, sst: 27.42, yft_catch: 46200, sardine_catch: 32400 },
        { year: 2013, sst: 27.58, yft_catch: 41800, sardine_catch: 34100 },
        { year: 2016, sst: 27.75, yft_catch: 37500, sardine_catch: 31800 },
        { year: 2019, sst: 27.92, yft_catch: 31200, sardine_catch: 35600 },
        { year: 2022, sst: 28.10, yft_catch: 25800, sardine_catch: 33200 },
        { year: 2025, sst: 28.24, yft_catch: 21400, sardine_catch: 36500 }
      ]
    },
    {
      type: 'depth_profile',
      title: 'Vertical Temperature & Salinity Profile (Arabian Sea)',
      x_axis: 'Depth (m)',
      y_axis: 'Measurements',
      data: [
        { depth: 5, temp: 28.2, salinity: 35.8 },
        { depth: 25, temp: 27.9, salinity: 35.9 },
        { depth: 50, temp: 26.4, salinity: 36.1 },
        { depth: 100, temp: 22.1, salinity: 35.7 },
        { depth: 200, temp: 17.5, salinity: 35.4 },
        { depth: 500, temp: 11.2, salinity: 35.1 },
        { depth: 1000, temp: 6.8, salinity: 34.8 }
      ]
    }
  ]
};
