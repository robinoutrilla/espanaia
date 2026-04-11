/* ═══════════════════════════════════════════════════════════════════════════
   Decision Graph — Political decision-making knowledge graph for Spain.

   Models HOW political decisions are made: actors, institutions, votes,
   laws, and the relationships between them. Produces a graph data structure
   (nodes + edges + decision paths + narrative threads) suitable for
   force-directed visualization.

   Inspired by Mirofish's knowledge graph approach — activation sequences
   track how information and influence flow through the political system.

   Seed data for XV Legislature, 2026-04-10.
   ═══════════════════════════════════════════════════════════════════════════ */

import { parties } from "@espanaia/seed-data";
import { congressGroups, senateGroups, CONGRESS_TOTAL_SEATS } from "./parliamentary-data";
import { plenaryVotes, partyDisciplineStats } from "./voting-data";
import { getCoherenceAlerts, getPowerConcentration, getTerritoryTrafficLights } from "./insights-data";
import { ccaaIndicators } from "./ine-data";
import { territoryFiscalProfiles } from "./finance-data";
import { publicContracts } from "./contracts-data";
import { sessionTranscripts, getAllClaims } from "./transcripts-data";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type NodeType = "partido" | "politico" | "institucion" | "votacion" | "ley" | "territorio" | "comision" | "evento";

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  shortLabel?: string;
  color: string;
  size: number; // 1-5 scale, based on importance
  metadata: Record<string, any>;
  group?: string; // for clustering
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "vota-a-favor" | "vota-en-contra" | "abstiene" | "gobierna" | "coalicion" | "oposicion" | "influye" | "financia" | "pertenece" | "propone" | "debate" | "conflicto" | "consenso";
  weight: number; // 0-1
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface DecisionPath {
  id: string;
  title: string;
  description: string;
  status: "en-curso" | "aprobado" | "rechazado" | "bloqueado";
  steps: {
    order: number;
    label: string;
    institution: string;
    status: "completado" | "en-curso" | "pendiente" | "bloqueado";
    date?: string;
    relatedNodeIds: string[];
  }[];
  outcome?: string;
  probability?: number;
}

export interface NarrativeThread {
  id: string;
  title: string;
  summary: string;
  sentiment: number; // -1 to +1
  actors: { nodeId: string; role: string }[];
  hotTopics: string[];
  activationSequence: {
    order: number;
    sourceType: string;
    agentLabel: string;
    content: string;
    timestamp: string;
  }[];
}

