/* ═══════════════════════════════════════════════════════════════════════════
   IAÑ Governance Simulator — aggregates every data layer into a
   coherent diagnosis + action plan for an ideal party that would:
   1. Win the next election with broad consensus
   2. Make all Spaniards happy regardless of origin
   3. Pay off debt & balance the budget in 4 years
   ═══════════════════════════════════════════════════════════════════════════ */

import { nationalIndicators } from "./ine-data";
import { congressGroups, CONGRESS_TOTAL_SEATS } from "./parliamentary-data";
import { plenaryVotes, partyDisciplineStats } from "./voting-data";
import { stateRevenue2026, stateSpending2026, ngeuPlan } from "./finance-data";
import {
  getCoherenceAlerts,
  getTerritoryTrafficLights,
  getEuGaps,
  getPublicMoneyRisk,
} from "./insights-data";
import {
  getElectoralProjection,
  getStabilityIndex,
  getEconomicForecast,
  CENSO_ELECTORAL,
  AVG_PARTICIPATION_PCT,
} from "./predictions-data";
import { readArchive } from "./rss-store";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DiagnosisItem {
  area: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  dataSource: string;
  metric?: string;
}

export interface PolicyProposal {
  area: string;
  title: string;
  description: string;
  impact: string;
  budgetImpact: string; // e.g. "+2.3B" or "-1.1B"
  timeline: "year1" | "year2" | "year3" | "year4";
  requiredLaw: string | null;
  affectedParties: string[];
}

export interface BudgetPlan {
  currentDebt: number;
  currentDeficit: number;
  targetDebt4Y: number;
  yearlyPlan: {
    year: number;
    revenue: number;
    spending: number;
    balance: number;
    debtReduction: number;
    keyMeasures: string[];
  }[];
  totalSaved: number;
  debtReductionPct: number;
}

export interface TerritorialPlan {
  territory: string;
  status: "red" | "yellow" | "green";
  problems: string[];
  proposals: string[];
  expectedImprovement: string;
}

export interface GovernancePlan {
  diagnosis: DiagnosisItem[];
  policies: PolicyProposal[];
  budget: BudgetPlan;
  territorial: TerritorialPlan[];
  electoralStrategy: {
    targetSeats: number;
    targetVotes: number;
    keyMessage: string;
    coalitionStrategy: string;
  };
  legislativeAgenda: {
    slug: string;
    title: string;
    type: "nueva" | "reforma" | "derogación";
    priority: "urgente" | "alta" | "media";
    description: string;
    pros: string[];
    cons: string[];
    citizenBenefit: string;
    spainBenefit: string;
    expectedVotes: {
      favor: { party: string; reason: string }[];
      contra: { party: string; reason: string }[];
    };
    prediction: string;
  }[];
  recentNewsContext: { title: string; source: string; relevance: string }[];
}

// ── Diagnosis ──────────────────────────────────────────────────────────────

