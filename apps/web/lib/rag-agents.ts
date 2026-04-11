/* ═══════════════════════════════════════════════════════════════════════════
   RAG Agents — 5 specialized retrieval pipelines for /ask
   Each agent searches its domain data and builds context for the LLM.
   ═══════════════════════════════════════════════════════════════════════════ */

import { euLegislation, infringementProcedures, transpositionSummary } from "./eurlex-data";
import { auditReports, auditSummary } from "./audit-data";
import { parliamentarySessions, transcriptSources } from "./sessions-data";
import { publicContracts, publicSubsidies, contractsSummary } from "./contracts-data";
import { stateRevenue2026, stateSpending2026, ngeuPlan, ngeuDisbursements, territoryFiscalProfiles, diputacionBudgets, ayuntamientoBudgets } from "./finance-data";
import { plenaryVotes, partyDisciplineStats } from "./voting-data";
import { congressGroups, senateGroups } from "./parliamentary-data";
import { nationalIndicators, ccaaIndicators } from "./ine-data";
import { euComparisons } from "./eurostat-data";
import { assetDeclarations } from "./declarations-data";
import { companyForms, businessProcedures, businessRegulations, businessStats2025, businessIncentives } from "./business-data";
import { readArchive } from "./rss-store";
import {
  parties,
  politicians,
  territories,
  parliamentaryInitiatives,
  officialConnectors,
} from "@espanaia/seed-data";
import { ministries } from "./ministerios-data";

// ── Types ────────────────────────────────────────────────────────────────────

export type AgentId = "normativo" | "presupuestario" | "politico-social" | "empresarial" | "medios" | "ministerios";

export interface RAGResult {
  agentId: AgentId;
  agentName: string;
  context: string[];
  sources: string[];
}

export interface AskResult {
  agents: RAGResult[];
  combinedContext: string;
  routedTo: AgentId[];
}

// ── Intent Router ────────────────────────────────────────────────────────────

const NORMATIVO_KEYWORDS = [
  "ley", "norma", "boe", "decreto", "directiva", "reglamento", "legislación",
  "legislacion", "eur-lex", "transposición", "transposicion", "infracción",
  "infraccion", "regulación", "regulacion", "artículo", "articulo", "jurídico",
  "juridico", "legal", "tribunal", "constitucional", "orgánica", "organica",
  "reforma", "código", "codigo", "boletín", "boletin", "normativo", "normativa",
  "contrato", "licitación", "licitacion", "adjudicación", "adjudicacion",
  "subvención", "subvencion", "auditoría", "auditoria", "fiscalización",
  "fiscalizacion", "tribunal de cuentas",
];

const PRESUPUESTARIO_KEYWORDS = [
  "presupuesto", "gasto", "ingreso", "déficit", "deficit", "deuda", "ejecución",
  "ejecucion", "recaudación", "recaudacion", "impuesto", "fiscal", "financiación",
  "financiacion", "fondos", "ngeu", "next generation", "perte", "dinero",
  "millones", "euros", "pib", "gdp", "inflación", "inflacion", "hacienda",
  "igae", "desembolso", "transferencia", "inversión", "inversion", "subsidio",
  "eurostat", "europa", "ue", "brecha", "indicador", "paro", "desempleo",
  "pobreza", "gini", "renovable", "emisiones", "digital", "educación", "educacion",
  "diputación", "diputacion", "provincial", "provincia", "ayuntamiento", "municipal",
  "municipio", "alcalde", "concejal", "ibi", "cabildo", "foral",
];

const POLITICO_KEYWORDS = [
  "partido", "diputado", "senador", "congreso", "senado", "parlamento",
  "votación", "votacion", "pleno", "plenaria", "coalición", "coalicion",
  "gobierno", "oposición", "oposicion", "psoe", "pp", "vox", "sumar",
  "erc", "pnv", "bildu", "junts", "político", "politico", "ministro",
  "presidente", "comunidad autónoma", "comunidad autonoma", "ccaa",
  "declaración", "declaracion", "bienes", "patrimonio", "transparencia",
  "escaño", "escano", "grupo parlamentario", "disciplina", "iniciativa",
  "proposición", "proposicion", "pedro", "sánchez", "sanchez", "feijóo",
  "feijoo", "abascal", "díaz", "diaz", "actor", "elecciones", "electoral",
  "sesión", "sesion", "transcripción", "transcripcion", "diario de sesiones",
  "actas", "intervención", "intervencion", "comparecencia", "interpelación",
  "interpelacion", "pregunta oral",
];

const EMPRESARIAL_KEYWORDS = [
  "empresa", "crear empresa", "emprender", "emprendedor", "autónomo", "autonomo",
  "startup", "pyme", "sociedad limitada", "sociedad anónima", "sociedad anonima",
  "sl", "sa", "s.l.", "s.a.", "constitución", "constitucion", "mercantil",
  "registro mercantil", "borme", "nif", "alta", "licencia", "apertura",
  "factura electrónica", "factura electronica", "kit digital", "enisa",
  "ico", "subvención", "subvencion", "incentivo", "bonificación", "bonificacion",
  "tarifa plana", "stock option", "crowdfunding", "financiación", "financiacion",
  "inversión", "inversion", "negocio", "montar", "abrir", "comercio",
  "franquicia", "cooperativa", "comunidad de bienes", "notario", "escritura",
  "estatutos", "capital social", "crea y crece", "ley startups", "segunda oportunidad",
  "insolvencia", "concursal", "ia act", "inteligencia artificial", "csrd",
  "sostenibilidad", "diligencia debida", "due diligence", "morosidad",
  "supervivencia", "sector", "perte", "digitalización", "digitalizacion",
  "zona franca", "canarias", "zec", "ric", "i+d", "innovación", "innovacion",
];

