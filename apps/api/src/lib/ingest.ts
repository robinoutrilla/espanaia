/* ═══════════════════════════════════════════════════════════════════════════
   Ingestion logic — fetch from official sources → insert into PostgreSQL.
   Each connector has a dedicated ingest function.
   ═══════════════════════════════════════════════════════════════════════════ */

import {
  fetchBoeSummary,
  fetchBormeSummary,
  fetchCongressDeputies,
  fetchCongressProjectsOfLaw,
  fetchSenateCurrentComposition,
  fetchEurostatSpainSnapshot,
  fetchSpanishMEPs,
  fetchGobiernoComposition,
  fetchDatosGobCatalog,
  fetchCNMCResoluciones,
  fetchBdESnapshot,
  fetchSEPEDatasets,
  fetchTCResoluciones,
  fetchAEATDatasets,
  fetchCongresoIntervenciones,
  fetchSenadoDiarios,
  fetchTransparenciaResoluciones,
  fetchAIReFPublications,
  fetchCDTIData,
  fetchSegSocialStats,
  fetchEleccionesData,
} from "@espanaia/official-connectors";
import type { BoeIngestionItem } from "@espanaia/shared-types";
import { pool } from "./db.js";

/* ── Run tracking ──────────────────────────────────────────────────────── */

async function startRun(connectorId: string, sourceUrl?: string) {
  const result = await pool.query(
    `INSERT INTO ingestion_runs (connector_id, source_url) VALUES ($1, $2) RETURNING id`,
    [connectorId, sourceUrl ?? null],
  );
  return { runId: result.rows[0].id as number, startedAt: Date.now() };
}

async function finishRun(runId: number, recordCount: number, startedAt: number) {
  const durationMs = Date.now() - startedAt;
  await pool.query(
    `UPDATE ingestion_runs SET record_count = $1, duration_ms = $2, status = 'ok' WHERE id = $3`,
    [recordCount, durationMs, runId],
  );
  return { runId, recordCount, durationMs };
}

async function failRun(runId: number, error: Error) {
  await pool.query(
    `UPDATE ingestion_runs SET status = 'error', error_message = $1 WHERE id = $2`,
    [error.message, runId],
  );
}

/* ── BOE ───────────────────────────────────────────────────────────────── */

export async function ingestBoe(date: string) {
  const { runId, startedAt } = await startRun("connector-boe-sumario");

  try {
    const result = await fetchBoeSummary(date);
    let inserted = 0;

    for (const item of result.records) {
      await pool.query(
        `INSERT INTO boe_items (id, run_id, publication_date, gazette_number, section_code, section_name, department_name, epigraph_name, title, html_url, pdf_url, xml_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [
          item.id, runId, item.publicationDate, item.gazetteNumber,
          item.sectionCode, item.sectionName, item.departmentName,
          item.epigraphName, item.title, item.htmlUrl, item.pdfUrl, item.xmlUrl,
        ],
      );
      inserted++;
    }

    await pool.query(
      `UPDATE ingestion_runs SET source_url = $1 WHERE id = $2`,
      [result.sourceUrl, runId],
    );

    return await finishRun(runId, inserted, startedAt);
  } catch (err) {
    await failRun(runId, err as Error);
    throw err;
  }
}

/* ── BORME ─────────────────────────────────────────────────────────────── */

export async function ingestBorme(date: string) {
  const { runId, startedAt } = await startRun("connector-borme-sumario");

  try {
    const result = await fetchBormeSummary(date);
    let inserted = 0;

    // BORME returns a different structure — adapt to available fields
    const records = (result as { records?: Array<Record<string, unknown>> }).records ?? [];

    for (const item of records) {
      const id = (item.id ?? item.identificador ?? `borme-${date}-${inserted}`) as string;
      await pool.query(
        `INSERT INTO borme_items (id, run_id, publication_date, section_code, section_name, department_name, title, pdf_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          id, runId, date,
          (item.sectionCode ?? item.seccion ?? "") as string,
          (item.sectionName ?? item.nombreSeccion ?? "") as string,
          (item.departmentName ?? item.emisor ?? "") as string,
          (item.title ?? item.titulo ?? "Sin título") as string,
          (item.pdfUrl ?? item.urlPdf ?? null) as string | null,
        ],
      );
      inserted++;
    }

    return await finishRun(runId, inserted, startedAt);
  } catch (err) {
    await failRun(runId, err as Error);
    throw err;
  }
}