function buildDiagnosis(): DiagnosisItem[] {
  const items: DiagnosisItem[] = [];
  const ni = nationalIndicators;

  // Economic diagnosis
  if (ni.unemploymentRate > 10) {
    items.push({
      area: "Empleo",
      severity: ni.unemploymentRate > 15 ? "critical" : "high",
      title: `Tasa de paro del ${ni.unemploymentRate}%`,
      description: `España mantiene una tasa de desempleo que duplica la media europea. ${ni.youthUnemploymentRate}% de paro juvenil agrava la fuga de talento.`,
      dataSource: "INE",
      metric: `${ni.unemploymentRate}% (juvenil: ${ni.youthUnemploymentRate}%)`,
    });
  }

  if (ni.povertyRiskRate > 20) {
    items.push({
      area: "Pobreza",
      severity: "critical",
      title: `${ni.povertyRiskRate}% de población en riesgo de pobreza`,
      description: "Más de una de cada cinco personas está en riesgo de exclusión. Las transferencias sociales son insuficientes.",
      dataSource: "INE/Eurostat",
      metric: `${ni.povertyRiskRate}%`,
    });
  }

  if (ni.cpiAnnual > 3) {
    items.push({
      area: "Precios",
      severity: "high",
      title: `Inflación al ${ni.cpiAnnual}%`,
      description: "La inflación erosiona el poder adquisitivo, especialmente en alimentación y vivienda.",
      dataSource: "INE",
      metric: `IPC: ${ni.cpiAnnual}%`,
    });
  }

  // Territorial diagnosis
  const trafficLights = getTerritoryTrafficLights();
  const redTerritories = trafficLights.filter(t => t.status === "red");
  if (redTerritories.length > 0) {
    items.push({
      area: "Cohesión territorial",
      severity: redTerritories.length > 5 ? "critical" : "high",
      title: `${redTerritories.length} de ${trafficLights.length} CCAA en estado crítico`,
      description: `Comunidades en rojo: ${redTerritories.map(t => t.name).join(", ")}. Alto desempleo, bajo crecimiento y riesgo de pobreza elevado.`,
      dataSource: "INE + Insights",
      metric: `${redTerritories.length}/${trafficLights.length} en rojo`,
    });
  }

  // EU gaps
  const euGaps = getEuGaps();
  for (const gap of euGaps.slice(0, 3)) {
    items.push({
      area: "Convergencia UE",
      severity: "high",
      title: `Brecha UE: ${gap.indicator}`,
      description: `España: ${gap.spainValue}${gap.unit} vs UE-27: ${gap.eu27Value}${gap.unit}. Diferencia de ${Math.abs(gap.gapPct).toFixed(1)}%.`,
      dataSource: "Eurostat",
      metric: `Gap: ${gap.gapPct.toFixed(1)}%`,
    });
  }

  // Political coherence
  const alerts = getCoherenceAlerts();
  if (alerts.length > 3) {
    items.push({
      area: "Gobernanza",
      severity: "high",
      title: `${alerts.length} alertas de coherencia parlamentaria`,
      description: "Partidos que votan en contra de lo que predican. Esto genera desconfianza ciudadana y parálisis legislativa.",
      dataSource: "Votaciones del Congreso",
      metric: `${alerts.length} contradicciones`,
    });
  }

  // NGEU execution
  const ngeuPct = Math.round((ngeuPlan.disbursedTotalB / ngeuPlan.totalB) * 100);
  if (ngeuPct < 70) {
    items.push({
      area: "Fondos europeos",
      severity: ngeuPct < 50 ? "critical" : "medium",
      title: `Solo ${ngeuPct}% de fondos NGEU ejecutados`,
      description: `De los ${ngeuPlan.totalB}B€ asignados, se han desembolsado ${ngeuPlan.disbursedTotalB}B€. Riesgo de devolución si no se acelera.`,
      dataSource: "IGAE/CE",
      metric: `${ngeuPct}% ejecutado`,
    });
  }

  // Government stability
  const stability = getStabilityIndex();
  if (stability.score < 60) {
    items.push({
      area: "Estabilidad",
      severity: stability.score < 40 ? "critical" : "high",
      title: `Gobierno inestable: ${stability.score}/100`,
      description: `Coalición con margen de ${stability.seatMargin} escaños. ${stability.factors.filter(f => f.value < 0).length} factores negativos detectados.`,
      dataSource: "Motor de predicciones",
      metric: `${stability.score}/100`,
    });
  }

  return items.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}

// ── Budget Plan ────────────────────────────────────────────────────────────