export interface DecisionGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  decisionPaths: DecisionPath[];
  narrativeThreads: NarrativeThread[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    avgConnections: number;
    mostConnectedNode: { id: string; label: string; connections: number };
    clusterCount: number;
    density: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════

const PARTY_COLORS: Record<string, string> = {
  psoe: "#E30613",
  pp: "#0066CC",
  vox: "#63BE21",
  sumar: "#E6007E",
  erc: "#FFB81C",
  junts: "#00C3B2",
  "eh-bildu": "#A3C940",
  pnv: "#008542",
  podemos: "#6B2F6B",
  bng: "#76B6E3",
  "coalicion-canaria": "#FFD700",
  cup: "#FFED00",
};

const NODE_COLORS: Record<NodeType, string> = {
  partido: "#888888", // overridden per party
  politico: "#1a1a2e",
  institucion: "#0F4483",
  votacion: "#2e7d32", // default green, red if rejected
  ley: "#FFDB00",
  territorio: "#4a90d9",
  comision: "#7690b2",
  evento: "#e67e22",
};

const EDGE_COLORS: Record<string, string> = {
  "vota-a-favor": "#2e7d32",
  "vota-en-contra": "#b00000",
  abstiene: "#9e9e9e",
  gobierna: "#0F4483",
  coalicion: "#6a0dad",
  oposicion: "#8B0000",
  influye: "#e67e22",
  financia: "#FFD700",
  pertenece: "#607d8b",
  propone: "#1976d2",
  debate: "#f57c00",
  conflicto: "#d32f2f",
  consenso: "#388e3c",
};

// ═══════════════════════════════════════════════════════════════════════════
// STATIC DATA — Key politicians, institutions, commissions, laws
// ═══════════════════════════════════════════════════════════════════════════

interface PoliticianDef {
  id: string;
  name: string;
  shortLabel: string;
  partySlug: string;
  role: string;
}

const KEY_POLITICIANS: PoliticianDef[] = [
  { id: "pol-sanchez", name: "Pedro Sánchez", shortLabel: "Sánchez", partySlug: "psoe", role: "Presidente del Gobierno" },
  { id: "pol-feijoo", name: "Alberto Núñez Feijóo", shortLabel: "Feijóo", partySlug: "pp", role: "Líder de la Oposición" },
  { id: "pol-abascal", name: "Santiago Abascal", shortLabel: "Abascal", partySlug: "vox", role: "Presidente de VOX" },
  { id: "pol-diaz", name: "Yolanda Díaz", shortLabel: "Díaz", partySlug: "sumar", role: "Vicepresidenta segunda" },
  { id: "pol-rufian", name: "Gabriel Rufián", shortLabel: "Rufián", partySlug: "erc", role: "Portavoz ERC" },
  { id: "pol-aizpurua", name: "Mertxe Aizpurua", shortLabel: "Aizpurua", partySlug: "eh-bildu", role: "Portavoz EH Bildu" },
  { id: "pol-esteban", name: "Aitor Esteban", shortLabel: "Esteban", partySlug: "pnv", role: "Portavoz PNV" },
  { id: "pol-nogueras", name: "Miriam Nogueras", shortLabel: "Nogueras", partySlug: "junts", role: "Portavoz Junts" },
];

interface InstitutionDef {
  id: string;
  name: string;
  shortLabel: string;
  role: string;
}

const KEY_INSTITUTIONS: InstitutionDef[] = [
  { id: "inst-congreso", name: "Congreso de los Diputados", shortLabel: "Congreso", role: "Cámara baja legislativa" },
  { id: "inst-senado", name: "Senado de España", shortLabel: "Senado", role: "Cámara alta / territorial" },
  { id: "inst-gobierno", name: "Gobierno de España", shortLabel: "Gobierno", role: "Poder ejecutivo" },
  { id: "inst-tc", name: "Tribunal Constitucional", shortLabel: "TC", role: "Control de constitucionalidad" },
  { id: "inst-tcu", name: "Tribunal de Cuentas", shortLabel: "T.Cuentas", role: "Fiscalización contable" },
  { id: "inst-consejo", name: "Consejo de Ministros", shortLabel: "C.Ministros", role: "Órgano colegiado del Gobierno" },
  { id: "inst-ce", name: "Comisión Europea", shortLabel: "C.Europea", role: "Ejecutivo de la UE" },
];

interface CommissionDef {
  id: string;
  name: string;
  shortLabel: string;
  chamber: string;
}

const KEY_COMMISSIONS: CommissionDef[] = [
  { id: "com-presupuestos", name: "Comisión de Presupuestos", shortLabel: "Presupuestos", chamber: "congreso" },
  { id: "com-economia", name: "Comisión de Economía", shortLabel: "Economía", chamber: "congreso" },
  { id: "com-transicion", name: "Comisión de Transición Ecológica", shortLabel: "Trans.Ecológica", chamber: "congreso" },
  { id: "com-constitucional", name: "Comisión Constitucional", shortLabel: "Constitucional", chamber: "congreso" },
];

interface LegislationDef {
  id: string;
  name: string;
  shortLabel: string;
  status: string;
  relatedVoteId?: string;
}

const KEY_LEGISLATION: LegislationDef[] = [
  { id: "ley-pge2026", name: "Presupuestos Generales del Estado 2026", shortLabel: "PGE 2026", status: "en-curso" },
  { id: "ley-vivienda", name: "Ley de Vivienda", shortLabel: "L.Vivienda", status: "en-curso", relatedVoteId: "vote-002" },
  { id: "ley-ia", name: "Ley de Inteligencia Artificial", shortLabel: "Ley IA", status: "en-curso" },
  { id: "ley-rdl-vivienda", name: "RDL 6/2026 Medidas urgentes para la vivienda", shortLabel: "RDL Vivienda", status: "aprobado", relatedVoteId: "vote-002" },
  { id: "ley-paridad", name: "Ley Orgánica de Paridad", shortLabel: "L.Paridad", status: "aprobado", relatedVoteId: "vote-001" },
];

// ═══════════════════════════════════════════════════════════════════════════
// NODE BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

function buildPartyNodes(): GraphNode[] {
  return congressGroups.map((g) => {
    const sizeRaw = (g.seats / CONGRESS_TOTAL_SEATS) * 5;
    const size = Math.max(1, Math.min(5, Math.round(sizeRaw * 10) / 10));
    return {
      id: `party-${g.partySlug}`,
      type: "partido" as NodeType,
      label: g.name,
      shortLabel: g.shortName,
      color: PARTY_COLORS[g.partySlug] ?? NODE_COLORS.partido,
      size,
      metadata: {
        slug: g.partySlug,
        seats: g.seats,
        representationPct: g.representationPct,
        chamber: g.chamber,
      },
      group: "partidos",
    };
  });
}

function buildInstitutionNodes(): GraphNode[] {
  return KEY_INSTITUTIONS.map((inst) => ({
    id: inst.id,
    type: "institucion" as NodeType,
    label: inst.name,
    shortLabel: inst.shortLabel,
    color: NODE_COLORS.institucion,
    size: inst.id === "inst-congreso" || inst.id === "inst-gobierno" ? 5 : 3,
    metadata: { role: inst.role },
    group: "instituciones",
  }));
}

function buildCommissionNodes(): GraphNode[] {
  return KEY_COMMISSIONS.map((com) => ({
    id: com.id,
    type: "comision" as NodeType,
    label: com.name,
    shortLabel: com.shortLabel,
    color: NODE_COLORS.comision,
    size: com.id === "com-presupuestos" ? 3 : 2,
    metadata: { chamber: com.chamber },
    group: "comisiones",
  }));
}

function buildVoteNodes(): GraphNode[] {
  return plenaryVotes.map((v) => ({
    id: `vote-node-${v.id}`,
    type: "votacion" as NodeType,
    label: v.title,
    shortLabel: v.title.length > 40 ? v.title.slice(0, 37) + "..." : v.title,
    color: v.result === "aprobado" ? "#2e7d32" : "#b00000",
    size: v.category === "ley-organica" ? 3 : 2,
    metadata: {
      voteId: v.id,
      result: v.result,
      category: v.category,
      date: v.sessionDate,
      si: v.si,
      no: v.no,
      abstencion: v.abstencion,
    },
    group: "votaciones",
  }));
}

function buildTerritoryNodes(): GraphNode[] {
  // All 17 CCAAs (excluding Ceuta and Melilla)
  const excluded = new Set(["ceuta", "melilla"]);
  const ccaaList = ccaaIndicators.filter((t) => !excluded.has(t.territorySlug));

  const territoryLabels: Record<string, string> = {
    andalucia: "Andalucía",
    cataluna: "Cataluña",
    madrid: "Madrid",
    "comunitat-valenciana": "C. Valenciana",
    galicia: "Galicia",
    "castilla-y-leon": "Castilla y León",
    "pais-vasco": "País Vasco",
    canarias: "Canarias",
    aragon: "Aragón",
    "castilla-la-mancha": "Castilla-La Mancha",
    extremadura: "Extremadura",
    murcia: "Región de Murcia",
    "illes-balears": "Illes Balears",
    asturias: "Asturias",
    cantabria: "Cantabria",
    navarra: "Navarra",
    "la-rioja": "La Rioja",
  };

  const territoryColors: Record<string, string> = {
    andalucia: "#009150",
    cataluna: "#FCDD09",
    madrid: "#C60B1E",
    "comunitat-valenciana": "#D47228",
    galicia: "#76B6E3",
    "castilla-y-leon": "#8B2252",
    "pais-vasco": "#008542",
    canarias: "#FFD700",
    aragon: "#E30613",
    "castilla-la-mancha": "#8B0000",
    extremadura: "#006633",
    murcia: "#C60B1E",
    "illes-balears": "#6A0DAD",
    asturias: "#0066CC",
    cantabria: "#D32F2F",
    navarra: "#C60B1E",
    "la-rioja": "#388E3C",
  };

  // Size: 3 for pop > 4M, 2 for pop > 1M, 1 otherwise
  const getSize = (pop: number): number => {
    if (pop > 4_000_000) return 3;
    if (pop > 1_000_000) return 2;
    return 1;
  };

  return ccaaList.map((t) => ({
    id: `terr-${t.territorySlug}`,
    type: "territorio" as NodeType,
    label: territoryLabels[t.territorySlug] ?? t.territorySlug,
    shortLabel: territoryLabels[t.territorySlug] ?? t.territorySlug,
    color: territoryColors[t.territorySlug] ?? NODE_COLORS.territorio,
    size: getSize(t.population),
    metadata: {
      slug: t.territorySlug,
      population: t.population,
      gdpPerCapita: t.gdpPerCapita,
      unemploymentRate: t.unemploymentRate,
    },
    group: "territorios",
  }));
}

function buildPoliticianNodes(): GraphNode[] {
  return KEY_POLITICIANS.map((pol) => ({
    id: pol.id,
    type: "politico" as NodeType,
    label: pol.name,
    shortLabel: pol.shortLabel,
    color: NODE_COLORS.politico,
    size: pol.id === "pol-sanchez" || pol.id === "pol-feijoo" ? 4 : 2,
    metadata: {
      partySlug: pol.partySlug,
      role: pol.role,
    },
    group: "politicos",
  }));
}

function buildLegislationNodes(): GraphNode[] {
  return KEY_LEGISLATION.map((ley) => ({
    id: ley.id,
    type: "ley" as NodeType,
    label: ley.name,
    shortLabel: ley.shortLabel,
    color: NODE_COLORS.ley,
    size: ley.id === "ley-pge2026" ? 4 : 3,
    metadata: {
      status: ley.status,
      relatedVoteId: ley.relatedVoteId,
    },
    group: "legislacion",
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// EDGE BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

let edgeCounter = 0;
function nextEdgeId(): string {
  return `edge-${++edgeCounter}`;
}

function buildPartyVoteEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];

  for (const vote of plenaryVotes) {
    const voteNodeId = `vote-node-${vote.id}`;
    for (const pb of vote.partyBreakdown) {
      const partyNodeId = `party-${pb.partySlug}`;
      // Only create edges for parties that have a node
      const hasNode = congressGroups.some((g) => g.partySlug === pb.partySlug);
      if (!hasNode) continue;

      let edgeType: GraphEdge["type"];
      let color: string;
      if (pb.position === "si") {
        edgeType = "vota-a-favor";
        color = EDGE_COLORS["vota-a-favor"];
      } else if (pb.position === "no") {
        edgeType = "vota-en-contra";
        color = EDGE_COLORS["vota-en-contra"];
      } else {
        edgeType = "abstiene";
        color = EDGE_COLORS.abstiene;
      }

      // Weight based on how strong the position is (unanimity within party)
      const majorityCount = pb[pb.position] ?? 0;
      const weight = pb.total > 0 ? majorityCount / pb.total : 0;

      edges.push({
        id: nextEdgeId(),
        source: partyNodeId,
        target: voteNodeId,
        type: edgeType,
        weight: Math.round(weight * 100) / 100,
        label: `${pb.position} (${majorityCount}/${pb.total})`,
        color,
        metadata: { voteId: vote.id, partySlug: pb.partySlug },
      });
    }
  }

  return edges;
}

function buildPartyInstitutionEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const governingPartySlugs = ["psoe", "sumar"];

  for (const g of congressGroups) {
    const partyNodeId = `party-${g.partySlug}`;

    // All parties belong to Congreso
    edges.push({
      id: nextEdgeId(),
      source: partyNodeId,
      target: "inst-congreso",
      type: "pertenece",
      weight: g.seats / CONGRESS_TOTAL_SEATS,
      label: `${g.seats} escaños`,
      color: EDGE_COLORS.pertenece,
    });

    // Governing parties connect to Gobierno
    if (governingPartySlugs.includes(g.partySlug)) {
      edges.push({
        id: nextEdgeId(),
        source: partyNodeId,
        target: "inst-gobierno",
        type: "gobierna",
        weight: g.partySlug === "psoe" ? 0.9 : 0.6,
        label: g.partySlug === "psoe" ? "Partido principal" : "Socio de coalición",
        color: EDGE_COLORS.gobierna,
      });
    }
  }

  // Congreso ↔ Senado institutional link
  edges.push({
    id: nextEdgeId(),
    source: "inst-congreso",
    target: "inst-senado",
    type: "debate",
    weight: 0.9,
    label: "Bicameralismo",
    color: EDGE_COLORS.debate,
  });

  // Gobierno → Consejo de Ministros
  edges.push({
    id: nextEdgeId(),
    source: "inst-gobierno",
    target: "inst-consejo",
    type: "pertenece",
    weight: 1.0,
    label: "Órgano ejecutivo",
    color: EDGE_COLORS.pertenece,
  });

  // Comisión Europea → influye sobre Gobierno
  edges.push({
    id: nextEdgeId(),
    source: "inst-ce",
    target: "inst-gobierno",
    type: "influye",
    weight: 0.7,
    label: "Directivas y reglamentos UE",
    color: EDGE_COLORS.influye,
  });

  // Commissions belong to Congreso
  for (const com of KEY_COMMISSIONS) {
    edges.push({
      id: nextEdgeId(),
      source: com.id,
      target: "inst-congreso",
      type: "pertenece",
      weight: 0.8,
      label: "Comisión parlamentaria",
      color: EDGE_COLORS.pertenece,
    });
  }

  return edges;
}

function buildCoalitionEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];

  // Core governing coalition
  edges.push({
    id: nextEdgeId(),
    source: "party-psoe",
    target: "party-sumar",
    type: "coalicion",
    weight: 0.95,
    label: "Coalición de gobierno",
    color: EDGE_COLORS.coalicion,
    metadata: { type: "gobierno", since: "2023-11" },
  });

  // Parliamentary support partners — variable geometry
  const supportPartners: { slug: string; weight: number; label: string }[] = [
    { slug: "erc", weight: 0.55, label: "Apoyo parlamentario intermitente" },
    { slug: "junts", weight: 0.40, label: "Apoyo volátil / condicionado" },
    { slug: "eh-bildu", weight: 0.65, label: "Apoyo parlamentario estable" },
    { slug: "pnv", weight: 0.70, label: "Socio preferente" },
    { slug: "podemos", weight: 0.45, label: "Apoyo crítico desde la izquierda" },
  ];

  for (const partner of supportPartners) {
    edges.push({
      id: nextEdgeId(),
      source: "party-psoe",
      target: `party-${partner.slug}`,
      type: "coalicion",
      weight: partner.weight,
      label: partner.label,
      color: EDGE_COLORS.coalicion,
      metadata: { type: "apoyo-parlamentario" },
    });
  }

  // Right-wing bloc
  edges.push({
    id: nextEdgeId(),
    source: "party-pp",
    target: "party-vox",
    type: "coalicion",
    weight: 0.6,
    label: "Bloque de oposición",
    color: EDGE_COLORS.coalicion,
    metadata: { type: "oposicion-conjunta" },
  });

  return edges;
}