/* ── Congreso — Diputados ──────────────────────────────────────────────── */

export async function ingestCongressDeputies() {
  const { runId, startedAt } = await startRun("connector-congreso-diputados");

  try {
    const result = await fetchCongressDeputies();
    let inserted = 0;

    // Clear old records for a full refresh
    await pool.query(`DELETE FROM congress_deputies`);

    for (const dep of result.records) {
      await pool.query(
        `INSERT INTO congress_deputies (slug, run_id, full_name, constituency, electoral_formation, parliamentary_group, sworn_at, started_at, biography)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           constituency = EXCLUDED.constituency,
           electoral_formation = EXCLUDED.electoral_formation,
           parliamentary_group = EXCLUDED.parliamentary_group,
           sworn_at = EXCLUDED.sworn_at,
           started_at = EXCLUDED.started_at,
           biography = EXCLUDED.biography,
           run_id = EXCLUDED.run_id,
           ingested_at = now()`,
        [
          dep.slug, runId, dep.fullName, dep.constituency,
          dep.electoralFormation, dep.parliamentaryGroup,
          dep.swornAt, dep.startedAt, dep.biography,
        ],
      );
      inserted++;
    }

    await pool.query(
      `UPDATE ingestion_runs SET source_url = $1 WHERE id = $2`,
      [result.sourceUrl, runId],
    );

    return await finishRun(runId, inserted, startedAt);
  } catch (err) {
    await failRun(runId, err as Error);
    throw err;
  }
}

/* ── Congreso — Iniciativas ────────────────────────────────────────────── */

export async function ingestCongressInitiatives() {
  const { runId, startedAt } = await startRun("connector-congreso-iniciativas");

  try {
    const result = await fetchCongressProjectsOfLaw();
    let inserted = 0;

    for (const ini of result.records) {
      await pool.query(
        `INSERT INTO congress_initiatives (id, run_id, legislature, initiative_type, dossier_number, object, author, status, result, commission, qualification_date, filed_at, publications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           result = EXCLUDED.result,
           run_id = EXCLUDED.run_id,
           ingested_at = now()`,
        [
          ini.id, runId, ini.legislature, ini.initiativeType,
          ini.dossierNumber, ini.object, ini.author, ini.status,
          ini.result, ini.commission, ini.qualificationDate,
          ini.filedAt, ini.publications,
        ],
      );
      inserted++;
    }

    await pool.query(
      `UPDATE ingestion_runs SET source_url = $1 WHERE id = $2`,
      [result.sourceUrl, runId],
    );

    return await finishRun(runId, inserted, startedAt);
  } catch (err) {
    await failRun(runId, err as Error);
    throw err;
  }
}

/* ── Senado ─────────────────────────────────────────────────────────────── */