function buildBudgetPlan(): BudgetPlan {
  const totalRevenue = stateRevenue2026.reduce((s, r) => s + r.amountB, 0);
  const totalSpending = stateSpending2026.reduce((s, r) => s + r.amountB, 0);
  const currentDeficit = totalSpending - totalRevenue;
  // Spain's public debt ~110% of GDP, GDP ~1.4T → ~1.54T debt
  const estimatedDebt = 1540;
  const gdp = 1400;

  const years = [1, 2, 3, 4].map(y => {
    const revenueGrowth = 1 + (0.02 + y * 0.005); // progressive improvement
    const spendingCut = 1 - (0.01 + y * 0.003); // gradual efficiency
    const rev = Math.round(totalRevenue * revenueGrowth * 10) / 10;
    const spend = Math.round(totalSpending * spendingCut * 10) / 10;
    const balance = Math.round((rev - spend) * 10) / 10;

    const measures: string[] = [];
    if (y === 1) measures.push("Auditoría integral del gasto público", "Digitalización de la administración", "Reforma del fraude fiscal");
    if (y === 2) measures.push("Reestructuración de subvenciones ineficientes", "Aceleración NGEU al 90%", "Nuevo marco de contratación pública");
    if (y === 3) measures.push("Reforma fiscal progresiva", "Reducción de duplicidades administrativas", "Impulso a sectores de alto valor");
    if (y === 4) measures.push("Superávit primario sostenido", "Amortización acelerada de deuda", "Fondo soberano de inversión");

    return {
      year: 2026 + y,
      revenue: rev,
      spending: spend,
      balance,
      debtReduction: Math.round(Math.max(0, balance) * 10) / 10,
      keyMeasures: measures,
    };
  });

  const totalSaved = years.reduce((s, y) => s + y.debtReduction, 0);

  return {
    currentDebt: estimatedDebt,
    currentDeficit: Math.round(currentDeficit * 10) / 10,
    targetDebt4Y: Math.round((estimatedDebt - totalSaved) * 10) / 10,
    yearlyPlan: years,
    totalSaved: Math.round(totalSaved * 10) / 10,
    debtReductionPct: Math.round((totalSaved / estimatedDebt) * 100 * 10) / 10,
  };
}

// ── Territorial Plan ───────────────────────────────────────────────────────

function buildTerritorialPlan(): TerritorialPlan[] {
  const trafficLights = getTerritoryTrafficLights();

  return trafficLights.map(tl => {
    const problems: string[] = [];
    const proposals: string[] = [];

    for (const m of tl.metrics) {
      if (m.status === "bad") {
        problems.push(`${m.label}: ${m.value} (crítico, media nacional: ${m.national})`);
        if (m.label.toLowerCase().includes("paro") || m.label.toLowerCase().includes("desempleo")) {
          proposals.push("Plan de empleo territorial con bonificaciones a PYMES locales");
        }
        if (m.label.toLowerCase().includes("pobreza")) {
          proposals.push("Refuerzo del Ingreso Mínimo Vital con gestión autonómica");
        }
        if (m.label.toLowerCase().includes("pib") || m.label.toLowerCase().includes("crecimiento")) {
          proposals.push("Zona de activación económica con incentivos fiscales");
        }
      } else if (m.status === "warning") {
        problems.push(`${m.label}: ${m.value} (en riesgo, media nacional: ${m.national})`);
      }
    }

    if (proposals.length === 0) {
      proposals.push("Mantener políticas actuales y reforzar convergencia");
    }

    return {
      territory: tl.name,
      status: tl.status,
      problems,
      proposals,
      expectedImprovement: tl.status === "red" ? "Pasar a amarillo en 2 años" : tl.status === "yellow" ? "Pasar a verde en 18 meses" : "Consolidar y servir de modelo",
    };
  });
}

// ── Legislative Agenda ─────────────────────────────────────────────────────

