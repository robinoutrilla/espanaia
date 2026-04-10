import Link from "next/link";
import { SiteHeader } from "../components/site-header";

export default function NotFound() {
  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader />
      <section className="panel detail-hero">
        <div className="detail-copy">
          <span className="eyebrow">Señal perdida</span>
          <h1 className="detail-title">No hemos encontrado esa entidad.</h1>
          <p className="detail-description">
            La ruta existe en el producto, pero esta ficha concreta todavía no forma parte del radar seed cargado.
          </p>
          <div className="hero-actions">
            <Link className="hero-button hero-button-primary" href="/">
              Volver al radar
            </Link>
            <Link className="hero-button hero-button-secondary" href="/territories">
              Abrir territorios
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