export async function ingestSenateMembersSnapshot() {
  const { runId, startedAt } = await startRun("connector-senado-composicion");

  try {
    const result = await fetchSenateCurrentComposition();
    let inserted = 0;

    // Full refresh for composition
    await pool.query(`DELETE FROM senate_members`);

    for (const m of result.records) {
      await pool.query(
        `INSERT INTO senate_members (slug, run_id, seat_number, legislature, full_name, short_name, first_names, last_names, political_party_code, political_party_name, parliamentary_group, parliamentary_group_code, source_type, representation_label, constituency, community, appointed_at, gender, profile_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (slug) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           parliamentary_group = EXCLUDED.parliamentary_group,
           run_id = EXCLUDED.run_id,
           ingested_at = now()`,
        [
          m.slug, runId, m.seatNumber, m.legislature, m.fullName,
          m.shortName, m.firstNames, m.lastNames,
          m.politicalPartyCode, m.politicalPartyName,
          m.parliamentaryGroup, m.parliamentaryGroupCode,
          m.sourceType, m.representationLabel,
          m.constituency, m.community, m.appointedAt,
          m.gender, m.profileUrl,
        ],
      );
      inserted++;
    }

    await pool.query(
      `UPDATE ingestion_runs SET source_url = $1 WHERE id = $2`,
      [result.sourceUrl, runId],
    );

    return await finishRun(runId, inserted, startedAt);
  } catch (err) {
    await failRun(runId, err as Error);
    throw err;
  }
}

/* ── Eurostat ──────────────────────────────────────────────────────────── */

export async function ingestEurostat() {
  const { runId, startedAt } = await startRun("connector-eurostat-spain");

  try {
    const snapshot = await fetchEurostatSpainSnapshot();
    let inserted = 0;

    for (const rec of snapshot.indicators) {
      await pool.query(
        `INSERT INTO eurostat_indicators (run_id, indicator, indicator_label, time_period, value, unit)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (indicator, time_period) DO UPDATE SET
           value = EXCLUDED.value,
           run_id = EXCLUDED.run_id,
           ingested_at = now()`,
        [runId, rec.indicator, rec.indicatorLabel, rec.timePeriod, rec.value, rec.unit],
      );
      inserted++;
    }

    return await finishRun(runId, inserted, startedAt);
  } catch (err) {
    await failRun(runId, err as Error);
    throw err;
  }
}

/* ── EU Parliament MEPs ────────────────────────────────────────────────── */