function buildLegislativeAgenda(): GovernancePlan["legislativeAgenda"] {
  const congressParties = congressGroups.filter(g => g.chamber === "congreso");
  const majorParties = congressParties.filter(g => g.seats >= 10).map(g => g.shortName);

  return [
    {
      slug: "empleo-garantizado",
      title: "Ley de Empleo Garantizado",
      type: "nueva" as const,
      priority: "urgente" as const,
      description: "Programa de empleo público transitorio para parados de larga duración. Financiado con reasignación de subsidios pasivos a empleo activo. Objetivo: reducir el paro al 7% en 4 años.",
      pros: [
        "Reduce el paro estructural convirtiendo subsidios pasivos en empleo activo productivo",
        "Genera actividad económica real: infraestructuras, servicios comunitarios, rehabilitación urbana",
        "Reduce la economía sumergida al ofrecer alternativas formales de empleo",
        "Efecto multiplicador fiscal: cada euro invertido en empleo público retorna 1,5€ en actividad económica",
      ],
      cons: [
        "Coste inicial elevado hasta que los retornos fiscales compensen la inversión",
        "Riesgo de ineficiencia si la gestión no es rigurosa — necesita evaluación continua",
        "Puede generar dependencia del empleo público si no se articula transición al sector privado",
        "Tensión con comunidades autónomas por competencias en políticas activas de empleo",
      ],
      citizenBenefit: "Los parados de larga duración (actualmente 1,2M de personas) acceden a empleo digno con formación incluida. Los jóvenes reciben primeras experiencias laborales reales. Menos familias en riesgo de exclusión.",
      spainBenefit: "Reducir el paro del 11,2% al 7% supondría 1,1M de nuevos cotizantes a la Seguridad Social, +8.800M€ en recaudación anual y una caída del gasto en prestaciones de desempleo de 5.200M€.",
      expectedVotes: {
        favor: [
          { party: "IAÑ", reason: "Pilar central del programa: datos demuestran que el empleo activo es más eficiente que los subsidios pasivos" },
          { party: "PSOE", reason: "Alineado con su agenda social y el refuerzo del Estado del bienestar. El empleo público transitorio complementa sus políticas de protección" },
          { party: "Sumar", reason: "Propuesta coherente con su programa de garantía de empleo y derechos laborales. Encaja en su modelo de Estado inversor" },
        ],
        contra: [
          { party: "VOX", reason: "Opuestos a la expansión del empleo público. Consideran que distorsiona el mercado laboral y aumenta el gasto sin generar riqueza real" },
        ],
      },
      prediction: "Aprobación probable con 182 votos a favor (PSOE+Sumar+nacionalistas). PP podría abstenerse para no oponerse a una ley de empleo popular. Confianza: 72%.",
    },
    {
      slug: "estabilidad-presupuestaria",
      title: "Reforma de la Ley de Estabilidad Presupuestaria",
      type: "reforma" as const,
      priority: "urgente" as const,
      description: "Nuevo marco fiscal que permita inversión productiva sin computar como déficit. Alineado con las nuevas reglas fiscales de la UE 2025.",
      pros: [
        "Permite invertir en infraestructura, digitalización y transición verde sin penalización fiscal",
        "Alineado con las nuevas reglas fiscales europeas 2025 que distinguen gasto corriente de inversión",
        "Desbloquea inversiones estratégicas que generan retorno a medio plazo (NGEU, I+D)",
        "Moderniza un marco fiscal de 2012 diseñado para la austeridad, no para el crecimiento",
      ],
      cons: [
        "Riesgo de abuso: gobiernos futuros podrían reclasificar gasto corriente como inversión",
        "Requiere mecanismos de control independientes para evitar contabilidad creativa",
        "Puede generar tensiones con la Comisión Europea si la definición de inversión productiva es demasiado amplia",
        "PP y VOX lo interpretarán como una licencia para gastar más, lo que políticamente es un arma de doble filo",
      ],
      citizenBenefit: "Permite financiar hospitales, escuelas, transporte público y digitalización sin recortes en otros servicios. El ciudadano ve mejoras tangibles en servicios públicos mientras se mantiene la disciplina fiscal.",
      spainBenefit: "España podría ejecutar el 100% de los fondos NGEU (actualmente al 53%) sin presión fiscal adicional. Cada punto porcentual de inversión pública bien ejecutada genera 0,8-1,2 puntos de crecimiento del PIB.",
      expectedVotes: {
        favor: [
          { party: "IAÑ", reason: "El marco fiscal actual impide inversiones con retorno positivo demostrado. Los datos muestran que la austeridad extrema reduce el crecimiento" },
          { party: "PSOE", reason: "Lleva años pidiendo flexibilidad fiscal para inversión. Alineado con la posición española en el Consejo Europeo" },
          { party: "Sumar", reason: "Defiende la inversión pública como motor de crecimiento. Considera la austeridad una política fallida" },
          { party: "PNV", reason: "Interesado en que la inversión pública llegue al País Vasco. Pragmáticos sobre política fiscal" },
        ],
        contra: [
          { party: "PP", reason: "Defensores del marco fiscal actual. Consideran que cualquier flexibilización es una excusa para el despilfarro. Coherente con su posición de 2012" },
          { party: "VOX", reason: "Opuestos a cualquier aumento del gasto público. Abogan por reducción fiscal y menor intervención estatal" },
        ],
      },
      prediction: "Aprobación ajustada con 177 votos. ERC y Bildu podrían sumarse por el impacto en sus territorios. PP se opondrá pero no tiene votos suficientes para bloquear. Confianza: 65%.",
    },
    {
      slug: "transparencia-2",
      title: "Ley de Transparencia y Rendición de Cuentas 2.0",
      type: "reforma" as const,
      priority: "alta" as const,
      description: "Obligación de publicar datos abiertos en tiempo real. Dashboard público de gasto, contratación y cumplimiento de compromisos electorales.",
      pros: [
        "Permite al ciudadano verificar en tiempo real cómo se gasta cada euro público",
        "Reduce la corrupción al hacer transparentes los procesos de contratación",
        "Crea un sistema de rendición de cuentas automático: los políticos son evaluados por sus datos, no sus discursos",
        "España pasaría de puesto 35 a top 10 en índices internacionales de transparencia",
      ],
      cons: [
        "Coste de implementación tecnológica para administraciones pequeñas (municipios rurales)",
        "Resistencia interna de los partidos a que se publique su cumplimiento de compromisos",
        "Riesgo de sobrecarga informativa: demasiados datos sin contexto pueden generar desinformación",
        "Tiempo de adaptación de las administraciones al nuevo sistema (estimado: 12-18 meses)",
      ],
      citizenBenefit: "Cualquier ciudadano podrá consultar online cuánto se gasta en su municipio, qué contratos se adjudican y si los políticos cumplen sus promesas. Herramienta directa contra la corrupción.",
      spainBenefit: "La transparencia reduce la prima de riesgo y mejora la imagen de España ante inversores y organismos internacionales. Cada punto de mejora en transparencia se correlaciona con +0,3% de inversión extranjera.",
      expectedVotes: {
        favor: [
          { party: "IAÑ", reason: "Es la esencia del partido: gobernar con datos abiertos. Sin transparencia no hay democracia informada" },
          { party: "Sumar", reason: "Fuerte defensor de la rendición de cuentas. Ha propuesto medidas similares en su programa" },
          { party: "ERC", reason: "Apoya la transparencia como herramienta de control al gobierno central. Quiere que se aplique también a la distribución territorial de fondos" },
          { party: "BNG", reason: "Interesado en visibilizar las asimetrías de inversión entre territorios" },
        ],
        contra: [],
      },
      prediction: "Aprobación amplia con más de 200 votos. Ningún partido se atreve a votar en contra de la transparencia públicamente. PP y PSOE se sumarán por presión mediática. Confianza: 88%.",
    },
    {
      slug: "cohesion-territorial",
      title: "Ley de Cohesión Territorial",
      type: "nueva" as const,
      priority: "alta" as const,
      description: "Fondo de convergencia para CCAA en estado rojo. Inversión focalizada en empleo, infraestructura digital y servicios públicos. Evaluación anual con indicadores INE.",
      pros: [
        "Ataca directamente las desigualdades territoriales: 8 de 19 CCAA están en estado crítico",
        "Inversiones focalizadas generan más impacto que transferencias genéricas",
        "Evaluación anual con datos INE impide el clientelismo y asegura eficiencia",
        "Reduce la tensión territorial al demostrar compromiso real con la convergencia",
      ],
      cons: [
        "CCAA ricas pueden percibirlo como un agravio si se desvían recursos hacia territorios menos productivos",
        "Riesgo de generar dependencia en lugar de autonomía económica en las CCAA receptoras",
        "Complejidad administrativa para coordinar inversiones entre gobierno central y autonómicos",
        "El fondo necesita financiación estable — si se financia con deuda, contradice el plan de reducción",
      ],
      citizenBenefit: "Un extremeño o canario tendrá acceso a servicios públicos comparables a los de Madrid o País Vasco. Fibra óptica, sanidad, educación y empleo llegarán a las zonas más desfavorecidas.",
      spainBenefit: "Reducir las brechas territoriales aumenta el PIB nacional un 0,5-1% anual (cada CCAA que pasa de rojo a amarillo aporta productividad). España necesita todos sus territorios funcionando para competir en la UE.",
      expectedVotes: {
        favor: [
          { party: "IAÑ", reason: "Los datos muestran que la brecha territorial es insostenible. 8 CCAA en rojo significan millones de ciudadanos sin igualdad de oportunidades" },
          { party: "PSOE", reason: "La cohesión territorial es uno de sus ejes históricos. Gobiernan en varias CCAA receptoras" },
          { party: "Sumar", reason: "Defiende la igualdad de servicios públicos independientemente del territorio" },
          { party: "BNG", reason: "Galicia es territorio en amarillo — se beneficiaría directamente del fondo" },
          { party: "CC", reason: "Canarias es uno de los territorios en peor estado (paro 16,2%, pobreza 28,6%). Es una prioridad existencial" },
        ],
        contra: [],
      },
      prediction: "Aprobación con 190+ votos. Difícil oponerse a la igualdad territorial. PP podría abstenerse alegando que prefiere su propio modelo de financiación. Confianza: 82%.",
    },
    {
      slug: "vivienda",
      title: "Reforma del Mercado de Vivienda",
      type: "reforma" as const,
      priority: "alta" as const,
      description: "Tope de alquiler vinculado al IPC, incentivos fiscales a propietarios que alquilen a precio asequible, plan de 100.000 viviendas públicas/año.",
      pros: [
        "Frena la especulación que ha disparado los alquileres un 40% en 5 años en grandes ciudades",
        "Los incentivos fiscales motivan a los propietarios a alquilar viviendas vacías (3,4M en España)",
        "100.000 viviendas públicas/año crearían 200.000 empleos directos en construcción",
        "Reduce la emancipación tardía: la edad media de independencia en España es 30,3 años (UE: 26,4)",
      ],
      cons: [
        "Los topes de alquiler pueden reducir la oferta si no se acompañan de incentivos suficientes",
        "El plan de 100.000 viviendas necesita suelo público disponible, que es escaso en grandes ciudades",
        "Intervención en el mercado libre genera rechazo de inversores inmobiliarios",
        "Experiencias internacionales de control de alquileres muestran resultados mixtos (Berlín, París)",
      ],
      citizenBenefit: "Una familia media en Madrid o Barcelona pasaría de destinar el 45% de su renta al alquiler al 30% recomendado por la UE. Los jóvenes podrán independizarse 3-4 años antes.",
      spainBenefit: "España tiene 3,4M de viviendas vacías y una crisis de acceso brutal. Resolver la vivienda libera renta disponible que se reinvierte en consumo, estimulando la economía. Impacto estimado: +0,8% PIB.",
      expectedVotes: {
        favor: [
          { party: "IAÑ", reason: "Los datos son claros: 45% de renta destinada a vivienda es insostenible. La intervención regulada con incentivos es la vía equilibrada" },
          { party: "PSOE", reason: "Ya aprobó la Ley de Vivienda 2023. Esta reforma profundiza en la misma línea" },
          { party: "Sumar", reason: "La vivienda es su prioridad número uno. Defiende topes más estrictos incluso" },
          { party: "ERC", reason: "Cataluña sufre especialmente la crisis de vivienda. Apoyará cualquier medida que frene los alquileres" },
        ],
        contra: [
          { party: "PP", reason: "Opuesto a la regulación de precios. Defiende un modelo de aumento de oferta sin intervención. Representa a propietarios e inversores inmobiliarios" },
          { party: "VOX", reason: "Rechaza cualquier intervención en el mercado libre. Propone liberalizar el suelo como alternativa" },
        ],
      },
      prediction: "Aprobación con 178 votos. Mayoría ajustada pero suficiente. PP intentará enmendar para eliminar los topes. Confianza: 70%.",
    },
    {
      slug: "aceleracion-ngeu",
      title: "Ley de Aceleración NGEU",
      type: "nueva" as const,
      priority: "urgente" as const,
      description: "Ventanilla única para fondos europeos. Simplificación administrativa, plazos máximos de 60 días para adjudicación. Penalización a ministerios que no ejecuten.",
      pros: [
        "España tiene 76.600M€ pendientes de ejecutar — es dinero que puede perderse si no se acelera",
        "La ventanilla única elimina la burocracia que retrasa proyectos 6-12 meses",
        "Penalizar a ministerios lentos crea incentivos reales para la eficiencia",
        "Los fondos NGEU financian transición verde, digitalización e infraestructuras — beneficio directo para ciudadanos",
      ],
      cons: [
        "La simplificación puede reducir controles de calidad si no se implementa bien",
        "Los plazos de 60 días pueden ser insuficientes para proyectos complejos — riesgo de adjudicaciones precipitadas",
        "Las penalizaciones a ministerios pueden crear tensiones internas en el gobierno",
        "La velocidad de ejecución no debe comprometer la calidad de los proyectos financiados",
      ],
      citizenBenefit: "Los fondos europeos financian puntos de recarga eléctrica, renovación de edificios, formación digital y banda ancha rural. Cada retraso es un servicio que no llega al ciudadano.",
      spainBenefit: "Ejecutar el 100% de los fondos NGEU supondría inyectar 76.600M€ adicionales en la economía española. Impacto estimado: +2,5% PIB acumulado y 400.000 empleos directos e indirectos.",
      expectedVotes: {
        favor: [
          { party: "IAÑ", reason: "Solo el 53% ejecutado es un dato alarmante. Cada euro no gastado es una oportunidad perdida medible" },
          { party: "PP", reason: "Ha criticado constantemente la lentitud de ejecución del gobierno. No puede oponerse a acelerar lo que denuncia" },
          { party: "PSOE", reason: "Necesita demostrar que los fondos se ejecutan. Esta ley le da herramientas para presionar a sus propios ministerios" },
          { party: "Sumar", reason: "Los fondos financian transición ecológica y digital, dos de sus prioridades programáticas" },
          { party: "PNV", reason: "País Vasco es un ejecutor eficiente de fondos europeos. Apoya la ventanilla única que beneficia a los más ágiles" },
        ],
        contra: [],
      },
      prediction: "Aprobación casi unánime con 300+ votos. Es el consenso más amplio posible: nadie quiere ser visto como el partido que frena los fondos europeos. Confianza: 95%.",
    },
    {
      slug: "fraude-fiscal",
      title: "Ley de Lucha contra el Fraude Fiscal",
      type: "reforma" as const,
      priority: "urgente" as const,
      description: "Refuerzo de la Agencia Tributaria con 5.000 inspectores. Persecución de grandes defraudadores. Objetivo: recaudar 15B€ adicionales/año.",
      pros: [
        "España pierde 70.000M€/año en fraude fiscal — recuperar el 20% cambia las cuentas públicas",
        "5.000 inspectores más es una inversión que se autofinancia: cada inspector recauda 10x su coste",
        "Justicia fiscal: que paguen más quienes más defraudan, no quienes ya cumplen",
        "Permite bajar impuestos a rentas medias y bajas si se recauda de los grandes defraudadores",
      ],
      cons: [
        "Contratar 5.000 inspectores requiere 2-3 años de formación y oposiciones",
        "Riesgo de exceso de presión fiscal sobre PYMES y autónomos si la ley no se focaliza bien",
        "Los grandes defraudadores tienen recursos legales para dilatar procesos durante años",
        "Puede generar fuga de capitales a corto plazo si no se coordina con la UE",
      ],
      citizenBenefit: "15.000M€ recaudados del fraude equivalen a 340€/ciudadano que hoy pagan los que sí cumplen. Permite financiar sanidad, educación y pensiones sin subir impuestos a las familias.",
      spainBenefit: "Reducir el fraude fiscal al nivel medio europeo supondría 15-20.000M€ adicionales anuales. España pasaría de un déficit del 3,2% a un déficit inferior al 1% del PIB sin tocar ningún servicio público.",
      expectedVotes: {
        favor: [
          { party: "IAÑ", reason: "Los datos son irrefutables: 70.000M€ de fraude es el mayor problema fiscal de España. No se puede pedir austeridad sin perseguir el fraude" },
          { party: "PSOE", reason: "Ha legislado contra el fraude fiscal en las últimas legislaturas. Coherente con su discurso de justicia fiscal" },
          { party: "Sumar", reason: "Prioridad absoluta en su programa. Defiende que los ricos paguen lo que les corresponde" },
          { party: "ERC", reason: "Apoya la recaudación eficiente como vía para mejorar la financiación autonómica" },
        ],
        contra: [
          { party: "VOX", reason: "Se opone al aumento de la presión fiscal en cualquier forma. Prefiere reducir impuestos y gasto público simultáneamente" },
        ],
      },
      prediction: "Aprobación con 185 votos. PP probablemente se abstendrá: no puede oponerse a perseguir el fraude pero no quiere votar con la izquierda en política fiscal. Confianza: 78%.",
    },
    {
      slug: "reindustrializacion",
      title: "Ley de Reindustrialización Estratégica",
      type: "nueva" as const,
      priority: "media" as const,
      description: "Plan nacional de semiconductores, energías renovables y biotecnología. Incentivos a la I+D+i hasta alcanzar el 3% del PIB.",
      pros: [
        "España invierte solo 1,48% del PIB en I+D — la mitad que la media UE (2,28%). Cerrar la brecha es estratégico",
        "Semiconductores y renovables son los sectores de mayor crecimiento global — España tiene ventaja en renovables",
        "Reduce la dependencia tecnológica exterior y crea empleo de alto valor añadido",
        "Alineado con la European Chips Act y los objetivos industriales de la UE",
      ],
      cons: [
        "El retorno de la I+D es a largo plazo (5-10 años) — difícil de rentabilizar políticamente en una legislatura",
        "Competencia feroz con Alemania, Francia y Países Bajos por las inversiones en semiconductores",
        "Riesgo de subvencionar sectores que no sean viables sin ayudas permanentes",
        "Requiere reforma del sistema universitario y formación profesional para generar talento suficiente",
      ],
      citizenBenefit: "Empleos de calidad en tecnología, energía y biotecnología. Salarios medios en estos sectores son un 40% superiores a la media nacional. Menos fuga de cerebros: los jóvenes investigadores podrán quedarse en España.",
      spainBenefit: "Alcanzar el 3% del PIB en I+D posicionaría a España como hub tecnológico europeo. Cada punto de inversión en I+D genera 2,5 puntos de crecimiento del PIB a medio plazo. Impacto estimado: +45.000M€ en PIB en 10 años.",
      expectedVotes: {
        favor: [
          { party: "IAÑ", reason: "La brecha de I+D es uno de los mayores lastres competitivos de España según los datos Eurostat" },
          { party: "PP", reason: "Defiende la reindustrialización y la competitividad. Apoyo natural a incentivos empresariales y tecnológicos" },
          { party: "PSOE", reason: "La España del conocimiento es un eje de su discurso. Compatible con su estrategia de transformación productiva" },
          { party: "Sumar", reason: "Apoya la inversión pública en I+D como creación de empleo de calidad y soberanía tecnológica" },
          { party: "PNV", reason: "País Vasco ya lidera en I+D (2,2% del PIB). Apoya medidas que refuercen su ecosistema industrial" },
        ],
        contra: [],
      },
      prediction: "Aprobación con amplio consenso: 280+ votos. La reindustrialización es uno de los pocos temas donde izquierda y derecha coinciden. Confianza: 92%.",
    },
  ];
}

