import Link from "next/link";
import {
  getInitiativesForPolitician,
  getPartyBySlug,
  getPoliticianBySlug,
  getSignalsForPolitician,
  getTerritoryBySlug,
} from "@espanaia/seed-data";
import { notFound } from "next/navigation";
import { SectionHeading } from "../../../components/section-heading";
import { SignalCard } from "../../../components/signal-card";
import { SiteHeader } from "../../../components/site-header";
import { getPoliticalCensusProfile } from "../../../lib/political-census";
import { getDeputyVotes, getPartyDiscipline, categoryLabels, categoryColors } from "../../../lib/voting-data";
import { getDeclaration, depositRangeLabels, incomeTypeLabels } from "../../../lib/declarations-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function PoliticianDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const officialProfileEntry = await getPoliticalCensusProfile(slug);

  if (officialProfileEntry?.profile) {
    const { profile, layers } = officialProfileEntry;
    const chamberLayer = layers.find((layer) => layer.id === profile.chamber);
    const officialDeputyVotes = getDeputyVotes(slug);
    const officialDeclaration = getDeclaration(slug);
    const officialDiscipline = profile.currentPartyCode
      ? getPartyDiscipline(profile.currentPartyCode.toLowerCase(), "congreso")
      : [];

    return (
      <main className="page-shell detail-page">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <SiteHeader currentSection="politicians" />

        <section className="panel detail-hero">
          <div className="detail-hero-grid">
            <div className="detail-copy">
              <Link className="back-link" href="/politicians">
                Volver al directorio político
              </Link>
              <span className="eyebrow">Perfil político oficial</span>
              <h1 className="detail-title">{profile.shortName}</h1>
              <p className="detail-description">{profile.currentRoleSummary}</p>
              <div className="chip-row">
                <span className="micro-tag">{profile.chamberLabel}</span>
                <span className="micro-tag">{profile.currentPartyCode ?? profile.currentPartyName}</span>
                <span className="micro-tag">{profile.parliamentaryGroupCode ?? profile.parliamentaryGroup}</span>
                <span className="micro-tag">{profile.territoryLabel}</span>
                {profile.appointmentType ? <span className="micro-tag">{profile.appointmentType}</span> : null}
              </div>
            </div>

            <aside className="detail-aside">
              <div className="stat-card">
                <span>Cámara</span>
                <strong>{profile.chamber === "congreso" ? "Congreso" : "Senado"}</strong>
              </div>
              <div className="stat-card">
                <span>Legislatura</span>
                <strong>{profile.legislature}</strong>
              </div>
              <div className="stat-card">
                <span>Perfiles en capa</span>
                <strong>{chamberLayer?.recordCount ?? "n/d"}</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel section-panel">
            <SectionHeading
              eyebrow="Perfil"
              title="Ficha institucional"
              description="Resumen generado desde open data parlamentario y, cuando existe, enlazado con la ficha oficial pública."
            />
            <div className="biography-card">
              <p>
                {profile.biography ??
                  "Perfil indexado desde fuentes oficiales parlamentarias. Esta ficha prioriza procedencia, grupo y trazabilidad antes que una biografía editorial."}
              </p>
              <div className="chip-row">
                <span className="micro-tag">{profile.currentPartyName}</span>
                <span className="micro-tag">{profile.parliamentaryGroup}</span>
                {profile.representationLabel ? <span className="micro-tag">{profile.representationLabel}</span> : null}
                {profile.constituency ? <span className="micro-tag">{profile.constituency}</span> : null}
              </div>
            </div>
          </div>

          <div className="panel section-panel">
            <SectionHeading
              eyebrow="Mandato"
              title="Representación actual"
              description="Datos visibles en la capa oficial unificada de Congreso y Senado."
            />
            <div className="compact-list">
              <article className="compact-card">
                <span className="tag tag-bright">Partido</span>
                <h3>{profile.currentPartyName}</h3>
                <p>{profile.currentPartyCode ? `Siglas: ${profile.currentPartyCode}` : "Siglas no especificadas en esta capa."}</p>
              </article>
              <article className="compact-card">
                <span className="tag tag-bright">Grupo</span>
                <h3>{profile.parliamentaryGroupCode ?? profile.parliamentaryGroup}</h3>
                <p>{profile.parliamentaryGroup}</p>
              </article>
              <article className="compact-card">
                <span className="tag tag-bright">Procedencia</span>
                <h3>{profile.territoryLabel}</h3>
                <p>{profile.representationLabel ?? profile.currentRoleSummary}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel section-panel">
            <SectionHeading
              eyebrow="Fuentes"
              title="Trazabilidad oficial"
              description="Enlaces directos a la ficha o dataset que alimentan esta persona dentro del censo."
            />
            <div className="compact-list compact-list-wide">
              <article className="compact-card">
                <span className="tag tag-bright">Fuente principal</span>
                <h3>{profile.chamberLabel}</h3>
                <p>Registro parlamentario utilizado como referencia primaria para esta ficha.</p>
                <a href={profile.sourceOfTruthUrl} rel="noreferrer" target="_blank">
                  Abrir fuente oficial
                </a>
              </article>
              <article className="compact-card">
                <span className="tag tag-bright">Dataset</span>
                <h3>Ingesta parlamentaria</h3>
                <p>Snapshot o feed oficial usado para construir el directorio unificado.</p>
                <a href={profile.sourceDatasetUrl} rel="noreferrer" target="_blank">
                  Abrir dataset
                </a>
              </article>
            </div>
          </div>

          <div className="panel section-panel">
            <SectionHeading
              eyebrow="Cobertura"
              title="Estado de la ingestión por capas"
              description="Panorama de las capas actuales y de las siguientes fases previstas en la plataforma."
            />
            <div className="compact-list compact-list-wide">
              {layers.map((layer) => (
                <article className="compact-card" key={layer.id}>
                  <span className="tag tag-bright">{layer.status}</span>
                  <h3>{layer.name}</h3>
                  <p>{layer.note}</p>
                  <span>{layer.recordCount} registros</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Voting record (official profile) ── */}
        {officialDeputyVotes.length > 0 ? (
          <section className="content-grid">
            <div className="panel section-panel" style={{ gridColumn: "1 / -1" }}>
              <SectionHeading
                eyebrow="Actividad parlamentaria"
                title={`${officialDeputyVotes.length} votaciones registradas`}
                description="Registro de votos individuales en plenos del Congreso y Senado."
              />
              <div className="vote-list">
                {officialDeputyVotes.map((dv) => {
                  const detail = dv.vote_detail;
                  if (!detail) return null;
                  const catColor = categoryColors[detail.category] ?? "var(--ink-muted)";
                  return (
                    <article className="vote-card" key={detail.id} style={{ borderLeft: `4px solid ${catColor}` }}>
                      <div className="vote-card-header">
                        <div className="vote-card-meta">
                          <span className="tag" style={{ background: `${catColor}18`, color: catColor }}>
                            {categoryLabels[detail.category] ?? detail.category}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                            {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(detail.sessionDate))}
                          </span>
                        </div>
                        <span className="tag" style={{
                          background: dv.vote === "si" ? "var(--verde-soft)" : dv.vote === "no" ? "var(--rojo-soft)" : "var(--oro-soft)",
                          color: dv.vote === "si" ? "var(--verde)" : dv.vote === "no" ? "var(--rojo)" : "var(--oro)",
                          fontWeight: 700,
                        }}>
                          {dv.vote === "si" ? "A FAVOR" : dv.vote === "no" ? "EN CONTRA" : "ABSTENCIÓN"}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "0.92rem" }}>{detail.title}</h3>
                    </article>
                  );
                })}
              </div>
              {officialDiscipline.length > 0 ? (
                <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--surface)", borderRadius: "var(--radius-md)", fontSize: "0.82rem" }}>
                  <strong>Disciplina de partido:</strong>{" "}
                  {officialDiscipline[0].disciplineRate}% cohesión · {officialDiscipline[0].rebellions} rebeliones
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ── Asset declaration (official profile) ── */}
        {officialDeclaration ? (
          <section className="content-grid">
            <div className="panel section-panel" style={{ gridColumn: "1 / -1" }}>
              <SectionHeading
                eyebrow="Transparencia"
                title="Declaración de bienes y actividades"
                description={`Declaración presentada el ${new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(officialDeclaration.declarationDate))}.`}
              />
              <div className="declaration-details" style={{ maxWidth: 600 }}>
                <div className="declaration-row">
                  <span>Inmuebles</span>
                  <strong>{officialDeclaration.realEstate.length}</strong>
                </div>
                <div className="declaration-row">
                  <span>Depósitos bancarios</span>
                  <strong>{depositRangeLabels[officialDeclaration.bankDeposits.range]}</strong>
                </div>
                {officialDeclaration.income.map((inc, i) => (
                  <div className="declaration-row" key={i}>
                    <span>{incomeTypeLabels[inc.type]}</span>
                    <strong>{inc.annualAmount ? `${inc.annualAmount.toLocaleString("es-ES")} €/año` : inc.source}</strong>
                  </div>
                ))}
                {officialDeclaration.liabilities.length > 0 ? (
                  <div className="declaration-row">
                    <span>Deudas</span>
                    <strong>{officialDeclaration.liabilities.length} ({officialDeclaration.liabilities[0]?.amountRange})</strong>
                  </div>
                ) : null}
                {officialDeclaration.vehicles.length > 0 ? (
                  <div className="declaration-row">
                    <span>Vehículos</span>
                    <strong>{officialDeclaration.vehicles.length}</strong>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    );
  }

  const politician = getPoliticianBySlug(slug);

  if (!politician) {
    notFound();
  }

  const party = getPartyBySlug(politician.currentPartySlug);
  const territory = getTerritoryBySlug(politician.territorySlug);
  const signals = getSignalsForPolitician(slug);
  const initiatives = getInitiativesForPolitician(slug);
  const deputyVotes = getDeputyVotes(slug);
  const declaration = getDeclaration(slug);
  const discipline = party ? getPartyDiscipline(party.slug, "congreso") : [];

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="politicians" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <Link className="back-link" href="/politicians">
              Volver al directorio político
            </Link>
            <span className="eyebrow">Perfil político</span>
            <h1 className="detail-title">{politician.shortName}</h1>
            <p className="detail-description">{politician.currentRoleSummary}</p>
            <div className="chip-row">
              {party ? <Link className="micro-tag" href={`/parties/${party.slug}`}>{party.shortName}</Link> : null}
              {territory ? <Link className="micro-tag" href={`/territories/${territory.slug}`}>{territory.name}</Link> : null}
              {politician.constituency ? <span className="micro-tag">{politician.constituency}</span> : null}
            </div>
          </div>

          <aside className="detail-aside">
            <div className="stat-card">
              <span>Señales relacionadas</span>
              <strong>{signals.length}</strong>
            </div>
            <div className="stat-card">
              <span>Iniciativas vinculadas</span>
              <strong>{initiatives.length}</strong>
            </div>
            <div className="stat-card">
              <span>Fuente oficial</span>
              <a href={politician.sourceOfTruthUrl} rel="noreferrer" target="_blank">
                Congreso open data
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Señales"
            title="Contexto político asociado"
            description="Señales del radar donde interviene la persona, su partido o el territorio al que está ligada."
          />
          <div className="signal-list">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} territoryLabel={territory?.name ?? signal.territorySlug} />
            ))}
          </div>
        </div>

        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Perfil"
            title="Biografía base"
            description="Resumen corto derivado de la ficha pública usada como primera fuente verificable."
          />
          <div className="biography-card">
            <p>{politician.biography}</p>
            <div className="chip-row">
              {politician.signalFocus.map((focus) => (
                <span className="micro-tag" key={focus}>
                  {focus}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Enlaces"
            title="Partido y territorio"
            description="Navegación cruzada hacia el resto del grafo ya disponible en la web."
          />
          <div className="compact-list">
            {party ? (
              <Link className="compact-card" href={`/parties/${party.slug}`}>
                <span className="tag tag-bright">Partido</span>
                <h3>{party.shortName}</h3>
                <p>{party.positioning}</p>
              </Link>
            ) : null}
            {territory ? (
              <Link className="compact-card" href={`/territories/${territory.slug}`}>
                <span className="tag tag-bright">Territorio</span>
                <h3>{territory.name}</h3>
                <p>{territory.strategicFocus}</p>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Parlamento"
            title="Iniciativas asociadas"
            description="Piezas parlamentarias relevantes dentro del radar inicial."
          />
          <div className="compact-list compact-list-wide">
            {initiatives.map((initiative) => (
              <article className="compact-card" key={initiative.id}>
                <span className="tag tag-bright">{initiative.dossierNumber}</span>
                <h3>{initiative.title}</h3>
                <p>{initiative.status}</p>
                <a href={initiative.sourceUrl} rel="noreferrer" target="_blank">
                  Ver fuente del Congreso
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voting record ── */}
      {deputyVotes.length > 0 ? (
        <section className="content-grid">
          <div className="panel section-panel" style={{ gridColumn: "1 / -1" }}>
            <SectionHeading
              eyebrow="Actividad parlamentaria"
              title={`${deputyVotes.length} votaciones registradas`}
              description="Registro de votos individuales en plenos del Congreso y Senado."
            />
            <div className="vote-list">
              {deputyVotes.map((dv) => {
                const detail = dv.vote_detail;
                if (!detail) return null;
                const catColor = categoryColors[detail.category] ?? "var(--ink-muted)";
                return (
                  <article className="vote-card" key={detail.id} style={{ borderLeft: `4px solid ${catColor}` }}>
                    <div className="vote-card-header">
                      <div className="vote-card-meta">
                        <span className="tag" style={{ background: `${catColor}18`, color: catColor }}>
                          {categoryLabels[detail.category] ?? detail.category}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                          {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(detail.sessionDate))}
                        </span>
                      </div>
                      <span className="tag" style={{
                        background: dv.vote === "si" ? "var(--verde-soft)" : dv.vote === "no" ? "var(--rojo-soft)" : "var(--oro-soft)",
                        color: dv.vote === "si" ? "var(--verde)" : dv.vote === "no" ? "var(--rojo)" : "var(--oro)",
                        fontWeight: 700,
                      }}>
                        {dv.vote === "si" ? "A FAVOR" : dv.vote === "no" ? "EN CONTRA" : "ABSTENCIÓN"}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "0.92rem" }}>{detail.title}</h3>
                  </article>
                );
              })}
            </div>
            {discipline.length > 0 ? (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--surface)", borderRadius: "var(--radius-md)", fontSize: "0.82rem" }}>
                <strong>Disciplina de {party?.shortName}:</strong>{" "}
                {discipline[0].disciplineRate}% cohesión · {discipline[0].rebellions} rebeliones
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── Asset declaration ── */}
      {declaration ? (
        <section className="content-grid">
          <div className="panel section-panel" style={{ gridColumn: "1 / -1" }}>
            <SectionHeading
              eyebrow="Transparencia"
              title="Declaración de bienes y actividades"
              description={`Declaración presentada el ${new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(declaration.declarationDate))}.`}
            />
            <div className="declaration-details" style={{ maxWidth: 600 }}>
              <div className="declaration-row">
                <span>Inmuebles</span>
                <strong>{declaration.realEstate.length}</strong>
              </div>
              <div className="declaration-row">
                <span>Depósitos bancarios</span>
                <strong>{depositRangeLabels[declaration.bankDeposits.range]}</strong>
              </div>
              {declaration.income.map((inc, i) => (
                <div className="declaration-row" key={i}>
                  <span>{incomeTypeLabels[inc.type]}</span>
                  <strong>{inc.annualAmount ? `${inc.annualAmount.toLocaleString("es-ES")} €/año` : inc.source}</strong>
                </div>
              ))}
              {declaration.liabilities.length > 0 ? (
                <div className="declaration-row">
                  <span>Deudas</span>
                  <strong>{declaration.liabilities.length} ({declaration.liabilities[0]?.amountRange})</strong>
                </div>
              ) : null}
              {declaration.vehicles.length > 0 ? (
                <div className="declaration-row">
                  <span>Vehículos</span>
                  <strong>{declaration.vehicles.length}</strong>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