const MEDIOS_KEYWORDS = [
  "noticia", "noticias", "prensa", "periódico", "periodico", "diario",
  "medio", "medios", "titular", "titulares", "portada", "última hora",
  "ultima hora", "actualidad", "hoy", "ayer", "semana", "reciente",
  "rtve", "el país", "el pais", "el mundo", "abc", "la vanguardia",
  "20 minutos", "eldiario", "el confidencial", "público", "europa press",
  "cobertura", "opinión", "opinion", "editorial", "reportaje",
  "qué dicen", "que dicen", "qué se dice", "que se dice", "trending",
  "viral", "escándalo", "escandalo", "polémica", "polemica", "dimisión",
  "dimision", "crisis", "urgente", "última", "ultima", "breaking",
];

const MINISTERIOS_KEYWORDS = [
  "ministerio", "ministerios", "ministro", "ministra", "secretaría de estado", "secretaria de estado",
  "dirección general", "direccion general", "organismo autónomo", "organismo autonomo",
  "gobierno", "gabinete", "consejo de ministros", "moncloa", "ejecutivo",
  "estructura", "administración", "administracion", "departamento", "agencia",
  "alto cargo", "secretario", "subsecretario", "director general",
  "presidencia", "hacienda", "defensa", "interior", "exteriores", "transportes",
  "transformación digital", "transformacion digital", "educación", "educacion",
  "trabajo", "industria", "turismo", "agricultura", "economía", "economia",
  "sanidad", "ciencia", "igualdad", "cultura", "inclusión", "inclusion",
  "transición ecológica", "transicion ecologica", "vivienda", "juventud",
  "infancia", "derechos sociales", "consumo",
  "bolaños", "bolanos", "robles", "marlaska", "puente", "escrivá", "escriva",
  "morant", "montero", "urtasun", "sira rego", "subirats",
  "empleados públicos", "empleados publicos", "funcionarios", "función pública",
  "funcion publica", "pge", "presupuestos generales",
];

/** Max chunks any single agent can return — enables early termination */
const MAX_CHUNKS_PER_AGENT = 5;

export function classifyIntent(question: string): AgentId[] {
  const q = question.toLowerCase();
  const scores: Record<AgentId, number> = {
    normativo: 0,
    presupuestario: 0,
    "politico-social": 0,
    empresarial: 0,
    medios: 0,
    ministerios: 0,
  };

  for (const kw of NORMATIVO_KEYWORDS) {
    if (q.includes(kw)) scores.normativo++;
  }
  for (const kw of PRESUPUESTARIO_KEYWORDS) {
    if (q.includes(kw)) scores.presupuestario++;
  }
  for (const kw of POLITICO_KEYWORDS) {
    if (q.includes(kw)) scores["politico-social"]++;
  }
  for (const kw of EMPRESARIAL_KEYWORDS) {
    if (q.includes(kw)) scores.empresarial++;
  }
  for (const kw of MEDIOS_KEYWORDS) {
    if (q.includes(kw)) scores.medios++;
  }
  for (const kw of MINISTERIOS_KEYWORDS) {
    if (q.includes(kw)) scores.ministerios++;
  }

  // Sort by score descending
  const sorted = (Object.entries(scores) as [AgentId, number][])
    .sort((a, b) => b[1] - a[1]);

  // If top score is 0, route to top 2 agents (not all 4)
  if (sorted[0][1] === 0) return [sorted[0][0], sorted[1][0]];

  // Activate top 3 agents that scored > 0 (allows medios alongside domain agents)
  const active = sorted.filter(([, s]) => s > 0).map(([id]) => id);
  return active.slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════════════════
// Agent 1: NORMATIVO — Legal & regulatory data
// ═══════════════════════════════════════════════════════════════════════════

function searchNormativo(question: string): RAGResult {
  const q = question.toLowerCase();
  const context: string[] = [];
  const sources: string[] = [];

  // Search EU legislation
  for (const law of euLegislation) {
    const text = `${law.title} ${law.summary} ${law.impactOnSpain} ${law.sector}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Legislación UE] ${law.title} (${law.celex}): ${law.summary}. ` +
        `Estado en España: ${law.transpositionStatus ?? "N/A"}. Impacto: ${law.impactOnSpain}. ` +
        `Fecha límite: ${law.transpositionDeadline ?? "N/A"}. Sector: ${law.sector}.`
      );
      sources.push(`EUR-Lex: ${law.celex}`);
    }
  }

  // Search infringement procedures
  for (const inf of infringementProcedures) {
    const text = `${inf.subject} ${inf.summary} ${inf.directive ?? ""} ${inf.sector}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Infracción UE] ${inf.subject}: ${inf.summary}. ` +
        `Fase: ${inf.stage}. Multa potencial: ${inf.potentialFineM ?? 0} M€.`
      );
      sources.push(`Procedimiento de infracción: ${inf.caseNumber}`);
    }
  }

  // Transposition summary always useful for normative questions
  if (q.includes("transpos") || q.includes("directiva") || q.includes("normativ")) {
    context.push(
      `[Transposición] De ${transpositionSummary.totalDirectives} directivas: ` +
      `${transpositionSummary.transpuestas} transpuestas, ${transpositionSummary.enPlazo} en plazo, ` +
      `${transpositionSummary.retrasadas} retrasadas, ${transpositionSummary.incumplimiento} en incumplimiento.`
    );
    sources.push("Transposición de directivas UE");
  }

  // Audit reports
  for (const report of auditReports) {
    const text = `${report.title} ${report.auditedEntity} ${report.summary}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Auditoría] ${report.title}: Calificación ${report.rating}. ` +
        `${report.totalFindingsCount} hallazgos. ` +
        `Importe cuestionado: ${report.amountQuestionedM ?? 0} M€.`
      );
      sources.push(`Tribunal de Cuentas: ${report.title.substring(0, 50)}`);
    }
  }

  // Public contracts
  for (const contract of publicContracts) {
    const text = `${contract.title} ${contract.entity} ${contract.contractType} ${contract.summary}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Contrato público] ${contract.title}: ${contract.amountM} M€. ` +
        `Entidad: ${contract.entity}. Estado: ${contract.status}. Tipo: ${contract.contractType}.`
      );
      sources.push(`Contratación pública: ${contract.title.substring(0, 50)}`);
    }
  }

  // Subsidies
  for (const sub of publicSubsidies) {
    const text = `${sub.title} ${sub.grantingBody} ${sub.summary}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Subvención] ${sub.title}: ${sub.amountM} M€. ` +
        `Organismo: ${sub.grantingBody}. Tipo beneficiario: ${sub.beneficiaryType}.`
      );
      sources.push(`Subvenciones: ${sub.title.substring(0, 50)}`);
    }
  }

  // Parliamentary initiatives (legislative activity)
  for (const ini of parliamentaryInitiatives) {
    const text = `${ini.title} ${ini.commission ?? ""}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Iniciativa] ${ini.dossierNumber}: ${ini.title}. ` +
        `Estado: ${ini.status}. Comisión: ${ini.commission ?? "N/A"}. ` +
        `${ini.result ? `Resultado: ${ini.result}.` : ""}`
      );
      sources.push(`Congreso: ${ini.dossierNumber}`);
    }
  }

  return { agentId: "normativo", agentName: "RAG Normativo", context, sources };
}

