import { unstable_noStore as noStore } from "next/cache";
import type {
  OfficialPoliticalProfile,
  PoliticalCensusLayer,
  PoliticalCensusSnapshot,
} from "@espanaia/shared-types";

function resolveApiBaseUrl() {
  return process.env.ESPANAIA_API_URL ?? process.env.NEXT_PUBLIC_ESPANAIA_API_URL;
}

async function fetchApiJson<TPayload>(pathname: string): Promise<TPayload | null> {
  noStore();
  const apiBaseUrl = resolveApiBaseUrl();

  if (!apiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(new URL(pathname, apiBaseUrl).toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as TPayload;
  } catch {
    return null;
  }
}

export async function getPoliticalCensusSnapshot() {
  return fetchApiJson<PoliticalCensusSnapshot & { storedAt?: string }>("/v1/political-census");
}

export async function getPoliticalCensusProfile(slug: string) {
  return fetchApiJson<{
    generatedAt: string;
    storedAt?: string;
    profile: OfficialPoliticalProfile;
    layers: PoliticalCensusLayer[];
  }>(`/v1/political-census/${slug}`);
}
