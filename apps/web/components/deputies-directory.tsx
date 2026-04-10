"use client";

import { useState, useMemo } from "react";
import type { CongressDeputySeed } from "@espanaia/seed-data";

interface ParliamentaryGroupSeed {
  slug: string;
  name: string;
  seats: number;
}

interface DeputiesDirectoryProps {
  deputies: CongressDeputySeed[];
  groups: ParliamentaryGroupSeed[];
  partyColors: Record<string, string>;
}

export function DeputiesDirectory({ deputies, groups, partyColors }: DeputiesDirectoryProps) {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeConstituency, setActiveConstituency] = useState<string | null>(null);

  /* Derive unique constituencies sorted alphabetically */
  const constituencies = useMemo(() => {
    const set = new Set(deputies.map((d) => d.constituency));
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [deputies]);

  /* Filter deputies */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return deputies.filter((d) => {
      if (activeGroup && d.parliamentaryGroup !== activeGroup) return false;
      if (activeConstituency && d.constituency !== activeConstituency) return false;
      if (q) {
        const hay = `${d.fullName} ${d.constituency} ${d.electoralFormation} ${d.parliamentaryGroup}`
          .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [deputies, search, activeGroup, activeConstituency]);

  /* Group filtered deputies by parliamentary group */
  const groupedFiltered = useMemo(() => {
    const map = new Map<string, CongressDeputySeed[]>();
    for (const d of filtered) {
      const list = map.get(d.parliamentaryGroup) ?? [];
      list.push(d);
      map.set(d.parliamentaryGroup, list);
    }
    /* Sort groups by original seat order */
    return groups
      .filter((g) => map.has(g.name))
      .map((g) => ({ group: g, members: map.get(g.name)! }));
  }, [filtered, groups]);

  function resolveGroupColor(groupName: string, members: CongressDeputySeed[]) {
    return Object.entries(partyColors).find(([key]) =>
      groupName.toLowerCase().includes(key) ||
      members[0]?.electoralFormation.toLowerCase() === key
    )?.[1] ?? "var(--azul)";
  }

  const hasFilters = search || activeGroup || activeConstituency;

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="deputies-filters">
        {/* Search */}
        <div className="deputies-search-wrap">
          <svg className="deputies-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="deputies-search"
            type="text"
            placeholder="Buscar diputado, circunscripción o partido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="deputies-search-clear" onClick={() => setSearch("")} aria-label="Limpiar">
              &times;
            </button>
          )}
        </div>

        {/* Group filter pills */}
        <div className="deputies-filter-section">
          <span className="deputies-filter-label">Grupo</span>
          <div className="deputies-filter-options">
            <button
              className={`deputies-filter-pill ${!activeGroup ? "deputies-filter-pill-active" : ""}`}
              onClick={() => setActiveGroup(null)}
            >
              Todos ({deputies.length})
            </button>
            {groups.map((g) => (
              <button
                key={g.slug}
                className={`deputies-filter-pill ${activeGroup === g.name ? "deputies-filter-pill-active" : ""}`}
                onClick={() => setActiveGroup(activeGroup === g.name ? null : g.name)}
              >
                {g.name.replace("Grupo Parlamentario ", "").replace(" en el Congreso", "")} ({g.seats})
              </button>
            ))}
          </div>
        </div>

        {/* Constituency filter */}
        <div className="deputies-filter-section">
          <span className="deputies-filter-label">Circunscripci{"o\u0301"}n</span>
          <div className="deputies-filter-options">
            <button
              className={`deputies-filter-pill ${!activeConstituency ? "deputies-filter-pill-active" : ""}`}
              onClick={() => setActiveConstituency(null)}
            >
              Todas
            </button>
            {constituencies.map((c) => (
              <button
                key={c}
                className={`deputies-filter-pill ${activeConstituency === c ? "deputies-filter-pill-active" : ""}`}
                onClick={() => setActiveConstituency(activeConstituency === c ? null : c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      {hasFilters && (
        <div className="deputies-results-bar">
          <span>{filtered.length} de {deputies.length} diputados</span>
          <button className="deputies-clear-all" onClick={() => { setSearch(""); setActiveGroup(null); setActiveConstituency(null); }}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* ── Grouped results ── */}
      {groupedFiltered.map(({ group, members }) => {
        const groupColor = resolveGroupColor(group.name, members);
        return (
          <div key={group.slug} style={{ marginBottom: "var(--space-lg)" }}>
            <div className="party-group-header" style={{ borderLeft: `4px solid ${groupColor}` }}>
              <span className="party-group-badge" style={{ background: `${groupColor}22`, color: groupColor }}>
                {members.length}
              </span>
              <h2 className="party-group-name">{group.name}</h2>
              <span className="party-group-count">{members.length} diputados</span>
            </div>
            <div className="deputies-list">
              {members.map((deputy) => (
                <div className="deputy-row" key={deputy.slug}>
                  <span className="deputy-name">{deputy.fullName}</span>
                  <span className="deputy-constituency">{deputy.constituency}</span>
                  <span className="micro-tag">{deputy.electoralFormation}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="deputies-empty">
          <p>No se encontraron diputados con los filtros seleccionados.</p>
        </div>
      )}
    </>
  );
}
