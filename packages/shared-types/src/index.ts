export type TerritoryKind = "state" | "autonomous-community" | "autonomous-city";
export type ScopeType = "national" | "regional";
export type SignalType = "official" | "media" | "social" | "budget" | "election" | "parliamentary";
export type AgentHealth = "online" | "training" | "queued";
export type TrendDirection = "up" | "flat" | "down";
export type SearchResultKind = "territory" | "party" | "politician" | "topic";
export type ConnectorArea = "boe" | "borme" | "congreso" | "senado" | "autonomico" | "local" | "eu" | "hacienda" | "empleo" | "justicia" | "regulador" | "financiero";
export type PoliticalCensusLayerId =
  | "gobierno-central"
  | "congreso"
  | "senado"
  | "parlamentos-autonomicos"
  | "gobiernos-autonomicos"
  | "diputaciones"
  | "cabildos-consejos"
  | "ayuntamientos"
  | "organos-constitucionales";
export type PoliticalCensusLayerStatus = "live" | "partial" | "planned" | "degraded";
export type ParliamentaryChamber = "congreso" | "senado";
export type TerritorialSourceType = "government" | "parliament" | "gazette";
export type AuxiliaryDatasetId =
  | "materias"
  | "ambitos"
  | "estados-consolidacion"
  | "departamentos"
  | "rangos"
  | "relaciones-anteriores"
  | "relaciones-posteriores";

export interface Territory {
  id: string;
  slug: string;
  name: string;
  kind: TerritoryKind;
  shortCode: string;
  seat: string;
  strategicFocus: string;
  pulseScore: number;
  monitoredInstitutions: string[];
  officialBulletinUrl?: string;
  featuredPartySlugs?: string[];
  featuredPoliticianSlugs?: string[];
}

export interface Party {
  id: string;
  slug: string;
  officialName: string;
  shortName: string;
  acronym: string;
  scopeType: ScopeType;
  territorySlug?: string;
  ideology?: string;
  officialWebsite?: string;
  positioning: string;
  highlightTerritories?: string[];
  featuredPoliticianSlugs?: string[];
}

export interface Politician {
  id: string;
  slug: string;
  fullName: string;
  shortName: string;
  territorySlug: string;
  currentPartySlug: string;
  parliamentaryGroup?: string;
  constituency?: string;
  currentRoleSummary: string;
  biography: string;
  sourceOfTruthUrl: string;
  signalFocus: string[];
}

export interface TimelineItem {
  id: string;
  title: string;
  summary: string;
  sourceType: SignalType;
  territorySlug: string;
  topic: string;
  publishedAt: string;
  traceability: string;
  impactScore: number;
  sourceUrl?: string;
  partySlugs?: string[];
  politicianSlugs?: string[];
}

export interface OfficialBulletinItem {
  id: string;
  title: string;
  summary: string;
  publicationDate: string;
  documentUrl: string;
  category: string;
  ministryOrBody: string;
  impactScore: number;
  affectedTerritories: string[];
  partySlugs?: string[];
  politicianSlugs?: string[];
}

export interface BudgetProgramLine {
  code: string;
  label: string;
  amountM: number;
  changePct: number;
}

export interface BudgetSnapshot {
  territorySlug: string;
  fiscalYear: number;
  executionRate: number;
  variationVsPlan: number;
  trend: TrendDirection;
  highlightedPrograms: BudgetProgramLine[];
}

export interface AgentStatus {
  id: string;
  name: string;
  scope: string;
  status: AgentHealth;
  nextRun: string;
  coverage: string;
  mission: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  caption: string;
}

export interface TopicCluster {
  name: string;
  signalCount: number;
  shift: string;
}

export interface SearchResult {
  kind: SearchResultKind;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  tags: string[];
}

export interface BudgetSummary {
  averageExecutionRate: number;
  territoriesTracked: number;
  strongestAcceleration: BudgetSnapshot;
  highestPressure: BudgetSnapshot;
}

export interface ParliamentaryInitiative {
  id: string;
  title: string;
  initiativeType: string;
  dossierNumber: string;
  legislature: string;
  author: string;
  status: string;
  result?: string;
  commission?: string;
  sourceUrl: string;
  territorySlugs: string[];
  partySlugs: string[];
  politicianSlugs: string[];
}

export interface OfficialConnector {
  id: string;
  name: string;
  area: ConnectorArea;
  documentationUrl: string;
  sourcePageUrl: string;
  latestJsonUrl?: string;
  note: string;
}

export interface TerritorialOfficialSource {
  id: string;
  territorySlug: string;
  type: TerritorialSourceType;
  title: string;
  url: string;
}

export interface BoeIngestionItem {
  id: string;
  publicationDate: string;
  gazetteNumber: string;
  sectionCode: string;
  sectionName: string;
  departmentName?: string;
  epigraphName?: string;
  title: string;
  htmlUrl?: string;
  pdfUrl?: string;
  xmlUrl?: string;
}