function buildPoliticianPartyEdges(): GraphEdge[] {
  return KEY_POLITICIANS.map((pol) => ({
    id: nextEdgeId(),
    source: pol.id,
    target: `party-${pol.partySlug}`,
    type: "pertenece" as const,
    weight: 1.0,
    label: pol.role,
    color: EDGE_COLORS.pertenece,
  }));
}

function buildPoliticianInstitutionEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];

  // Sánchez → Gobierno (Presidente)
  edges.push({
    id: nextEdgeId(),
    source: "pol-sanchez",
    target: "inst-gobierno",
    type: "gobierna",
    weight: 1.0,
    label: "Presidente del Gobierno",
    color: EDGE_COLORS.gobierna,
  });

  // Díaz → Gobierno (Vicepresidenta)
  edges.push({
    id: nextEdgeId(),
    source: "pol-diaz",
    target: "inst-gobierno",
    type: "gobierna",
    weight: 0.8,
    label: "Vicepresidenta segunda",
    color: EDGE_COLORS.gobierna,
  });

  // Feijóo → Congreso (oposición)
  edges.push({
    id: nextEdgeId(),
    source: "pol-feijoo",
    target: "inst-congreso",
    type: "debate",
    weight: 0.9,
    label: "Líder de la Oposición",
    color: EDGE_COLORS.debate,
  });

  return edges;
}

function buildTerritoryEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];

  // Use power concentration to link parties to territories they govern
  try {
    const powerData = getPowerConcentration();
    for (const pc of powerData) {
      for (const ccaa of pc.ccaaGoverning) {
        const terrNodeId = `terr-${ccaa}`;
        const partyNodeId = `party-${pc.partySlug}`;
        edges.push({
          id: nextEdgeId(),
          source: partyNodeId,
          target: terrNodeId,
          type: "gobierna",
          weight: 0.8,
          label: `Gobierna ${ccaa}`,
          color: EDGE_COLORS.gobierna,
          metadata: { powerIndex: pc.powerIndex },
        });
      }
    }
  } catch {
    // Fallback: manually link major governing relations
    const fallbackGov: [string, string][] = [
      ["pp", "madrid"],
      ["pp", "andalucia"],
      ["pp", "galicia"],
      ["pp", "comunitat-valenciana"],
      ["pp", "murcia"],
      ["pp", "aragon"],
      ["pp", "castilla-y-leon"],
      ["pp", "extremadura"],
      ["pp", "cantabria"],
      ["pp", "illes-balears"],
      ["pp", "la-rioja"],
      ["psoe", "castilla-la-mancha"],
      ["psoe", "asturias"],
      ["psoe", "canarias"],
      ["psoe", "navarra"],
      ["erc", "cataluna"],
      ["pnv", "pais-vasco"],
    ];
    for (const [slug, terr] of fallbackGov) {
      edges.push({
        id: nextEdgeId(),
        source: `party-${slug}`,
        target: `terr-${terr}`,
        type: "gobierna",
        weight: 0.8,
        label: `Gobierna`,
        color: EDGE_COLORS.gobierna,
      });
    }
  }

  // Territory fiscal profiles — territories with high fiscal imbalance create tension
  try {
    for (const fp of territoryFiscalProfiles) {
      const terrNodeId = `terr-${fp.territorySlug}`;
      // Include territories with significant fiscal tension
      const fiscalTensionTerritories = new Set(["cataluna", "madrid", "pais-vasco", "navarra", "comunitat-valenciana"]);
      if (fiscalTensionTerritories.has(fp.territorySlug)) {
        edges.push({
          id: nextEdgeId(),
          source: terrNodeId,
          target: "inst-gobierno",
          type: "conflicto",
          weight: 0.6,
          label: "Tensión financiación autonómica",
          color: EDGE_COLORS.conflicto,
          metadata: { topic: "financiacion" },
        });
      }
    }
  } catch {
    // territoryFiscalProfiles may not be available
  }

  // Regional party influence on their home territories
  const regionalInfluence: [string, string, string][] = [
    ["bng", "galicia", "Influencia territorial BNG"],
    ["eh-bildu", "navarra", "Implantación EH Bildu en Navarra"],
    ["eh-bildu", "pais-vasco", "Influencia territorial EH Bildu"],
    ["pnv", "pais-vasco", "Partido hegemónico vasco"],
    ["coalicion-canaria", "canarias", "Coalición Canaria en Canarias"],
    ["erc", "cataluna", "Influencia territorial ERC"],
    ["junts", "cataluna", "Influencia territorial Junts"],
    ["pp", "castilla-y-leon", "Hegemonía PP en Castilla y León"],
    ["vox", "murcia", "Implantación VOX en Murcia"],
  ];
  for (const [slug, terr, label] of regionalInfluence) {
    edges.push({
      id: nextEdgeId(),
      source: `party-${slug}`,
      target: `terr-${terr}`,
      type: "influye",
      weight: 0.6,
      label,
      color: EDGE_COLORS.influye,
    });
  }

  return edges;
}

function buildCoherenceConflictEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];

  try {
    const alerts = getCoherenceAlerts();
    for (const alert of alerts) {
      if (alert.type === "contradiction" && alert.severity === "high") {
        const partyNodeId = `party-${alert.partySlug}`;
        // Contradiction creates an internal conflict edge to Congreso
        edges.push({
          id: nextEdgeId(),
          source: partyNodeId,
          target: "inst-congreso",
          type: "conflicto",
          weight: 0.7,
          label: `Incoherencia: ${alert.explanation.slice(0, 60)}...`,
          color: EDGE_COLORS.conflicto,
          metadata: { alert: alert.type, severity: alert.severity },
        });
      }
    }
  } catch {
    // insights-data may not be available
  }

  return edges;
}

function buildLegislationEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];

  // Link legislation to related votes
  for (const ley of KEY_LEGISLATION) {
    if (ley.relatedVoteId) {
      edges.push({
        id: nextEdgeId(),
        source: ley.id,
        target: `vote-node-${ley.relatedVoteId}`,
        type: "propone",
        weight: 1.0,
        label: "Votación asociada",
        color: EDGE_COLORS.propone,
      });
    }

    // PGE goes through Comisión de Presupuestos
    if (ley.id === "ley-pge2026") {
      edges.push({
        id: nextEdgeId(),
        source: ley.id,
        target: "com-presupuestos",
        type: "debate",
        weight: 0.9,
        label: "Tramitación presupuestaria",
        color: EDGE_COLORS.debate,
      });
      edges.push({
        id: nextEdgeId(),
        source: "inst-gobierno",
        target: ley.id,
        type: "propone",
        weight: 1.0,
        label: "Proyecto de ley del Gobierno",
        color: EDGE_COLORS.propone,
      });
    }

    // Ley IA linked to Comisión Europea
    if (ley.id === "ley-ia") {
      edges.push({
        id: nextEdgeId(),
        source: "inst-ce",
        target: ley.id,
        type: "influye",
        weight: 0.85,
        label: "AI Act (UE) 2024/1689",
        color: EDGE_COLORS.influye,
      });
      edges.push({
        id: nextEdgeId(),
        source: ley.id,
        target: "com-economia",
        type: "debate",
        weight: 0.7,
        label: "Tramitación en comisión",
        color: EDGE_COLORS.debate,
      });
    }

    // Ley Vivienda linked to Transición Ecológica commission
    if (ley.id === "ley-vivienda") {
      edges.push({
        id: nextEdgeId(),
        source: ley.id,
        target: "com-transicion",
        type: "debate",
        weight: 0.6,
        label: "Eficiencia energética en vivienda",
        color: EDGE_COLORS.debate,
      });
    }
  }

  return edges;
}

function buildTranscriptEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const seenPairs = new Set<string>();

  try {
    const claims = getAllClaims();
    // Extract consensus and conflict signals from claims
    const partyClaimMap = new Map<string, { critica: number; propuesta: number; compromiso: number }>();

    for (const claim of claims) {
      const key = claim.party;
      if (!partyClaimMap.has(key)) {
        partyClaimMap.set(key, { critica: 0, propuesta: 0, compromiso: 0 });
      }
      const stats = partyClaimMap.get(key)!;
      if (claim.type === "critica" || claim.type === "acusacion") stats.critica++;
      if (claim.type === "propuesta") stats.propuesta++;
      if (claim.type === "compromiso") stats.compromiso++;
    }

    // Parties with many proposals → consenso edges to institutions
    for (const [partySlug, stats] of Array.from(partyClaimMap.entries())) {
      const partyNodeId = `party-${partySlug}`;
      if (stats.propuesta >= 3) {
        const pairKey = `${partyNodeId}-inst-congreso-consenso`;
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          edges.push({
            id: nextEdgeId(),
            source: partyNodeId,
            target: "inst-congreso",
            type: "consenso",
            weight: Math.min(1, stats.propuesta / 10),
            label: `${stats.propuesta} propuestas en pleno`,
            color: EDGE_COLORS.consenso,
          });
        }
      }

      // Parties with many critiques → conflicto with governing party
      if (stats.critica >= 4 && partySlug !== "psoe") {
        const pairKey = `${partyNodeId}-party-psoe-conflicto`;
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          edges.push({
            id: nextEdgeId(),
            source: partyNodeId,
            target: "party-psoe",
            type: "conflicto",
            weight: Math.min(1, stats.critica / 15),
            label: `${stats.critica} críticas registradas`,
            color: EDGE_COLORS.conflicto,
          });
        }
      }
    }
  } catch {
    // transcripts-data may not be available
  }

  return edges;
}

// ═══════════════════════════════════════════════════════════════════════════
// DECISION PATHS
// ═══════════════════════════════════════════════════════════════════════════

