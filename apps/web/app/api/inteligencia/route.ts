/* ═══════════════════════════════════════════════════════════════════════════
   /api/inteligencia — Political-Territorial Intelligence data feed.
   Aggregates CCAA parliaments, fiscal profiles, socioeconomic indicators,
   agenda events, contracts, official sources, and power concentration
   into a single territory-centric payload.
   ═══════════════════════════════════════════════════════════════════════════ */

import { territories, politicians, parties, territorialOfficialSources } from "@espanaia/seed-data";
import { ccaaParliaments, congressGroups, senateGroups, CONGRESS_TOTAL_SEATS } from "../../../lib/parliamentary-data";
import { ccaaIndicators, nationalIndicators } from "../../../lib/ine-data";
import { territoryFiscalProfiles } from "../../../lib/finance-data";
import { getFilteredEvents, getUpcomingEvents } from "../../../lib/agenda-data";
import { publicContracts, publicSubsidies } from "../../../lib/contracts-data";
import { getTerritoryTrafficLights, getPowerConcentration, getCoherenceAlerts, getTransparencyTracker } from "../../../lib/insights-data";
import { getTrending } from "../../../lib/rss-trending";

// ── 10 competitive improvements ──
import { plenaryVotes, partyDisciplineStats } from "../../../lib/voting-data";
import { parliamentarySessions } from "../../../lib/sessions-data";
import { euLegislation, infringementProcedures, transpositionSummary } from "../../../lib/eurlex-data";
import { businessRegulations, businessIncentives } from "../../../lib/business-data";
import { assetDeclarations } from "../../../lib/declarations-data";
import { getStabilityIndex, getVotePredictions } from "../../../lib/predictions-data";
import { getEntityCoverage } from "../../../lib/rss-store";
import { sessionTranscripts, getSentimentSummary, getTopicHeatmap, getTranscriptStats, getVerifiableClaims } from "../../../lib/transcripts-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filterTerritory = url.searchParams.get("territory") ?? null;

    // ── Territories ──
    const ccaaTerritories = territories.filter(
      (t) => t.kind === "autonomous-community" || t.kind === "autonomous-city"
    );

    // ── Parliaments ──
    const parliaments = ccaaParliaments.map((p: any) => ({
      slug: p.territorySlug,
      name: p.name,
      totalSeats: p.totalSeats,
      president: p.presidentName,
      presidentParty: p.presidentParty,
      governingCoalition: p.governingCoalition,
      groups: p.groups.map((g: any) => ({
        party: g.partyName,
        acronym: g.acronym,
        partySlug: g.partySlug,
        seats: g.seats,
        pct: g.representationPct,
        isGoverning: g.isGoverning,
      })),
    }));

    // ── Congress composition (national) ──
    const congress = congressGroups.map((g: any) => ({
      party: g.name,
      partySlug: g.partySlug,
      seats: g.seats,
      pct: g.representationPct,
    }));

    // ── Socioeconomic indicators per CCAA ──
    const indicators = ccaaIndicators.map((ind) => ({
      slug: ind.territorySlug,
      population: ind.population,
      gdpM: ind.gdpM,
      gdpPerCapita: ind.gdpPerCapita,
      gdpGrowthPct: ind.gdpGrowthPct,
      unemploymentRate: ind.unemploymentRate,
      youthUnemploymentRate: ind.youthUnemploymentRate,
      averageSalary: ind.averageSalary,
      povertyRiskRate: ind.povertyRiskRate,
      giniIndex: ind.giniIndex,
      medianAge: ind.medianAge,
      housingPriceIndex: ind.housingPriceIndex,
      rentAvgMonthly: ind.rentAvgMonthly,
    }));

    // ── Fiscal profiles ──
    const fiscalProfiles = territoryFiscalProfiles.map((fp: any) => ({
      slug: fp.territorySlug,
      totalBudgetM: fp.totalBudgetM,
      debtPctGdp: fp.debtPctGdp,
      spendPerCapita: fp.spendPerCapita,
      stateTransfersM: fp.stateTransfersM,
      euFundsReceivedM: fp.euFundsReceivedM,
      mainSpending: (fp.mainSpending ?? []).slice(0, 4),
    }));

    // ── Territory health (traffic lights) ──
    const trafficLights = getTerritoryTrafficLights().map((t) => ({
      slug: t.territorySlug,
      name: t.name,
      score: t.score,
      status: t.status,
      metrics: t.metrics,
    }));

    // ── Agenda events ──
    const allUpcoming = getUpcomingEvents(30);
    const agenda = allUpcoming.map((ev) => ({
      date: new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
        new Date(ev.date + "T00:00:00")
      ),
      rawDate: ev.date,
      title: ev.title.substring(0, 100),
      type: ev.eventType,
      status: ev.status,
      institution: ev.institution,
      territories: ev.territorySlugs,
    }));

    // ── Territory-specific events ──
    const territoryAgenda: Record<string, any[]> = {};
    for (const t of ccaaTerritories) {
      const events = getFilteredEvents({ territorySlug: t.slug }).slice(0, 5);
      if (events.length > 0) {
        territoryAgenda[t.slug] = events.map((ev) => ({
          date: new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
            new Date(ev.date + "T00:00:00")
          ),
          title: ev.title.substring(0, 80),
          type: ev.eventType,
          status: ev.status,
          institution: ev.institution,
        }));
      }
    }

    // ── Contracts by territory ──
    const contractsByTerritory: Record<string, number> = {};
    let totalContractsM = 0;
    for (const c of publicContracts) {
      totalContractsM += c.amountM;
      for (const ts of c.territorySlugs) {
        contractsByTerritory[ts] = (contractsByTerritory[ts] || 0) + 1;
      }
    }

    // ── Politicians per territory ──
    const politiciansByTerritory: Record<string, { name: string; party: string; role: string }[]> = {};
    for (const pol of politicians) {
      const slug = pol.territorySlug;
      if (!slug || slug === "espana") continue;
      if (!politiciansByTerritory[slug]) politiciansByTerritory[slug] = [];
      politiciansByTerritory[slug].push({
        name: pol.shortName,
        party: pol.currentPartySlug,
        role: pol.currentRoleSummary?.substring(0, 60) ?? "",
      });
    }

    // ── Official sources per territory ──
    const officialSources: Record<string, any[]> = {};
    for (const src of territorialOfficialSources) {
      if (!officialSources[src.territorySlug]) officialSources[src.territorySlug] = [];
      officialSources[src.territorySlug].push({
        type: src.type,
        title: src.title,
        url: src.url,
      });
    }

    // ── Power concentration ──
    const powerMap = getPowerConcentration();

    // ── Governing map (which party governs each CCAA) ──
    const governingMap = parliaments.map((p: any) => ({
      slug: p.slug,
      name: p.name,
      president: p.president,
      presidentParty: p.presidentParty,
      coalitionParties: p.governingCoalition,
      totalSeats: p.totalSeats,
      govSeats: p.groups.filter((g: any) => g.isGoverning).reduce((s: number, g: any) => s + g.seats, 0),
    }));

    // ── RSS recent for territory mentions ──
    let trending: any[] = [];
    try {
      trending = await getTrending(20);
    } catch {}

    // ── Build territory cards ──
    const territoryCards = ccaaTerritories.map((t) => {
      const parl = parliaments.find((p: any) => p.slug === t.slug);
      const ind = indicators.find((i) => i.slug === t.slug);
      const fiscal = fiscalProfiles.find((f: any) => f.slug === t.slug);
      const health = trafficLights.find((h) => h.slug === t.slug);
      const sources = officialSources[t.slug] ?? [];
      const pols = politiciansByTerritory[t.slug] ?? [];
      const numContracts = contractsByTerritory[t.slug] ?? 0;
      const events = territoryAgenda[t.slug] ?? [];

      return {
        slug: t.slug,
        name: t.name,
        shortCode: t.shortCode,
        kind: t.kind,
        seat: t.seat,
        pulseScore: t.pulseScore,
        strategicFocus: t.strategicFocus,
        // Parliament
        parliament: parl ? {
          totalSeats: parl.totalSeats,
          president: parl.president,
          presidentParty: parl.presidentParty,
          coalition: parl.governingCoalition,
          groups: parl.groups.slice(0, 6),
        } : null,
        // Socio-economic
        indicators: ind ? {
          population: ind.population,
          gdpPerCapita: ind.gdpPerCapita,
          gdpGrowthPct: ind.gdpGrowthPct,
          unemploymentRate: ind.unemploymentRate,
          youthUnemploymentRate: ind.youthUnemploymentRate,
          povertyRiskRate: ind.povertyRiskRate,
          averageSalary: ind.averageSalary,
          rentAvgMonthly: ind.rentAvgMonthly,
        } : null,
        // Fiscal
        fiscal: fiscal ? {
          budgetM: fiscal.totalBudgetM,
          debtGdp: fiscal.debtPctGdp,
          spendPerCapita: fiscal.spendPerCapita,
          transfers: fiscal.stateTransfersM,
          euFunds: fiscal.euFundsReceivedM,
          spending: fiscal.mainSpending,
        } : null,
        // Health
        health: health ? {
          score: health.score,
          status: health.status,
          metrics: health.metrics,
        } : null,
        // Actors & events
        politicians: pols.slice(0, 5),
        contracts: numContracts,
        events,
        sources,
      };
    });

    // Sort by pulse score descending
    territoryCards.sort((a, b) => b.pulseScore - a.pulseScore);

    // ═══════════════════════════════════════════════════════════════════
    // 10 COMPETITIVE IMPROVEMENTS vs Political Intelligence
    // ═══════════════════════════════════════════════════════════════════

    // 1. LEGISLATIVE TRACKER — Bill progress from debate to vote
    const legislativeTracker = plenaryVotes.map((v: any) => ({
      id: v.id,
      title: v.title.substring(0, 80),
      category: v.category,
      date: v.sessionDate,
      result: v.result,
      si: v.si,
      no: v.no,
      abstencion: v.abstencion,
      parties: v.partyBreakdown.map((pb: any) => ({
        party: pb.partySlug,
        position: pb.position,
        votes: pb.total,
      })),
      tags: v.tags?.slice(0, 4) ?? [],
    }));

    // 2. REGULATORY RISK RADAR — Sector-specific alerts
    const regulatoryRisk = businessRegulations
      .filter((r: any) => r.status === "en-tramite" || r.status === "propuesta" || r.status === "anteproyecto" || r.status === "aprobada-pendiente-transposicion")
      .map((r: any) => ({
        title: r.title.substring(0, 80),
        type: r.type,
        status: r.status,
        date: r.date,
        sectors: r.affectedSectors?.slice(0, 3) ?? [],
        companyTypes: r.affectedCompanyTypes?.slice(0, 3) ?? [],
        impact: r.impactOnBusiness?.substring(0, 120) ?? "",
        fiscalImpact: r.fiscalImpact?.substring(0, 80) ?? "",
      }));
    // Add EU directives pending transposition
    const euRegulatoryRisk = euLegislation
      .filter((l: any) => l.transpositionStatus === "retrasada" || l.transpositionStatus === "incumplimiento" || l.transpositionStatus === "en-plazo")
      .map((l: any) => ({
        title: l.title.substring(0, 80),
        type: "directiva-ue",
        status: l.transpositionStatus,
        deadline: l.transpositionDeadline ?? null,
        sector: l.sector,
        impact: l.description?.substring(0, 120) ?? "",
      }));

    // 3. STAKEHOLDER MAP — Contracts + subsidies cross-referenced
    const stakeholderMap = publicContracts.map((c: any) => ({
      type: "contrato",
      title: c.title.substring(0, 60),
      entity: c.entity,
      contractor: c.contractor,
      amountM: c.amountM,
      territories: c.territorySlugs,
      ministry: c.ministry ?? null,
      date: c.awardDate,
    }));
    const subsidyMap = publicSubsidies.map((s: any) => ({
      type: "subvencion",
      title: s.title.substring(0, 60),
      grantor: s.grantingBody,
      beneficiary: s.beneficiaryType,
      amountM: s.amountM,
      territories: s.territorySlugs ?? [],
      date: s.publicationDate,
    }));

    // 4. PARTY DISCIPLINE DASHBOARD
    const disciplineData = partyDisciplineStats
      .filter((d: any) => d.chamber === "congreso")
      .map((d: any) => {
        const party = parties.find((p) => p.slug === d.partySlug);
        return {
          party: party?.shortName ?? d.partySlug,
          slug: d.partySlug,
          disciplineRate: d.disciplineRate,
          rebellions: d.rebellions,
          absenceRate: d.absenceRate,
          totalVotes: d.totalVotes,
        };
      })
      .sort((a: any, b: any) => b.disciplineRate - a.disciplineRate);

    // 5. MINISTER/ACTOR PROFILES with declarations
    const actorProfiles = assetDeclarations.slice(0, 10).map((d: any) => {
      const pol = politicians.find((p) => p.slug === d.politicianSlug);
      const totalIncome = d.income.reduce((s: number, inc: any) => s + (inc.annualAmount ?? 0), 0);
      return {
        slug: d.politicianSlug,
        name: pol?.shortName ?? d.politicianSlug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        party: pol?.currentPartySlug ?? "",
        role: pol?.currentRoleSummary?.substring(0, 60) ?? "",
        chamber: d.chamber,
        realEstate: d.realEstate?.length ?? 0,
        deposits: d.bankDeposits?.range ?? "",
        income: totalIncome,
        activities: (d.activities ?? []).map((a: any) => a.description?.substring(0, 50)).slice(0, 3),
        liabilities: d.liabilities?.length ?? 0,
      };
    });

    // 6. EU-SPAIN REGULATORY PIPELINE
    const euPipeline = {
      totalDirectives: euLegislation.length,
      transpositionSummary,
      infringements: infringementProcedures.map((p: any) => ({
        subject: p.subject.substring(0, 80),
        stage: p.stage,
        date: p.date,
        description: p.description?.substring(0, 120) ?? "",
        potentialFine: p.potentialFineM ?? null,
      })),
    };

    // 7. CCAA LEGISLATIVE CALENDAR
    const ccaaCalendar = parliamentarySessions
      .filter((s: any) => s.chamber === "parlamento-ccaa" || s.chamber === "comision")
      .map((s: any) => ({
        title: s.title.substring(0, 80),
        date: s.date,
        chamber: s.chamber,
        sessionType: s.sessionType,
        status: s.status,
        institution: s.institution,
        territories: s.territorySlugs ?? [],
        speakers: (s.speakers ?? []).slice(0, 3).map((sp: any) => ({ name: sp.name, party: sp.partySlug, minutes: sp.interventionMinutes })),
        topics: s.keyTopics?.slice(0, 3) ?? [],
      }));
    // Add national sessions too
    const nationalSessions = parliamentarySessions
      .filter((s: any) => s.chamber === "congreso" || s.chamber === "senado")
      .map((s: any) => ({
        title: s.title.substring(0, 80),
        date: s.date,
        chamber: s.chamber,
        sessionType: s.sessionType,
        status: s.status,
        institution: s.institution,
        durationMinutes: s.durationMinutes,
        agendaItems: (s.agendaItems ?? []).slice(0, 5).map((a: any) => ({
          title: a.title?.substring(0, 60),
          type: a.type,
          result: a.result ?? null,
        })),
        speakers: (s.speakers ?? []).slice(0, 5).map((sp: any) => ({ name: sp.name, party: sp.partySlug, minutes: sp.interventionMinutes })),
        topics: s.keyTopics?.slice(0, 4) ?? [],
      }));

    // 8. GOVERNMENT FRAGILITY MONITOR
    const stability = getStabilityIndex();
    const fragility = {
      score: stability.score,
      label: stability.label,
      factors: stability.factors?.slice(0, 6) ?? [],
      coalitionSeats: stability.coalitionSeats,
      majority: stability.majorityThreshold,
      margin: stability.seatMargin,
    };

    // 9. MEDIA COVERAGE per top politicians
    const topPoliticianSlugs = politicians.slice(0, 8).map((p) => p.slug);
    const mediaCoverage: any[] = [];
    for (const slug of topPoliticianSlugs) {
      try {
        const coverage = getEntityCoverage(slug);
        if (coverage.totalMentions > 0) {
          const pol = politicians.find((p) => p.slug === slug);
          mediaCoverage.push({
            slug,
            name: pol?.shortName ?? slug,
            party: pol?.currentPartySlug ?? "",
            mentions: coverage.totalMentions,
            sources: Object.entries(coverage.sources).sort((a, b) => b[1] - a[1]).slice(0, 5),
            headlines: coverage.recentHeadlines.slice(0, 3),
          });
        }
      } catch {}
    }
    // Also get party coverage
    const topPartySlugs = ["psoe", "pp", "vox", "sumar", "erc", "junts"];
    const partyCoverage: any[] = [];
    for (const slug of topPartySlugs) {
      try {
        const coverage = getEntityCoverage(slug);
        if (coverage.totalMentions > 0) {
          const party = parties.find((p) => p.slug === slug);
          partyCoverage.push({
            slug,
            name: party?.shortName ?? slug,
            mentions: coverage.totalMentions,
            sources: Object.entries(coverage.sources).sort((a, b) => b[1] - a[1]).slice(0, 5),
          });
        }
      } catch {}
    }

    // 10. CONFLICT OF INTEREST DETECTOR
    const coherenceAlerts = getCoherenceAlerts();
    const votePredictions = getVotePredictions();
    const conflictAlerts: any[] = [];
    // Cross-reference declarations with contract sectors
    for (const decl of assetDeclarations.slice(0, 8)) {
      const pol = politicians.find((p) => p.slug === decl.politicianSlug);
      if (!pol) continue;
      const compatibleActivities = (decl.activities ?? []).filter((a: any) => a.type === "compatible" || a.type === "familiar");
      if (compatibleActivities.length > 0) {
        conflictAlerts.push({
          politician: pol.shortName,
          slug: decl.politicianSlug,
          party: pol.currentPartySlug,
          activities: compatibleActivities.map((a: any) => a.description?.substring(0, 50)),
          income: decl.income.reduce((s: number, inc: any) => s + (inc.annualAmount ?? 0), 0),
          deposits: decl.bankDeposits?.range ?? "",
          securities: (decl.securities ?? []).map((s: any) => s.description?.substring(0, 40)),
        });
      }
    }

    return Response.json({
      territories: territoryCards,
      governingMap,
      congress,
      powerMap: powerMap.map((p) => ({
        party: p.partyName,
        slug: p.partySlug,
        congress: p.congressSeats,
        ccaaGoverning: p.ccaaGoverning,
        ccaaSeats: p.totalCcaaSeats,
        powerIndex: p.powerIndex,
      })),
      national: {
        population: nationalIndicators.population,
        gdpGrowthPct: nationalIndicators.gdpGrowthPct,
        unemploymentRate: nationalIndicators.unemploymentRate,
        povertyRiskRate: nationalIndicators.povertyRiskRate,
      },
      agenda: agenda.slice(0, 15),
      totalContracts: publicContracts.length,
      totalContractsM: Math.round(totalContractsM),
      totalSubsidies: publicSubsidies.length,
      totalPoliticians: politicians.length,
      totalParties: parties.length,
      recentNews: trending.slice(0, 10).map((t: any) => ({
        title: t.title?.substring(0, 80),
        source: t.source,
        pubDate: t.pubDate,
        territories: (t.matches ?? []).filter((m: any) => m.type === "territory").map((m: any) => m.slug),
      })),
      // ── 10 competitive improvements ──
      legislativeTracker,
      regulatoryRisk: [...regulatoryRisk, ...euRegulatoryRisk.map((r) => ({ ...r, companyTypes: [], fiscalImpact: "" }))],
      stakeholderMap: [...stakeholderMap, ...subsidyMap],
      disciplineData,
      actorProfiles,
      euPipeline,
      ccaaCalendar,
      nationalSessions,
      fragility,
      mediaCoverage,
      partyCoverage,
      conflictAlerts,
      coherenceAlerts: coherenceAlerts.map((a) => ({ party: a.partyName, slug: a.partySlug, type: a.type, severity: a.severity, explanation: a.explanation })),
      votePredictions: votePredictions.map((v: any) => ({ category: v.category, result: v.likelyResult, confidence: v.confidence, reasoning: v.reasoning?.substring(0, 100) ?? "" })),
      // ── TRANSCRIPTS & ANALYSIS ──
      transcriptAnalysis: {
        stats: getTranscriptStats(),
        sentimentByParty: getSentimentSummary().byParty,
        topicHeatmap: getTopicHeatmap().slice(0, 12),
        verifiableClaims: getVerifiableClaims().slice(0, 20).map((c) => ({
          text: c.text,
          type: c.type,
          speaker: c.speaker,
          party: c.party,
        })),
        sessions: sessionTranscripts.map((t) => ({
          sessionId: t.sessionId,
          totalInterventions: t.totalInterventions,
          totalWords: t.totalWords,
          totalMinutes: t.totalMinutes,
          overallSentiment: t.sessionSentiment.overall,
          sentimentByParty: t.sessionSentiment.byParty,
          dominantTopics: t.dominantTopics.slice(0, 5),
          keyConflicts: t.keyConflicts,
          consensusAreas: t.consensusAreas,
          interventions: t.interventions.map((i) => ({
            id: i.id,
            speaker: i.speakerName,
            politicianSlug: i.politicianSlug,
            party: i.partySlug,
            role: i.role,
            durationMinutes: i.durationMinutes,
            fullText: i.fullText,
            sentiment: i.sentiment,
            stance: i.stance,
            claims: i.claims,
            keywords: i.keywords,
            topicTags: i.topicTags,
            mentionedPoliticians: i.mentionedPoliticians,
            mentionedParties: i.mentionedParties,
          })),
        })),
      },
    });
  } catch (err) {
    console.error("Inteligencia API error:", err);
    return Response.json({ error: "Error loading intelligence data" }, { status: 500 });
  }
}