export interface BormeIngestionItem {
  id: string;
  publicationDate: string;
  diaryNumber: string;
  sectionCode: string;
  sectionName: string;
  apartadoCode?: string;
  apartadoName?: string;
  title: string;
  pdfUrl: string;
  pdfSizeBytes?: number;
  pdfSizeKBytes?: number;
  pageStart?: number;
  pageEnd?: number;
  htmlUrl?: string;
  xmlUrl?: string;
}

export interface AuxiliaryCatalogItem {
  id: string;
  label: string;
}

export interface CongressDeputyRecord {
  slug: string;
  fullName: string;
  constituency: string;
  electoralFormation: string;
  parliamentaryGroup: string;
  swornAt?: string;
  startedAt?: string;
  biography?: string;
}

export interface CongressInitiativeRecord {
  id: string;
  legislature: string;
  initiativeType: string;
  dossierNumber: string;
  object: string;
  author: string;
  status: string;
  result?: string;
  commission?: string;
  qualificationDate?: string;
  filedAt?: string;
  publications: string[];
}

export interface SenateGroupRecord {
  code: string;
  legislature: string;
  name: string;
  acronym: string;
  totalMembers: number;
  totalElectedMembers: number;
  totalAppointedMembers: number;
  partyCodes: string[];
  partyNames: string[];
}

export interface SenateMemberRecord {
  slug: string;
  seatNumber: number;
  legislature: string;
  fullName: string;
  shortName: string;
  firstNames: string;
  lastNames: string;
  politicalPartyCode: string;
  politicalPartyName: string;
  parliamentaryGroup: string;
  parliamentaryGroupCode?: string;
  sourceType: "electo" | "designado";
  representationLabel: string;
  constituency?: string;
  community?: string;
  appointedAt?: string;
  gender?: string;
  profileUrl?: string;
}

export interface PoliticalCensusLayer {
  id: PoliticalCensusLayerId;
  name: string;
  status: PoliticalCensusLayerStatus;
  scope: string;
  recordCount: number;
  expectedCount: number;
  note: string;
  sourceUrls: string[];
  dataFormat: "json" | "xml" | "csv" | "html-scrape" | "mixed";
  updateFrequency: string;
}

export interface PoliticalCensusSummary {
  totalOfficials: number;
  totalIndexed: number;
  coveragePercent: number;
  layers: PoliticalCensusLayer[];
  lastUpdated: string;
}

export interface OfficialPoliticalProfile {
  id: string;
  slug: string;
  fullName: string;
  shortName: string;
  chamber: ParliamentaryChamber;
  chamberLabel: string;
  legislature: string;
  territoryLabel: string;
  constituency?: string;
  appointmentType?: string;
  representationLabel?: string;
  currentPartyName: string;
  currentPartyCode?: string;
  parliamentaryGroup: string;
  parliamentaryGroupCode?: string;
  currentRoleSummary: string;
  biography?: string;
  startedAt?: string;
  swornAt?: string;
  sourceOfTruthUrl: string;
  sourceDatasetUrl: string;
}

export interface PoliticalCensusSnapshot {
  generatedAt: string;
  total: number;
  layers: PoliticalCensusLayer[];
  items: OfficialPoliticalProfile[];
}

export interface IngestionRunResult<TRecord> {
  connectorId: string;
  requestedAt: string;
  sourceUrl: string;
  recordCount: number;
  records: TRecord[];
}

/* ── RAG Types ────────────────────────────────────────────────────────────── */

export interface RAGCitation {
  chunkId: string;
  sourceUrl: string;
  sourceTable: string;
  excerpt: string;
  relevanceScore: number;
}

export interface RAGTurn {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: RAGCitation[];
  createdAt: string;
}

export interface RAGSession {
  id: string;
  title?: string;
  turns: RAGTurn[];
  createdAt: string;
}

export interface RAGSearchFilters {
  territories?: string[];
  parties?: string[];
  politicians?: string[];
  dateFrom?: string;
  dateTo?: string;
  sourceTypes?: string[];
  minRelevance?: number;
}

export interface RAGSearchResult {
  query: string;
  filters: RAGSearchFilters;
  chunks: Array<{
    id: string;
    content: string;
    sourceTable: string;
    sourceRecordId: string;
    metadata: Record<string, unknown>;
    relevanceScore: number;
  }>;
  totalResults: number;
}

export type RAGCapability =
  | "semantic-search"
  | "question-answering"
  | "cross-entity-discovery"
  | "budget-forecast"
  | "eu-comparison"
  | "social-pulse";

export interface RAGSystemStatus {
  enabled: boolean;
  capabilities: RAGCapability[];
  chunkedDocuments: number;
  lastIndexedAt?: string;
  embeddingModel: string;
  vectorDimension: number;
}