// ═══════════════════════════════════════════════════════════════════════════
// Agent 2: PRESUPUESTARIO — Budget, finance, EU comparisons
// ═══════════════════════════════════════════════════════════════════════════

function searchPresupuestario(question: string): RAGResult {
  const q = question.toLowerCase();
  const context: string[] = [];
  const sources: string[] = [];

  // State revenue
  if (q.includes("ingreso") || q.includes("recaudación") || q.includes("recaudacion") || q.includes("impuesto") || q.includes("presupuesto")) {
    const totalRev = stateRevenue2026.reduce((s, r) => s + r.amountB, 0);
    context.push(
      `[Ingresos 2026] Total estimado: ${totalRev.toFixed(1)} Md€. ` +
      stateRevenue2026.map(r => `${r.category}: ${r.amountB} Md€ (${r.pctOfTotal}% del total)`).join(". ") + "."
    );
    sources.push("IGAE — Ingresos del Estado 2026");
  }

  // State spending
  if (q.includes("gasto") || q.includes("presupuesto") || q.includes("inversión") || q.includes("inversion")) {
    const totalSpend = stateSpending2026.reduce((s, r) => s + r.amountB, 0);
    context.push(
      `[Gastos 2026] Total estimado: ${totalSpend.toFixed(1)} Md€. ` +
      stateSpending2026.map(r => `${r.label}: ${r.amountB} Md€`).join(". ") + "."
    );
    sources.push("IGAE — Gastos del Estado 2026");
  }

  // NGEU
  if (q.includes("ngeu") || q.includes("next generation") || q.includes("perte") || q.includes("fondos europeos") || q.includes("recuperación") || q.includes("recuperacion")) {
    context.push(`[NGEU] Plan total: ${ngeuPlan.totalB} Md€.`);
    for (const t of ngeuDisbursements) {
      context.push(
        `[NGEU Tramo] ${t.tranche}: ${t.amountB} Md€. Estado: ${t.status}. Solicitud: ${t.requestDate}. Desembolso: ${t.disbursementDate ?? "Pendiente"}.`
      );
    }
    sources.push("NextGenerationEU — Plan de Recuperación");
  }

  // Territory fiscal profiles
  const territoryNames = territories.map(t => t.name.toLowerCase());
  for (const tf of territoryFiscalProfiles) {
    if (q.includes(tf.territorySlug) || territoryNames.some(tn => q.includes(tn))) {
      context.push(
        `[Fiscal CCAA] ${tf.territorySlug}: Presupuesto total ${tf.totalBudgetM} M€. ` +
        `Ingreso per cápita: ${tf.revenuePerCapita} €, gasto per cápita: ${tf.spendPerCapita} €. ` +
        `Deuda: ${tf.debtPctGdp}% PIB. Fondos UE: ${tf.euFundsReceivedM} M€. ` +
        `Transferencias del Estado: ${tf.stateTransfersM} M€.`
      );
      sources.push(`Hacienda — Perfil fiscal: ${tf.territorySlug}`);
    }
  }

  // Eurostat comparisons
  for (const comp of euComparisons) {
    const text = `${comp.indicator} ${comp.category}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Eurostat] ${comp.indicator}: España ${comp.spain} ${comp.unit} vs UE-27 ${comp.eu27} ${comp.unit}. ` +
        `Alemania: ${comp.germany}, Francia: ${comp.france}, Italia: ${comp.italy}.`
      );
      sources.push(`Eurostat: ${comp.indicator}`);
    }
  }

  // INE national indicators
  if (q.includes("paro") || q.includes("desempleo") || q.includes("pib") || q.includes("inflación") || q.includes("inflacion") || q.includes("pobreza") || q.includes("indicador") || q.includes("españa") || q.includes("espana") || q.includes("nacional")) {
    const ni = nationalIndicators;
    context.push(
      `[INE España] Población: ${ni.population.toLocaleString("es-ES")}. PIB: ${ni.gdpM.toLocaleString("es-ES")} M€ (${ni.gdpGrowthPct}% crecimiento). ` +
      `PIB per cápita: ${ni.gdpPerCapita.toLocaleString("es-ES")} €. Paro: ${ni.unemploymentRate}% (juvenil: ${ni.youthUnemploymentRate}%). ` +
      `IPC: ${ni.cpiAnnual}%. Riesgo de pobreza: ${ni.povertyRiskRate}%. Gini: ${ni.giniIndex}. ` +
      `Esperanza de vida: ${ni.lifeExpectancy}. Salario medio: ${ni.averageSalary.toLocaleString("es-ES")} €.`
    );
    sources.push("INE — Indicadores nacionales");
  }

  // CCAA indicators when a specific territory is mentioned
  for (const ccaa of ccaaIndicators) {
    const terrName = territories.find(t => t.slug === ccaa.territorySlug)?.name ?? ccaa.territorySlug;
    if (q.includes(terrName.toLowerCase()) || q.includes(ccaa.territorySlug)) {
      context.push(
        `[INE ${terrName}] Población: ${ccaa.population.toLocaleString("es-ES")}. PIB: ${ccaa.gdpM.toLocaleString("es-ES")} M€ (${ccaa.gdpGrowthPct}%). ` +
        `Paro: ${ccaa.unemploymentRate}% (juvenil: ${ccaa.youthUnemploymentRate}%). ` +
        `IPC: ${ccaa.cpiAnnual}%. Pobreza: ${ccaa.povertyRiskRate}%. Salario: ${ccaa.averageSalary.toLocaleString("es-ES")} €.`
      );
      sources.push(`INE — Indicadores: ${terrName}`);
    }
  }

  // Audit summary for fiscal questions
  if (q.includes("auditoría") || q.includes("auditoria") || q.includes("tribunal de cuentas") || q.includes("fiscalización") || q.includes("fiscalizacion")) {
    context.push(
      `[Tribunal de Cuentas] ${auditSummary.totalReports} informes. ` +
      `Favorables: ${auditSummary.favorable}, Con salvedades: ${auditSummary.conSalvedades}, ` +
      `Desfavorables: ${auditSummary.desfavorable}. Total cuestionado: ${auditSummary.totalQuestionedM} M€. ` +
      `Hallazgos críticos: ${auditSummary.criticalFindings}.`
    );
    sources.push("Tribunal de Cuentas — Resumen");
  }

  // Contracts summary
  if (q.includes("contrat") || q.includes("licitación") || q.includes("licitacion")) {
    context.push(
      `[Contratación] Total: ${contractsSummary.totalValueM.toLocaleString("es-ES")} M€ en ${contractsSummary.totalContractsTracked} contratos. ` +
      `Adjudicados: ${contractsSummary.adjudicados}, En licitación: ${contractsSummary.enLicitacion}. ` +
      Object.entries(contractsSummary.byType).map(([k, v]) => `${k}: ${(v as { count: number; totalM: number }).count} (${(v as { count: number; totalM: number }).totalM} M€)`).join(", ") + "."
    );
    sources.push("Contratación pública — Resumen");
  }

  // Diputaciones provinciales
  const isDiputacionQuery = q.includes("diputación") || q.includes("diputacion") || q.includes("provincial") || q.includes("foral") || q.includes("cabildo");
  for (const dip of diputacionBudgets) {
    const text = `${dip.name} ${dip.province} ${dip.slug} ${dip.type}`.toLowerCase();
    if (isDiputacionQuery || q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Diputación] ${dip.name} (${dip.type}): Presupuesto ${dip.totalBudgetM} M€. ` +
        `Ingresos: ${dip.revenueM} M€, Gastos: ${dip.spendingM} M€. ` +
        `Deuda: ${dip.debtM} M€ (${dip.debtPerCapita} €/hab). ` +
        `Población: ${dip.population.toLocaleString("es-ES")}. Empleados: ${dip.employeeCount}. ` +
        `Ingresos propios: ${dip.ownRevenueM} M€, Transferencias del Estado: ${dip.stateTransfersM} M€. ` +
        `Inversión: ${dip.investmentM} M€.`
      );
      sources.push(`Haciendas Locales — ${dip.name}`);
    }
  }

  // Ayuntamientos
  const isAyuntamientoQuery = q.includes("ayuntamiento") || q.includes("municipal") || q.includes("municipio") || q.includes("alcalde") || q.includes("ibi");
  for (const ayu of ayuntamientoBudgets) {
    const text = `${ayu.name} ${ayu.province} ${ayu.slug}`.toLowerCase();
    if (isAyuntamientoQuery || q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Ayuntamiento] ${ayu.name}: Presupuesto ${ayu.totalBudgetM} M€. ` +
        `Ingresos: ${ayu.revenueM} M€, Gastos: ${ayu.spendingM} M€. ` +
        `Deuda: ${ayu.debtM} M€ (${ayu.debtPerCapita} €/hab). ` +
        `Población: ${ayu.population.toLocaleString("es-ES")}. Empleados: ${ayu.employeeCount}. ` +
        `IBI recaudado: ${ayu.ibiRecaudacionM} M€. Inversión: ${ayu.investmentM} M€. ` +
        `Capital: ${ayu.isCapital ? "Sí" : "No"}.`
      );
      sources.push(`Haciendas Locales — ${ayu.name}`);
    }
  }

  return { agentId: "presupuestario", agentName: "RAG Presupuestario", context, sources };
}

