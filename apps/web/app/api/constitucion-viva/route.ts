import { buildConstitucionVivaData } from "../../../lib/constitucion-viva-data";
import type { ProfileType } from "../../../lib/constitucion-viva-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileParam = searchParams.get("profile") as ProfileType | null;

    const data = buildConstitucionVivaData();

    if (profileParam) {
      return Response.json({
        ...data,
        changes: data.changes.filter((c) =>
          c.affectedProfiles.includes(profileParam)
        ),
        debates: data.debates.filter((d) =>
          d.affectedProfiles.includes(profileParam)
        ),
        opportunities: data.opportunities.filter((o) =>
          o.eligibleProfiles.includes(profileParam)
        ),
        rights: data.rights.filter((r) =>
          r.affectedProfiles.includes(profileParam)
        ),
        notifications: data.notifications.filter((n) =>
          n.affectedProfiles.includes(profileParam)
        ),
      });
    }

    return Response.json(data);
  } catch (err) {
    console.error("Constitución Viva API error:", err);
    return Response.json(
      { error: "Error loading constitución viva data" },
      { status: 500 }
    );
  }
}