// ── News context ───────────────────────────────────────────────────────────

function getNewsContext(): GovernancePlan["recentNewsContext"] {
  try {
    const archive = readArchive({ limit: 20 });
    return archive
      .filter(item => item.matches && item.matches.length > 0)
      .slice(0, 8)
      .map(item => ({
        title: item.title,
        source: item.source,
        relevance: item.matches.map((m: { type: string; name: string }) => `${m.type}: ${m.name}`).join(", "),
      }));
  } catch {
    return [];
  }
}

// ── Main export ────────────────────────────────────────────────────────────

export function getGovernancePlan(): GovernancePlan {
  const electoral = getElectoralProjection();

  return {
    diagnosis: buildDiagnosis(),
    policies: [], // filled by MiroFish LLM when available
    budget: buildBudgetPlan(),
    territorial: buildTerritorialPlan(),
    electoralStrategy: {
      targetSeats: 176, // absolute majority
      targetVotes: Math.round(CENSO_ELECTORAL * (AVG_PARTICIPATION_PCT / 100) * 0.38),
      keyMessage: "Datos, no ideología. Soluciones, no promesas.",
      coalitionStrategy: "Mayoría absoluta o coalición técnica transversal con partidos que prioricen datos sobre ideología.",
    },
    legislativeAgenda: buildLegislativeAgenda(),
    recentNewsContext: getNewsContext(),
  };
}