// ═══════════════════════════════════════════════════════════════════════════
// Agent 3: POLÍTICO-SOCIAL — Politicians, parties, voting, transparency
// ═══════════════════════════════════════════════════════════════════════════

function searchPoliticoSocial(question: string): RAGResult {
  const q = question.toLowerCase();
  const context: string[] = [];
  const sources: string[] = [];

  // Parties
  for (const party of parties) {
    const text = `${party.officialName} ${party.shortName} ${party.acronym} ${party.positioning}`.toLowerCase();
    if (q.includes(party.acronym.toLowerCase()) || q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Partido] ${party.shortName} (${party.acronym}): ${party.positioning}. ` +
        `Ámbito: ${party.scopeType}. Ideología: ${party.ideology ?? "N/A"}.`
      );
      sources.push(`Partido: ${party.shortName}`);
    }
  }

  // Politicians
  for (const pol of politicians) {
    const text = `${pol.fullName} ${pol.currentRoleSummary} ${pol.currentPartySlug}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Político] ${pol.fullName}: ${pol.currentRoleSummary}. ` +
        `Partido: ${pol.currentPartySlug}. Territorio: ${pol.territorySlug}.`
      );
      sources.push(`Político: ${pol.fullName}`);
    }
  }

  // Congress composition
  if (q.includes("congreso") || q.includes("diputado") || q.includes("escaño") || q.includes("escano") || q.includes("grupo parlamentario")) {
    context.push(
      `[Congreso] Composición: ` +
      congressGroups.map(g => `${g.name}: ${g.seats} escaños`).join(", ") +
      ". Total: 350 diputados."
    );
    sources.push("Congreso de los Diputados — Composición");
  }

  // Senate composition
  if (q.includes("senado") || q.includes("senador")) {
    context.push(
      `[Senado] Composición: ` +
      senateGroups.map(g => `${g.name}: ${g.seats} escaños`).join(", ") +
      ". Total: 265 senadores."
    );
    sources.push("Senado — Composición");
  }

  // Plenary votes
  for (const vote of plenaryVotes) {
    const text = `${vote.title} ${vote.category}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      const breakdown = vote.partyBreakdown
        .slice(0, 5)
        .map(pb => `${pb.partySlug}: Sí=${pb.si} No=${pb.no} Abs=${pb.abstencion}`)
        .join(", ");
      context.push(
        `[Votación] ${vote.title} (${vote.sessionDate}): Resultado ${vote.result}. ` +
        `Sí: ${vote.si}, No: ${vote.no}, Abs: ${vote.abstencion}. ` +
        `Desglose: ${breakdown}.`
      );
      sources.push(`Votación plenaria: ${vote.title.substring(0, 50)}`);
    }
  }

  // Party discipline
  if (q.includes("disciplina") || q.includes("coherencia") || q.includes("abstención") || q.includes("abstencion")) {
    for (const d of partyDisciplineStats) {
      const party = parties.find(p => p.slug === d.partySlug);
      if (party) {
        context.push(
          `[Disciplina] ${party.shortName}: ${d.disciplineRate}% disciplina en ${d.chamber}. ` +
          `Votos totales: ${d.totalVotes}. Rebeliones: ${d.rebellions}. Ausencias: ${d.absenceRate}%.`
        );
      }
    }
    sources.push("Congreso — Disciplina de voto");
  }

  // Asset declarations
  for (const decl of assetDeclarations) {
    const name = decl.politicianSlug.replace(/-/g, " ");
    if (q.includes(name) || q.includes("declaración") || q.includes("declaracion") || q.includes("patrimonio") || q.includes("transparencia")) {
      const income = decl.income.reduce((s, i) => s + (i.annualAmount ?? 0), 0);
      context.push(
        `[Declaración] ${name}: Cámara: ${decl.chamber}. ` +
        `Inmuebles: ${decl.realEstate.length}. Depósitos: ${decl.bankDeposits.range}. ` +
        `Ingresos anuales: ${income.toLocaleString("es-ES")} €.`
      );
      sources.push(`Declaración de bienes: ${name}`);
    }
  }

  // Territories
  for (const terr of territories) {
    if (q.includes(terr.name.toLowerCase()) || q.includes(terr.slug)) {
      context.push(
        `[Territorio] ${terr.name} (${terr.shortCode}): ` +
        `Pulso: ${terr.pulseScore}. Foco estratégico: ${terr.strategicFocus}.`
      );
      sources.push(`Territorio: ${terr.name}`);
    }
  }

  // Parliamentary sessions & transcripts
  const isSessionQuery = q.includes("sesión") || q.includes("sesion") || q.includes("pleno") || q.includes("transcripción") || q.includes("transcripcion") || q.includes("diario de sesiones") || q.includes("debate") || q.includes("comisión") || q.includes("comision") || q.includes("comparecencia");
  for (const session of parliamentarySessions) {
    const text = `${session.title} ${session.summary} ${session.keyTopics.join(" ")}`.toLowerCase();
    if (isSessionQuery || q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      const votaciones = session.agendaItems.filter(a => a.voteSummary);
      const voteInfo = votaciones.length > 0
        ? ` Votaciones: ${votaciones.map(v => `${v.title} (${v.result})`).join("; ")}.`
        : "";
      context.push(
        `[Sesión ${session.date}] ${session.title} (${session.institution}): ${session.summary}` +
        ` Duración: ${session.durationMinutes ?? "N/A"} min. Intervenciones: ${session.speakers.length}.${voteInfo}` +
        ` Transcripción: ${session.transcriptUrl}`
      );
      sources.push(`Diario de Sesiones: ${session.title.substring(0, 50)}`);
    }
  }

  // Transcript source info
  if (q.includes("transcripción") || q.includes("transcripcion") || q.includes("diario de sesiones") || q.includes("actas")) {
    const nacional = transcriptSources.filter(ts => ts.chamber === "congreso" || ts.chamber === "senado" || ts.chamber === "comision");
    const ccaa = transcriptSources.filter(ts => ts.chamber === "parlamento-ccaa");
    context.push(
      `[Fuentes de transcripciones] ${transcriptSources.length} fuentes de Diarios de Sesiones disponibles. ` +
      `Nacional: ${nacional.length} (Congreso pleno + comisiones, Senado pleno + comisiones). ` +
      `Parlamentos autonómicos: ${ccaa.length} CCAA con transcripciones. ` +
      `Formatos: PDF (mayoría), HTML (Cataluña, Andalucía).`
    );
    sources.push("Diarios de Sesiones — Registro de fuentes");
  }

  return { agentId: "politico-social", agentName: "RAG Político-Social", context, sources };
}

