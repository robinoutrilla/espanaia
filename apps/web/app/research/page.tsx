import { SiteHeader } from "../../components/site-header";
import { ResearchLayout } from "../../components/research-layout";

export const dynamic = "force-dynamic";

export default function ResearchPage() {
  return (
    <main className="page-shell research-page">
      <SiteHeader currentSection="research" />
      <ResearchLayout />
    </main>
  );
}
