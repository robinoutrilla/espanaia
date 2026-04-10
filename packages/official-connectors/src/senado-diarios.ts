/* ═══════════════════════════════════════════════════════════════════════════
   Senado — Diarios de Sesiones (plenary session publications)
   Scans the predictable PDF URL pattern to build an index of available
   diario de sesiones for a given legislature.
   ═══════════════════════════════════════════════════════════════════════════ */

const SENADO_BASE = "https://www.senado.es";

export interface SenadoDiario {
  id: string;
  legislatura: string;
  numero: number;
  tipo: "pleno" | "comision";
  pdfUrl: string;
  sizeBytes?: number;
}

export interface SenadoDiariosSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  legislatura: string;
  totalDiarios: number;
  diarios: SenadoDiario[];
}

/**
 * Scan for available Senado plenary diario PDFs for a given legislature.
 * Uses HEAD requests to quickly check which numbered PDFs exist.
 * @param legislatura Legislature number (e.g. "15")
 * @param maxScan Maximum number to scan up to (default 200)
 */
export async function fetchSenadoDiarios(
  legislatura = "15",
  maxScan = 200,
): Promise<SenadoDiariosSnapshot> {
  const sourceUrl = `${SENADO_BASE}/legis${legislatura}/publicaciones/pdf/senado/ds/`;
  const diarios: SenadoDiario[] = [];
  let consecutiveMisses = 0;

  for (let num = 1; num <= maxScan; num++) {
    const pdfUrl = `${SENADO_BASE}/legis${legislatura}/publicaciones/pdf/senado/ds/DS_P_${legislatura}_${num}.PDF`;

    try {
      const response = await fetch(pdfUrl, {
        method: "HEAD",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; EspanaIA/0.1)" },
      });

      if (response.ok) {
        const size = Number(response.headers.get("content-length") ?? "0");
        diarios.push({
          id: `ds-senado-p-${legislatura}-${num}`,
          legislatura,
          numero: num,
          tipo: "pleno",
          pdfUrl,
          sizeBytes: size > 0 ? size : undefined,
        });
        consecutiveMisses = 0;
      } else {
        consecutiveMisses++;
        // Stop after 5 consecutive misses — we've likely passed the last diario
        if (consecutiveMisses >= 5) break;
      }
    } catch {
      consecutiveMisses++;
      if (consecutiveMisses >= 5) break;
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    legislatura,
    totalDiarios: diarios.length,
    diarios,
  };
}