export async function ingestEUMEPs() {
  const { runId, startedAt } = await startRun("connector-europarlamento");
  try {
    const snapshot = await fetchSpanishMEPs();
    let inserted = 0;
    await pool.query(`DELETE FROM eu_meps`);
    for (const m of snapshot.meps) {
      await pool.query(
        `INSERT INTO eu_meps (slug, run_id, ep_id, full_name, family_name, given_name, country, political_group, national_party, profile_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (slug) DO UPDATE SET full_name=EXCLUDED.full_name, run_id=EXCLUDED.run_id, ingested_at=now()`,
        [m.slug, runId, m.epId, m.fullName, m.familyName, m.givenName, m.country, m.politicalGroup, m.nationalParty, m.profileUrl],
      );
      inserted++;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [snapshot.sourceUrl, runId]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── Gobierno de España ────────────────────────────────────────────────── */

export async function ingestGobierno() {
  const { runId, startedAt } = await startRun("connector-gobierno");
  try {
    const snapshot = await fetchGobiernoComposition();
    let inserted = 0;
    await pool.query(`DELETE FROM gobierno_members`);
    for (const m of snapshot.members) {
      await pool.query(
        `INSERT INTO gobierno_members (slug, run_id, name, role, ministry, image_url, profile_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role, run_id=EXCLUDED.run_id, ingested_at=now()`,
        [m.slug, runId, m.name, m.role, m.ministry, m.imageUrl, m.profileUrl],
      );
      inserted++;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [snapshot.sourceUrl, runId]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── datos.gob.es ──────────────────────────────────────────────────────── */

export async function ingestDatosGob() {
  const { runId, startedAt } = await startRun("connector-datos-gob");
  try {
    const snapshot = await fetchDatosGobCatalog(50);
    let inserted = 0;
    for (const d of snapshot.datasets) {
      await pool.query(
        `INSERT INTO datos_gob_datasets (id, run_id, title, description, publisher, theme, frequency, modified, url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, run_id=EXCLUDED.run_id, ingested_at=now()`,
        [d.id, runId, d.title, d.description, d.publisher, d.theme, d.frequency, d.modified, d.url],
      );
      inserted++;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [snapshot.sourceUrl, runId]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── CNMC ──────────────────────────────────────────────────────────────── */

export async function ingestCNMC() {
  const { runId, startedAt } = await startRun("connector-cnmc");
  try {
    const snapshot = await fetchCNMCResoluciones();
    let inserted = 0;
    for (const r of snapshot.resoluciones) {
      await pool.query(
        `INSERT INTO cnmc_resoluciones (id, run_id, title, expediente, date, sector, url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, run_id=EXCLUDED.run_id, ingested_at=now()`,
        [r.id, runId, r.title, r.expediente, r.date, r.sector, r.url],
      );
      inserted++;
    }
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── Tribunal Constitucional ──────────────────────────────────────────── */

export async function ingestTC() {
  const { runId, startedAt } = await startRun("connector-tc");
  try {
    const snapshot = await fetchTCResoluciones();
    let inserted = 0;
    for (const r of snapshot.resoluciones) {
      await pool.query(
        `INSERT INTO tc_resoluciones (id, run_id, tipo, numero, fecha, resumen, url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET run_id=EXCLUDED.run_id, ingested_at=now()`,
        [r.id, runId, r.tipo, r.numero, r.fecha, r.resumen, r.url],
      );
      inserted++;
    }
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── AEAT ──────────────────────────────────────────────────────────────── */

export async function ingestAEAT() {
  const { runId, startedAt } = await startRun("connector-aeat");
  try {
    const snapshot = await fetchAEATDatasets();
    let inserted = 0;
    for (const d of snapshot.datasets) {
      await pool.query(
        `INSERT INTO aeat_datasets (id, run_id, title, description, modified, url)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, run_id=EXCLUDED.run_id, ingested_at=now()`,
        [d.id, runId, d.title, d.description, d.modified, d.url],
      );
      inserted++;
    }
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── Banco de España ──────────────────────────────────────────────────── */

export async function ingestBdE() {
  const { runId, startedAt } = await startRun("connector-bde");
  try {
    const snapshot = await fetchBdESnapshot();
    let inserted = 0;
    for (const s of snapshot.series) {
      for (const obs of s.observations) {
        await pool.query(
          `INSERT INTO bde_series (run_id, serie_id, label, frequency, unit, period, value)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (serie_id, period) DO UPDATE SET value=EXCLUDED.value, run_id=EXCLUDED.run_id, ingested_at=now()`,
          [runId, s.serieId, s.label, s.frequency, s.unit, obs.period, obs.value],
        );
        inserted++;
      }
    }
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── SEPE ──────────────────────────────────────────────────────────────── */

export async function ingestSEPE() {
  const { runId, startedAt } = await startRun("connector-sepe");
  try {
    const snapshot = await fetchSEPEDatasets();
    let inserted = 0;
    for (const d of snapshot.datasets) {
      await pool.query(
        `INSERT INTO sepe_datasets (id, run_id, title, description, modified)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, run_id=EXCLUDED.run_id, ingested_at=now()`,
        [d.id, runId, d.title, d.description, d.modified],
      );
      inserted++;
    }
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── AIReF ────────────────────────────────────────────────────────────── */

export async function ingestAIReF(maxPages = 5) {
  const { runId, startedAt } = await startRun("connector-airef");
  try {
    const snapshot = await fetchAIReFPublications(maxPages);
    let inserted = 0;
    for (const p of snapshot.publications) {
      await pool.query(
        `INSERT INTO airef_publications (id, run_id, title, date, link, description, categories, creator)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET run_id=EXCLUDED.run_id, ingested_at=now()`,
        [p.id, runId, p.title, p.date, p.link, p.description, p.categories, p.creator],
      );
      inserted++;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [snapshot.sourceUrl, runId]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── CDTI ─────────────────────────────────────────────────────────────── */

export async function ingestCDTI() {
  const { runId, startedAt } = await startRun("connector-cdti");
  try {
    const snapshot = await fetchCDTIData();
    let inserted = 0;
    await pool.query(`DELETE FROM cdti_programs`);
    for (const p of snapshot.programs) {
      await pool.query(
        `INSERT INTO cdti_programs (id, run_id, name, category, description, url, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET run_id=EXCLUDED.run_id, ingested_at=now()`,
        [p.id, runId, p.name, p.category, p.description, p.url, p.status],
      );
      inserted++;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [snapshot.sourceUrl, runId]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── Seguridad Social ─────────────────────────────────────────────────── */

export async function ingestSegSocial() {
  const { runId, startedAt } = await startRun("connector-seg-social");
  try {
    const snapshot = await fetchSegSocialStats();
    let inserted = 0;
    await pool.query(`DELETE FROM seg_social_sections`);
    for (const s of snapshot.sections) {
      await pool.query(
        `INSERT INTO seg_social_sections (id, run_id, code, name, category, description, url, sub_section_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET run_id=EXCLUDED.run_id, sub_section_count=EXCLUDED.sub_section_count, ingested_at=now()`,
        [s.id, runId, s.code, s.name, s.category, s.description, s.url, s.subSections.length],
      );
      inserted++;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [snapshot.sourceUrl, runId]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── Portal de Transparencia ──────────────────────────────────────────── */

export async function ingestTransparencia() {
  const { runId, startedAt } = await startRun("connector-transparencia");
  try {
    const snapshot = await fetchTransparenciaResoluciones(["2024", "2025"]);
    let inserted = 0;
    for (const r of snapshot.resoluciones) {
      await pool.query(
        `INSERT INTO transparencia_resoluciones (id, run_id, tipo, ministerio, asunto, fecha, referencia, causas_denegacion, resultado)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET run_id=EXCLUDED.run_id, ingested_at=now()`,
        [r.id, runId, r.tipo, r.ministerio, r.asunto, r.fecha, r.referencia, r.causasDenegacion ?? null, r.resultado ?? null],
      );
      inserted++;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [snapshot.sourceUrl, runId]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── Congreso Intervenciones (Diario + TV) ────────────────────────────── */

export async function ingestCongresoIntervenciones(legislatura = "15", pages = 3) {
  const { runId, startedAt } = await startRun("connector-congreso-intervenciones");
  try {
    let inserted = 0;
    for (let page = 1; page <= pages; page++) {
      const snapshot = await fetchCongresoIntervenciones(legislatura, page, 50);
      for (const i of snapshot.intervenciones) {
        await pool.query(
          `INSERT INTO congreso_intervenciones (id, run_id, fecha, legislatura, orador, cargo_orador, sesion_nombre, sesion_numero, fase, organo, objeto_iniciativa, diario_pdf_url, diario_pagina, video_descarga_url, video_emision_url, video_inicio, video_fin)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
           ON CONFLICT (id) DO UPDATE SET run_id=EXCLUDED.run_id, ingested_at=now()`,
          [
            i.id, runId, i.fecha, i.legislatura, i.orador, i.cargoOrador,
            i.sesionNombre, i.sesionNumero, i.fase, i.organo,
            i.objetoIniciativa, i.diarioPdfPath, i.diarioPagina,
            i.videoDescargaUrl, i.videoEmisionUrl, i.videoInicio, i.videoFin,
          ],
        );
        inserted++;
      }
      if (snapshot.intervenciones.length === 0) break;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [
      "https://www.congreso.es/es/busqueda-de-intervenciones", runId,
    ]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── Senado Diarios de Sesiones ──────────────────────────────────────── */

export async function ingestSenadoDiarios(legislatura = "15") {
  const { runId, startedAt } = await startRun("connector-senado-diarios");
  try {
    const snapshot = await fetchSenadoDiarios(legislatura);
    let inserted = 0;
    for (const d of snapshot.diarios) {
      await pool.query(
        `INSERT INTO senado_diarios (id, run_id, legislatura, numero, tipo, pdf_url, size_bytes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET run_id=EXCLUDED.run_id, size_bytes=EXCLUDED.size_bytes, ingested_at=now()`,
        [d.id, runId, d.legislatura, d.numero, d.tipo, d.pdfUrl, d.sizeBytes ?? null],
      );
      inserted++;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [snapshot.sourceUrl, runId]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── Elecciones ──────────────────────────────────────────────────────── */

export async function ingestElecciones() {
  const { runId, startedAt } = await startRun("connector-elecciones");
  try {
    const snapshot = await fetchEleccionesData();
    let inserted = 0;
    await pool.query(`DELETE FROM elecciones_meta`);
    await pool.query(`DELETE FROM elecciones_resultados`);
    for (const m of snapshot.meta) {
      await pool.query(
        `INSERT INTO elecciones_meta (id, run_id, eleccion, fecha, tipo, censo, votantes, participacion, votos_validos, votos_nulos, votos_blanco, escanos_totales)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO UPDATE SET run_id=EXCLUDED.run_id, ingested_at=now()`,
        [m.id, runId, m.eleccion, m.fecha, m.tipo, m.censo, m.votantes, m.participacion, m.votos_validos, m.votos_nulos, m.votos_blanco, m.escanos_totales],
      );
    }
    for (const r of snapshot.resultados) {
      await pool.query(
        `INSERT INTO elecciones_resultados (id, run_id, eleccion, fecha, tipo, partido, siglas, votos, porcentaje, escanos, candidato_cabeza)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET run_id=EXCLUDED.run_id, ingested_at=now()`,
        [r.id, runId, r.eleccion, r.fecha, r.tipo, r.partido, r.siglas, r.votos, r.porcentaje, r.escanos, r.candidato_cabeza],
      );
      inserted++;
    }
    await pool.query(`UPDATE ingestion_runs SET source_url=$1 WHERE id=$2`, [snapshot.sourceUrl, runId]);
    return await finishRun(runId, inserted, startedAt);
  } catch (err) { await failRun(runId, err as Error); throw err; }
}

/* ── Run All ───────────────────────────────────────────────────────────── */

export async function ingestAll(boeDate: string) {
  const results: Record<string, { runId: number; recordCount: number; durationMs: number } | { error: string }> = {};

  for (const [name, fn] of [
    ["boe", () => ingestBoe(boeDate)],
    ["borme", () => ingestBorme(boeDate)],
    ["congreso-diputados", () => ingestCongressDeputies()],
    ["congreso-iniciativas", () => ingestCongressInitiatives()],
    ["senado", () => ingestSenateMembersSnapshot()],
    ["eurostat", () => ingestEurostat()],
    ["europarlamento", () => ingestEUMEPs()],
    ["gobierno", () => ingestGobierno()],
    ["datos-gob", () => ingestDatosGob()],
    ["cnmc", () => ingestCNMC()],
    ["tc", () => ingestTC()],
    ["aeat", () => ingestAEAT()],
    ["bde", () => ingestBdE()],
    ["sepe", () => ingestSEPE()],
    ["airef", () => ingestAIReF()],
    ["cdti", () => ingestCDTI()],
    ["seg-social", () => ingestSegSocial()],
    ["transparencia", () => ingestTransparencia()],
    ["congreso-intervenciones", () => ingestCongresoIntervenciones()],
    ["senado-diarios", () => ingestSenadoDiarios()],
    ["elecciones", () => ingestElecciones()],
  ] as const) {
    try {
      results[name] = await fn();
    } catch (err) {
      results[name] = { error: (err as Error).message };
    }
  }

  return results;
}