// ═══════════════════════════════════════════════════════════════════════════
// Agent 4: EMPRESARIAL — Business creation, regulations, incentives
// ═══════════════════════════════════════════════════════════════════════════

function searchEmpresarial(question: string): RAGResult {
  const q = question.toLowerCase();
  const context: string[] = [];
  const sources: string[] = [];

  // Company legal forms
  for (const form of companyForms) {
    const text = `${form.name} ${form.acronym} ${form.bestFor} ${form.notes}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 2 && text.includes(w))) {
      context.push(
        `[Forma jurídica] ${form.name} (${form.acronym}): Capital mínimo ${form.minCapital} €. ` +
        `Socios: ${form.minPartners}${form.maxPartners ? `–${form.maxPartners}` : "+"}. ` +
        `Responsabilidad: ${form.liability}. Régimen fiscal: ${form.taxRegime}. ` +
        `Coste registro: ${form.registrationCost}. Tiempo: ${form.timeToIncorporate}. ` +
        `Ideal para: ${form.bestFor}. Ley clave: ${form.keyLaw}. ${form.notes}`
      );
      sources.push(`Forma jurídica: ${form.acronym}`);
    }
  }

  // Business creation procedures
  const isProcedureQuery = q.includes("crear") || q.includes("montar") || q.includes("abrir") || q.includes("constituir") || q.includes("constitución") || q.includes("constitucion") || q.includes("trámite") || q.includes("tramite") || q.includes("paso") || q.includes("procedimiento") || q.includes("requisito");
  if (isProcedureQuery) {
    for (const proc of businessProcedures) {
      context.push(
        `[Trámite ${proc.step}] ${proc.title}: ${proc.description} ` +
        `Entidad: ${proc.entity}. Tiempo: ${proc.timeEstimate}. Coste: ${proc.cost}. ` +
        `Online: ${proc.isDigital ? "Sí" : "No"}.`
      );
    }
    sources.push("Guía de trámites — Creación de empresas");
  }

  // Business regulations & EU initiatives
  for (const reg of businessRegulations) {
    const text = `${reg.title} ${reg.summary} ${reg.impactOnBusiness} ${reg.tags.join(" ")}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[${reg.type === "ley-nacional" ? "Ley" : reg.type === "real-decreto" ? "RD" : reg.type === "directiva-ue" ? "Directiva UE" : reg.type === "reglamento-ue" ? "Reglamento UE" : reg.type === "propuesta-ue" ? "Propuesta UE" : "Iniciativa"}] ` +
        `${reg.title}: ${reg.summary} ` +
        `Estado: ${reg.status}. Impacto: ${reg.impactOnBusiness} ` +
        `Efecto fiscal: ${reg.fiscalImpact}. Sectores: ${reg.affectedSectors.join(", ")}.`
      );
      sources.push(`${reg.source}: ${reg.title.substring(0, 60)}`);
    }
  }

  // Business statistics
  const isStatsQuery = q.includes("estadística") || q.includes("estadistica") || q.includes("cuántas") || q.includes("cuantas") || q.includes("número") || q.includes("numero") || q.includes("supervivencia") || q.includes("tasa") || q.includes("sector") || q.includes("dato");
  if (isStatsQuery || q.includes("empresa") || q.includes("pyme") || q.includes("autónomo") || q.includes("autonomo")) {
    const s = businessStats2025;
    context.push(
      `[Estadísticas empresariales 2025] Empresas activas: ${s.totalActiveCompanies.toLocaleString("es-ES")}. ` +
      `Nuevas creadas: ${s.newCompaniesCreated.toLocaleString("es-ES")}. Disueltas: ${s.companiesDissolved.toLocaleString("es-ES")}. ` +
      `Saldo neto: +${s.netBalance.toLocaleString("es-ES")}. Autónomos activos: ${s.totalAutonomos.toLocaleString("es-ES")} ` +
      `(altas: ${s.newAutonomos.toLocaleString("es-ES")}, bajas: ${s.autonomosBaja.toLocaleString("es-ES")}). ` +
      `Tiempo medio constitución: ${s.averageIncorporationDays} días. ${s.slPercentage}% son SL. ` +
      `Constitución digital: ${s.digitalIncorporation}%. ` +
      `Supervivencia: ${s.survivalRate1Year}% (1 año), ${s.survivalRate3Years}% (3 años), ${s.survivalRate5Years}% (5 años).`
    );
    context.push(
      `[Sectores top creación empresas] ` +
      s.topSectors.map(t => `${t.sector}: ${t.count.toLocaleString("es-ES")} (${t.pct}%)`).join(". ") + "."
    );
    context.push(
      `[CCAA top creación empresas] ` +
      s.topCCAA.map(t => `${t.ccaa}: ${t.count.toLocaleString("es-ES")} (${t.pct}%)`).join(". ") + "."
    );
    sources.push("INE-DIRCE / Estadísticas empresariales 2025");
  }

  // Business incentives
  for (const inc of businessIncentives) {
    const text = `${inc.title} ${inc.benefit} ${inc.targetProfile.join(" ")} ${inc.source}`.toLowerCase();
    if (q.split(/\s+/).some(w => w.length > 3 && text.includes(w))) {
      context.push(
        `[Incentivo] ${inc.title} (${inc.type}): ${inc.benefit}. ` +
        `Importe: ${inc.amount}. Duración: ${inc.duration}. ` +
        `Requisitos: ${inc.requirements}. Estado: ${inc.status}. ` +
        `Dirigido a: ${inc.targetProfile.join(", ")}. Fuente: ${inc.source}.`
      );
      sources.push(`Incentivo: ${inc.title}`);
    }
  }

  return { agentId: "empresarial", agentName: "RAG Empresarial", context, sources };
}

// ═══════════════════════════════════════════════════════════════════════════
// Agent 5: MEDIOS — News & media headlines from RSS archive
// ═══════════════════════════════════════════════════════════════════════════

function searchMedios(question: string): RAGResult {
  const q = question.toLowerCase();
  const context: string[] = [];
  const sources: string[] = [];
  const seenSources = new Set<string>();

  // Read from RSS archive (recent items, last 60 days, more items)
  const since = new Date();
  since.setDate(since.getDate() - 60);
  const items = readArchive({ since, limit: 500 });

  if (items.length === 0) {
    return { agentId: "medios", agentName: "RAG Medios", context, sources };
  }

  // Use words with 3+ chars for matching (not 4+, to catch "hoy", "ley", etc.)
  const words = q.split(/\s+/).filter(w => w.length >= 3);

  // Search headlines for keyword matches
  for (const item of items) {
    if (context.length >= MAX_CHUNKS_PER_AGENT) break;

    const titleLower = item.title.toLowerCase();
    const isMatch = words.some(w => titleLower.includes(w));

    // Also match by entity slugs in the archive matches
    const entityMatch = item.matches.some(m =>
      q.includes(m.name.toLowerCase()) || q.includes(m.slug)
    );

    // Also match source name if user asks about specific media
    const sourceMatch = item.source.toLowerCase().split(/\s+/).some(w =>
      w.length > 2 && q.includes(w)
    );

    if (isMatch || entityMatch || sourceMatch) {
      const date = item.pubDate
        ? new Date(item.pubDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
        : "reciente";
      const entities = item.matches.length > 0
        ? ` Menciona: ${item.matches.map(m => m.name).join(", ")}.`
        : "";
      context.push(
        `[${item.source} — ${date}] ${item.title}.${entities}`
      );
      if (!seenSources.has(item.source)) {
        seenSources.add(item.source);
        sources.push(item.source);
      }
    }
  }

  // If no keyword match but we have archive, provide recent headlines summary
  if (context.length === 0 && items.length > 0) {
    const topItems = items.slice(0, 8);
    for (const item of topItems) {
      const date = item.pubDate
        ? new Date(item.pubDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
        : "reciente";
      context.push(`[${item.source} — ${date}] ${item.title}.`);
      if (!seenSources.has(item.source)) {
        seenSources.add(item.source);
        sources.push(item.source);
      }
    }
  }

  return { agentId: "medios", agentName: "RAG Medios", context, sources };
}

// ═══════════════════════════════════════════════════════════════════════════
// Agent 6: MINISTERIOS — Government structure & ministry data
// ═══════════════════════════════════════════════════════════════════════════

function searchMinisterios(question: string): RAGResult {
  const q = question.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 3);
  const context: string[] = [];
  const sources: string[] = [];

  for (const m of ministries) {
    const searchText = [
      m.name, m.shortName, m.acronym, m.description,
      m.minister.name, m.minister.role, m.minister.party ?? "",
      ...m.keyAreas,
      ...m.tags,
      ...m.keyPersonnel.map(p => `${p.name} ${p.role}`),
      ...m.organismos.map(o => `${o.name} ${o.description}`),
    ].join(" ").toLowerCase();

    if (words.some(w => searchText.includes(w))) {
      // Core ministry info
      context.push(
        `[Ministerio] ${m.name} (${m.acronym}). ` +
        `Ministro/a: ${m.minister.name} (${m.minister.party ?? "ind."}, desde ${m.minister.since}). ` +
        `${m.description} ` +
        `Presupuesto: ${m.budget.totalM.toLocaleString("es-ES")} M€ (${m.budget.changePct > 0 ? "+" : ""}${m.budget.changePct}% vs anterior, ${m.budget.pctOfPGE}% PGE). ` +
        `Empleados: ${m.employeeCount.toLocaleString("es-ES")}. ` +
        `Áreas clave: ${m.keyAreas.join(", ")}.`
      );
      sources.push(`Ministerio: ${m.shortName}`);

      // Key personnel
      if (m.keyPersonnel.length > 0 && words.some(w =>
        ["secretar", "director", "subsecretar", "cargo", "personal", "equipo", "quién", "quien"].some(k => w.includes(k))
      )) {
        const personnel = m.keyPersonnel.slice(0, 5).map(p =>
          `${p.name} — ${p.role} (desde ${p.since}${p.party ? `, ${p.party}` : ""})`
        ).join("; ");
        context.push(`[Altos cargos de ${m.shortName}] ${personnel}.`);
        sources.push(`Personal clave: ${m.shortName}`);
      }

      // Organismos
      if (m.organismos.length > 0 && words.some(w =>
        ["organismo", "agencia", "secretaría", "secretaria", "dirección", "direccion", "estructura", "depende"].some(k => w.includes(k))
      )) {
        const orgs = m.organismos.slice(0, 6).map(o =>
          `${o.name} (${o.type}${o.budgetM ? `, ${o.budgetM} M€` : ""}${o.employeeCount ? `, ${o.employeeCount} emp.` : ""})`
        ).join("; ");
        context.push(`[Organismos de ${m.shortName}] ${orgs}.`);
        sources.push(`Organismos: ${m.shortName}`);
      }

      // Recent activity
      if (m.recentActivity.length > 0 && words.some(w =>
        ["actividad", "reciente", "último", "ultimo", "novedad", "acción", "accion", "boe", "nota", "prensa"].some(k => w.includes(k))
      )) {
        const acts = m.recentActivity.slice(0, 3).map(a =>
          `${a.date} [${a.type}] ${a.title}: ${a.summary} (impacto: ${a.impact})`
        ).join("; ");
        context.push(`[Actividad reciente de ${m.shortName}] ${acts}.`);
        sources.push(`Actividad: ${m.shortName}`);
      }

      // Metrics
      if (m.metrics.length > 0 && words.some(w =>
        ["indicador", "métrica", "metrica", "rendimiento", "resultado", "dato", "cifra", "estadística", "estadistica"].some(k => w.includes(k))
      )) {
        const mets = m.metrics.slice(0, 4).map(mt =>
          `${mt.label}: ${mt.value} ${mt.unit} (${mt.trend}${mt.target ? `, objetivo: ${mt.target}` : ""})`
        ).join("; ");
        context.push(`[Indicadores de ${m.shortName}] ${mets}.`);
        sources.push(`Indicadores: ${m.shortName}`);
      }

      // Budget details
      if (words.some(w =>
        ["presupuest", "gasto", "partida", "capital", "corriente", "personal"].some(k => w.includes(k))
      )) {
        const items = m.budget.keyItems.slice(0, 3).map(i =>
          `${i.label}: ${i.amountM} M€ — ${i.description}`
        ).join("; ");
        context.push(
          `[Presupuesto de ${m.shortName}] Total: ${m.budget.totalM.toLocaleString("es-ES")} M€. ` +
          `Capital: ${m.budget.capitalM} M€, Corriente: ${m.budget.currentM} M€, Personal: ${m.budget.staffM} M€. ` +
          `Partidas clave: ${items}.`
        );
        sources.push(`Presupuesto: ${m.shortName}`);
      }

      // Official data sources
      if (words.some(w =>
        ["fuente", "dato", "portal", "api", "web", "transparencia", "abierto"].some(k => w.includes(k))
      )) {
        const srcs = m.officialSources.slice(0, 4).map(s =>
          `${s.label} (${s.type}, ${s.status}): ${s.description}`
        ).join("; ");
        context.push(`[Fuentes oficiales de ${m.shortName}] ${srcs}.`);
        sources.push(`Fuentes: ${m.shortName}`);
      }

      if (context.length >= MAX_CHUNKS_PER_AGENT) break;
    }
  }

  // Government-wide summary for general questions
  if (context.length === 0 && (q.includes("gobierno") || q.includes("ministerio") || q.includes("ejecutivo") || q.includes("gabinete"))) {
    const totalBudget = ministries.reduce((s, m) => s + m.budget.totalM, 0);
    const totalEmployees = ministries.reduce((s, m) => s + m.employeeCount, 0);
    const byBudget = [...ministries].sort((a, b) => b.budget.totalM - a.budget.totalM).slice(0, 5);
    context.push(
      `[Gobierno de España] ${ministries.length} ministerios. ` +
      `Presupuesto total: ${totalBudget.toLocaleString("es-ES")} M€. ` +
      `Empleados públicos: ${totalEmployees.toLocaleString("es-ES")}. ` +
      `Top 5 por presupuesto: ${byBudget.map(m => `${m.shortName} (${m.budget.totalM.toLocaleString("es-ES")} M€)`).join(", ")}.`
    );
    sources.push("Estructura del Gobierno de España");

    // List all ministers
    const ministerList = ministries.map(m => `${m.shortName}: ${m.minister.name} (${m.minister.party ?? "ind."})`).join("; ");
    context.push(`[Consejo de Ministros] ${ministerList}.`);
    sources.push("Consejo de Ministros");
  }

  return { agentId: "ministerios", agentName: "RAG Ministerios", context, sources };
}

// ═══════════════════════════════════════════════════════════════════════════
// Main: Route question → agents → collect context
// ═══════════════════════════════════════════════════════════════════════════

export const agentMap: Record<AgentId, (q: string) => RAGResult> = {
  normativo: searchNormativo,
  presupuestario: searchPresupuestario,
  "politico-social": searchPoliticoSocial,
  empresarial: searchEmpresarial,
  medios: searchMedios,
  ministerios: searchMinisterios,
};

/** Agent display names for status events */
export const AGENT_LABELS: Record<AgentId, string> = {
  normativo: "RAG Normativo",
  presupuestario: "RAG Presupuestario",
  "politico-social": "RAG Político-Social",
  empresarial: "RAG Empresarial",
  medios: "RAG Medios",
  ministerios: "RAG Ministerios",
};

/** Run a single agent and trim to cap */
export function runAgent(agentId: AgentId, question: string): RAGResult {
  const result = agentMap[agentId](question);
  result.context = result.context.slice(0, MAX_CHUNKS_PER_AGENT);
  result.sources = result.sources.slice(0, MAX_CHUNKS_PER_AGENT);
  return result;
}

/** Combine agent results into final context string */
export function buildContext(agents: RAGResult[]): string {
  return agents
    .flatMap(a => a.context)
    .slice(0, 12)
    .join("\n");
}

export function askAgents(question: string): AskResult {
  const routedTo = classifyIntent(question);
  const agents: RAGResult[] = [];

  for (const agentId of routedTo) {
    const result = runAgent(agentId, question);
    if (result.context.length > 0) {
      agents.push(result);
    }
  }

  const combinedContext = buildContext(agents);
  return { agents, combinedContext, routedTo };
}