function buildDecisionPaths(): DecisionPath[] {
  return [
    {
      id: "dp-pge2026",
      title: "Presupuestos Generales del Estado 2026",
      description: "Tramitación de los PGE 2026: desde la elaboración por el Gobierno hasta la aprobación en pleno. Requiere mayoría simple pero depende de la geometría variable de apoyos parlamentarios.",
      status: "en-curso",
      steps: [
        {
          order: 1,
          label: "Elaboración del anteproyecto (Ministerio de Hacienda)",
          institution: "Consejo de Ministros",
          status: "completado",
          date: "2025-12-15",
          relatedNodeIds: ["inst-consejo", "inst-gobierno"],
        },
        {
          order: 2,
          label: "Aprobación del proyecto de ley en Consejo de Ministros",
          institution: "Consejo de Ministros",
          status: "completado",
          date: "2026-01-28",
          relatedNodeIds: ["inst-consejo", "pol-sanchez"],
        },
        {
          order: 3,
          label: "Debate de totalidad en Congreso",
          institution: "Congreso de los Diputados",
          status: "completado",
          date: "2026-02-20",
          relatedNodeIds: ["inst-congreso", "com-presupuestos", "ley-pge2026"],
        },
        {
          order: 4,
          label: "Tramitación en Comisión de Presupuestos (enmiendas parciales)",
          institution: "Comisión de Presupuestos",
          status: "en-curso",
          relatedNodeIds: ["com-presupuestos", "party-psoe", "party-sumar", "party-pnv"],
        },
        {
          order: 5,
          label: "Votación final en pleno del Congreso",
          institution: "Congreso de los Diputados",
          status: "pendiente",
          relatedNodeIds: ["inst-congreso", "ley-pge2026"],
        },
      ],
      outcome: "Aprobación condicionada a acuerdo con PNV y ERC sobre inversiones territoriales",
      probability: 0.62,
    },
    {
      id: "dp-rdl-vivienda",
      title: "RDL 6/2026 Medidas urgentes para la vivienda",
      description: "Real Decreto-ley tramitado por vía de urgencia. Convalidado en el Congreso pero pendiente de tramitación como proyecto de ley para enmiendas.",
      status: "aprobado",
      steps: [
        {
          order: 1,
          label: "Aprobación del RDL en Consejo de Ministros",
          institution: "Consejo de Ministros",
          status: "completado",
          date: "2026-03-10",
          relatedNodeIds: ["inst-consejo", "inst-gobierno"],
        },
        {
          order: 2,
          label: "Convalidación en pleno del Congreso",
          institution: "Congreso de los Diputados",
          status: "completado",
          date: "2026-03-27",
          relatedNodeIds: ["inst-congreso", "vote-node-vote-002"],
        },
        {
          order: 3,
          label: "Votación de tramitación como proyecto de ley",
          institution: "Congreso de los Diputados",
          status: "completado",
          date: "2026-03-27",
          relatedNodeIds: ["inst-congreso"],
        },
        {
          order: 4,
          label: "Enmiendas en comisión",
          institution: "Comisión de Transición Ecológica",
          status: "en-curso",
          relatedNodeIds: ["com-transicion", "ley-vivienda"],
        },
      ],
      outcome: "Convalidado con 178 votos a favor. Junts y PNV se abstuvieron.",
    },
    {
      id: "dp-ley-ia",
      title: "Ley de Inteligencia Artificial",
      description: "Transposición del Reglamento europeo de IA (AI Act) al ordenamiento español. Incluye creación de la Agencia Española de Supervisión de IA (AESIA) y régimen sancionador.",
      status: "en-curso",
      steps: [
        {
          order: 1,
          label: "Directrices de transposición de la Comisión Europea",
          institution: "Comisión Europea",
          status: "completado",
          date: "2025-08-01",
          relatedNodeIds: ["inst-ce"],
        },
        {
          order: 2,
          label: "Anteproyecto de ley (Ministerio de Transformación Digital)",
          institution: "Gobierno de España",
          status: "completado",
          date: "2026-01-15",
          relatedNodeIds: ["inst-gobierno"],
        },
        {
          order: 3,
          label: "Consulta pública y dictamen del Consejo de Estado",
          institution: "Gobierno de España",
          status: "completado",
          date: "2026-03-01",
          relatedNodeIds: ["inst-gobierno"],
        },
        {
          order: 4,
          label: "Debate de totalidad en Congreso",
          institution: "Congreso de los Diputados",
          status: "en-curso",
          relatedNodeIds: ["inst-congreso", "ley-ia"],
        },
        {
          order: 5,
          label: "Tramitación en Comisión de Economía",
          institution: "Comisión de Economía",
          status: "pendiente",
          relatedNodeIds: ["com-economia", "ley-ia"],
        },
        {
          order: 6,
          label: "Votación final en pleno",
          institution: "Congreso de los Diputados",
          status: "pendiente",
          relatedNodeIds: ["inst-congreso"],
        },
      ],
      outcome: "Amplio consenso esperado — PP ha mostrado disposición favorable",
      probability: 0.85,
    },
    {
      id: "dp-financiacion",
      title: "Reforma de la Financiación Autonómica",
      description: "Negociación multilateral para reformar el sistema de financiación de las CCAA. Bloqueada por la exigencia de Cataluña de un concierto económico singular y la oposición del PP desde las comunidades que gobierna.",
      status: "bloqueado",
      steps: [
        {
          order: 1,
          label: "Propuesta del Gobierno: nuevo modelo multilateral",
          institution: "Gobierno de España",
          status: "completado",
          date: "2025-09-20",
          relatedNodeIds: ["inst-gobierno", "pol-sanchez"],
        },
        {
          order: 2,
          label: "Negociación bilateral con Cataluña (concierto singular)",
          institution: "Gobierno de España",
          status: "en-curso",
          relatedNodeIds: ["inst-gobierno", "party-erc", "party-junts", "terr-cataluna"],
        },
        {
          order: 3,
          label: "Conferencia de Presidentes Autonómicos",
          institution: "Senado de España",
          status: "bloqueado",
          relatedNodeIds: ["inst-senado", "party-pp", "terr-madrid", "terr-andalucia"],
        },
        {
          order: 4,
          label: "Reforma de la LOFCA en Congreso",
          institution: "Congreso de los Diputados",
          status: "pendiente",
          relatedNodeIds: ["inst-congreso", "com-constitucional"],
        },
        {
          order: 5,
          label: "Aprobación en Senado (mayoría del PP)",
          institution: "Senado de España",
          status: "pendiente",
          relatedNodeIds: ["inst-senado", "party-pp"],
        },
      ],
      outcome: "Bloqueada: PP controla el Senado y 13 gobiernos autonómicos. ERC y Junts exigen condiciones incompatibles entre sí.",
      probability: 0.15,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// NARRATIVE THREADS (Mirofish-style activation sequences)
// ═══════════════════════════════════════════════════════════════════════════

function buildNarrativeThreads(): NarrativeThread[] {
  return [
    {
      id: "nt-financiacion",
      title: "Tensión por la financiación autonómica",
      summary: "La promesa del PSOE de reformar la financiación autonómica con un trato singular para Cataluña ha desencadenado un conflicto territorial sin precedentes. El PP bloquea desde el Senado y las CCAA que gobierna, mientras ERC y Junts exigen condiciones contradictorias.",
      sentiment: -0.6,
      actors: [
        { nodeId: "party-psoe", role: "Promotor de la reforma" },
        { nodeId: "party-pp", role: "Bloqueador desde el Senado y las CCAA" },
        { nodeId: "party-erc", role: "Exige concierto económico" },
        { nodeId: "party-junts", role: "Condiciona apoyo a soberanía fiscal" },
        { nodeId: "terr-cataluna", role: "Territorio demandante" },
        { nodeId: "terr-madrid", role: "Territorio opositor" },
        { nodeId: "terr-andalucia", role: "Territorio opositor" },
      ],
      hotTopics: ["financiación autonómica", "concierto catalán", "LOFCA", "solidaridad interterritorial", "infrafinanciación"],
      activationSequence: [
        {
          order: 1,
          sourceType: "MediaOutlet",
          agentLabel: "El País / La Vanguardia",
          content: "Filtración del borrador del Gobierno sobre el nuevo modelo de financiación con un cupo catalán. Portada simultánea en Madrid y Barcelona con enfoques opuestos.",
          timestamp: "2026-02-15T08:00:00Z",
        },
        {
          order: 2,
          sourceType: "PoliticalParty",
          agentLabel: "ERC (Gabriel Rufián)",
          content: "Rufián exige en el Congreso el cumplimiento del acuerdo de investidura: 'Sin concierto no hay presupuestos.' Primer ultimátum público.",
          timestamp: "2026-02-17T11:30:00Z",
        },
        {
          order: 3,
          sourceType: "RegionalGovernment",
          agentLabel: "Comunidad de Madrid (PP)",
          content: "Ayuso convoca rueda de prensa: 'Madrid no va a pagar el chantaje catalán.' Movilización institucional de las 13 CCAA gobernadas por el PP.",
          timestamp: "2026-02-18T13:00:00Z",
        },
        {
          order: 4,
          sourceType: "GovernmentAgency",
          agentLabel: "Ministerio de Hacienda",
          content: "María Jesús Montero presenta un informe técnico que cifra el coste del concierto catalán en 6.000M anuales. Busca desmontar la narrativa de 'expolio fiscal'.",
          timestamp: "2026-02-22T10:00:00Z",
        },
        {
          order: 5,
          sourceType: "Parliament",
          agentLabel: "Senado (mayoría PP)",
          content: "El PP presenta una moción en el Senado contra la financiación singular. Aprobada con 158 votos. Valor simbólico pero sin efecto legislativo directo.",
          timestamp: "2026-03-05T16:00:00Z",
        },
        {
          order: 6,
          sourceType: "PoliticalParty",
          agentLabel: "Junts (Miriam Nogueras)",
          content: "Junts se desmarca de ERC: exige no solo un concierto económico sino capacidad de recaudación propia. Fractura en el bloque independentista.",
          timestamp: "2026-03-12T09:30:00Z",
        },
        {
          order: 7,
          sourceType: "GovernmentAgency",
          agentLabel: "Presidencia del Gobierno",
          content: "Sánchez anuncia una Conferencia de Presidentes 'antes de verano' para abordar la financiación de forma multilateral. Los presidentes del PP amenazan con no asistir.",
          timestamp: "2026-03-28T18:00:00Z",
        },
      ],
    },
    {
      id: "nt-vivienda",
      title: "Crisis de vivienda: decreto vs ley",
      summary: "El Gobierno aprueba un RDL de emergencia habitacional ante la presión social, pero el debate real es si la respuesta debe ser regulatoria (tope de precios) o de oferta (construcción pública). Sumar y Podemos presionan desde la izquierda mientras el PP lo rechaza de plano.",
      sentiment: -0.3,
      actors: [
        { nodeId: "inst-gobierno", role: "Promotor del RDL" },
        { nodeId: "party-sumar", role: "Presiona por medidas más ambiciosas" },
        { nodeId: "party-podemos", role: "Crítico: 'insuficiente'" },
        { nodeId: "party-pp", role: "Rechaza intervención de precios" },
        { nodeId: "pol-diaz", role: "Vicepresidenta impulsora" },
      ],
      hotTopics: ["vivienda", "alquiler", "tope de precios", "RDL vivienda", "vivienda pública", "especulación"],
      activationSequence: [
        {
          order: 1,
          sourceType: "CivilSociety",
          agentLabel: "Sindicato de Inquilinas",
          content: "Manifestaciones masivas en Madrid y Barcelona: 200.000 personas exigen intervención del mercado del alquiler. Hashtag #ViviendaDigna trending 3 días.",
          timestamp: "2026-02-22T12:00:00Z",
        },
        {
          order: 2,
          sourceType: "MediaOutlet",
          agentLabel: "elDiario.es / Cadena SER",
          content: "Reportaje de datos: el alquiler medio en Madrid supera los 1.400/mes, un 42% de los ingresos medianos. Presión mediática sostenida durante dos semanas.",
          timestamp: "2026-02-25T07:00:00Z",
        },
        {
          order: 3,
          sourceType: "PoliticalParty",
          agentLabel: "Sumar (Yolanda Díaz)",
          content: "Díaz presenta un paquete de 12 medidas en el Consejo de Ministros: tope de alquileres al 2% interanual, movilización de 50.000 viviendas vacías de la SAREB, bono joven ampliado.",
          timestamp: "2026-03-04T10:00:00Z",
        },
        {
          order: 4,
          sourceType: "GovernmentAgency",
          agentLabel: "Consejo de Ministros",
          content: "Aprobación del RDL 6/2026 de medidas urgentes para la vivienda. Versión final más moderada de lo que pedía Sumar: tope del 3% y 30.000 viviendas.",
          timestamp: "2026-03-10T14:00:00Z",
        },
        {
          order: 5,
          sourceType: "Parliament",
          agentLabel: "Congreso de los Diputados",
          content: "Convalidación del RDL con 178 votos a favor. Junts y PNV se abstienen. PP y VOX votan en contra. Podemos vota a favor pero anuncia enmiendas 'por la izquierda'.",
          timestamp: "2026-03-27T17:00:00Z",
        },
        {
          order: 6,
          sourceType: "PoliticalParty",
          agentLabel: "PP (Feijóo)",
          content: "Feijóo presenta plan alternativo: liberalización de suelo, incentivos fiscales a propietarios, eliminación del tope de precios. 'La solución es construir, no prohibir.'",
          timestamp: "2026-04-02T11:00:00Z",
        },
      ],
    },
    {
      id: "nt-ia",
      title: "España ante la IA: regulación europea",
      summary: "La transposición del AI Act europeo al derecho español abre un debate entre la regulación proteccionista y la ambición tecnológica. El Gobierno busca posicionar a España como hub de IA del sur de Europa, mientras negocia con Bruselas los plazos de adaptación.",
      sentiment: 0.2,
      actors: [
        { nodeId: "inst-gobierno", role: "Impulsor de la transposición" },
        { nodeId: "inst-ce", role: "Marco regulatorio (AI Act)" },
        { nodeId: "party-pp", role: "Favorable con matices sectoriales" },
        { nodeId: "party-sumar", role: "Énfasis en derechos laborales ante la IA" },
        { nodeId: "ley-ia", role: "Legislación en tramitación" },
      ],
      hotTopics: ["inteligencia artificial", "AI Act", "AESIA", "regulación tecnológica", "automatización", "derechos digitales"],
      activationSequence: [
        {
          order: 1,
          sourceType: "EuropeanInstitution",
          agentLabel: "Comisión Europea",
          content: "Publicación de las guías de implementación del AI Act (Reglamento 2024/1689). Plazo para los Estados miembros: agosto 2026 para las primeras categorías de riesgo.",
          timestamp: "2025-11-15T09:00:00Z",
        },
        {
          order: 2,
          sourceType: "GovernmentAgency",
          agentLabel: "Secretaría de Estado de Digitalización",
          content: "España presenta el borrador de la Ley de IA en consulta pública. Propone la AESIA como autoridad supervisora con 200 empleados y presupuesto de 45M.",
          timestamp: "2026-01-20T10:00:00Z",
        },
        {
          order: 3,
          sourceType: "PrivateSector",
          agentLabel: "Patronal tecnológica (DigitalES / Ametic)",
          content: "Las patronales tecnológicas piden un 'sandbox regulatorio' de 18 meses y la exclusión de startups con menos de 50 empleados. Lobby activo en el Congreso.",
          timestamp: "2026-02-10T12:00:00Z",
        },
        {
          order: 4,
          sourceType: "PoliticalParty",
          agentLabel: "Sumar (Aina Vidal)",
          content: "Sumar presenta enmiendas para incluir evaluación de impacto laboral obligatoria y un fondo de reciclaje profesional. 'La IA no puede ser excusa para despidos encubiertos.'",
          timestamp: "2026-03-05T14:00:00Z",
        },
        {
          order: 5,
          sourceType: "Parliament",
          agentLabel: "Comisión de Economía",
          content: "Comparecencia de expertos en la Comisión de Economía: 14 ponentes en 3 sesiones. Consenso transversal en la necesidad de regular pero divergencia en los plazos.",
          timestamp: "2026-03-20T10:00:00Z",
        },
        {
          order: 6,
          sourceType: "PoliticalParty",
          agentLabel: "PP (Juan Bravo)",
          content: "El PP anuncia que votará a favor del proyecto 'con reservas' si se suaviza el régimen sancionador y se amplía el sandbox. Primera ley con perspectivas de consenso amplio.",
          timestamp: "2026-04-05T11:30:00Z",
        },
        {
          order: 7,
          sourceType: "GovernmentAgency",
          agentLabel: "Presidencia del Gobierno",
          content: "Sánchez anuncia en Davos: 'España será la sede de la Agencia Europea de IA del sur.' Apuesta estratégica vinculada a los fondos NGEU.",
          timestamp: "2026-04-08T16:00:00Z",
        },
      ],
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// GRAPH STATISTICS
// ═══════════════════════════════════════════════════════════════════════════

function computeStats(nodes: GraphNode[], edges: GraphEdge[]): DecisionGraphData["stats"] {
  const connectionCount = new Map<string, number>();

  for (const node of nodes) {
    connectionCount.set(node.id, 0);
  }

  for (const edge of edges) {
    connectionCount.set(edge.source, (connectionCount.get(edge.source) ?? 0) + 1);
    connectionCount.set(edge.target, (connectionCount.get(edge.target) ?? 0) + 1);
  }

  let mostConnectedId = "";
  let maxConns = 0;
  for (const [id, count] of Array.from(connectionCount.entries())) {
    if (count > maxConns) {
      maxConns = count;
      mostConnectedId = id;
    }
  }

  const mostConnectedNode = nodes.find((n) => n.id === mostConnectedId);
  const totalConnections = Array.from(connectionCount.values()).reduce((a, b) => a + b, 0);
  const groups = new Set(nodes.map((n) => n.group).filter(Boolean));

  // Graph density = 2 * |E| / (|V| * (|V| - 1))
  const n = nodes.length;
  const density = n > 1 ? (2 * edges.length) / (n * (n - 1)) : 0;

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    avgConnections: nodes.length > 0 ? Math.round((totalConnections / nodes.length) * 100) / 100 : 0,
    mostConnectedNode: {
      id: mostConnectedId,
      label: mostConnectedNode?.label ?? "unknown",
      connections: maxConns,
    },
    clusterCount: groups.size,
    density: Math.round(density * 10000) / 10000,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN BUILDER
// ═══════════════════════════════════════════════════════════════════════════

export function buildPoliticalGraph(): DecisionGraphData {
  // Reset edge counter for idempotent builds
  edgeCounter = 0;

  // Build all nodes
  const nodes: GraphNode[] = [
    ...buildPartyNodes(),
    ...buildInstitutionNodes(),
    ...buildCommissionNodes(),
    ...buildVoteNodes(),
    ...buildTerritoryNodes(),
    ...buildPoliticianNodes(),
    ...buildLegislationNodes(),
  ];

  // Build all edges
  const edges: GraphEdge[] = [
    ...buildPartyVoteEdges(),
    ...buildPartyInstitutionEdges(),
    ...buildCoalitionEdges(),
    ...buildPoliticianPartyEdges(),
    ...buildPoliticianInstitutionEdges(),
    ...buildTerritoryEdges(),
    ...buildCoherenceConflictEdges(),
    ...buildLegislationEdges(),
    ...buildTranscriptEdges(),
  ];

  // Build decision paths and narrative threads
  const decisionPaths = buildDecisionPaths();
  const narrativeThreads = buildNarrativeThreads();

  // Compute stats
  const stats = computeStats(nodes, edges);

  return { nodes, edges, decisionPaths, narrativeThreads, stats };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS — Filtered views and lookups
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Returns a filtered view of the graph. Useful for rendering partial views
 * (e.g. only parties and votes, or only nodes above a connection threshold).
 */
export function getGraphForView(filter?: {
  nodeTypes?: NodeType[];
  minWeight?: number;
}): DecisionGraphData {
  const full = buildPoliticalGraph();

  if (!filter) return full;

  let filteredNodes = full.nodes;
  if (filter.nodeTypes && filter.nodeTypes.length > 0) {
    filteredNodes = full.nodes.filter((n) => filter.nodeTypes!.includes(n.type));
  }

  const nodeIds = new Set(filteredNodes.map((n) => n.id));

  let filteredEdges = full.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  if (filter.minWeight !== undefined) {
    filteredEdges = filteredEdges.filter((e) => e.weight >= filter.minWeight!);
  }

  const stats = computeStats(filteredNodes, filteredEdges);

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    decisionPaths: full.decisionPaths,
    narrativeThreads: full.narrativeThreads,
    stats,
  };
}

/**
 * Returns all neighbors of a given node: the connected nodes and the edges
 * that link them.
 */
export function getNodeNeighbors(
  nodeId: string
): { node: GraphNode; edges: GraphEdge[] }[] {
  const full = buildPoliticalGraph();
  const nodeMap = new Map(full.nodes.map((n) => [n.id, n]));

  // Collect neighbor IDs and associated edges
  const neighborEdges = new Map<string, GraphEdge[]>();

  for (const edge of full.edges) {
    let neighborId: string | null = null;
    if (edge.source === nodeId) neighborId = edge.target;
    else if (edge.target === nodeId) neighborId = edge.source;

    if (neighborId) {
      if (!neighborEdges.has(neighborId)) {
        neighborEdges.set(neighborId, []);
      }
      neighborEdges.get(neighborId)!.push(edge);
    }
  }

  const results: { node: GraphNode; edges: GraphEdge[] }[] = [];
  for (const [nId, edges] of Array.from(neighborEdges.entries())) {
    const node = nodeMap.get(nId);
    if (node) {
      results.push({ node, edges });
    }
  }

  // Sort by number of connecting edges descending
  results.sort((a, b) => b.edges.length - a.edges.length);
  return results;
}

/**
 * Look up a decision path by ID.
 */
export function getDecisionPathById(id: string): DecisionPath | undefined {
  const full = buildPoliticalGraph();
  return full.decisionPaths.find((dp) => dp.id === id);
}

/**
 * Look up a narrative thread by ID.
 */
export function getNarrativeById(id: string): NarrativeThread | undefined {
  const full = buildPoliticalGraph();
  return full.narrativeThreads.find((nt) => nt.id === id);
}
