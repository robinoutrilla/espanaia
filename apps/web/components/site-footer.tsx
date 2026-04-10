interface SiteFooterProps {
  sources?: string;
  extra?: string;
}

export function SiteFooter({ sources, extra }: SiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="page-footer">
      <div>
        <p className="page-footer-brand">IAP{"Ñ"}.com</p>
        <p className="page-footer-sub">Inteligencia Abierta para Espa{"ñ"}a</p>
        <p className="page-footer-copy">&copy; {year} IAPN &middot; Datos abiertos &middot; Sin cookies de terceros</p>
      </div>
      {(sources || extra) && (
        <div>
          {sources && <p className="page-footer-sources">Fuentes: {sources}</p>}
          {extra && <p className="page-footer-sources" style={{ marginTop: 4 }}>{extra}</p>}
        </div>
      )}
    </footer>
  );
}
