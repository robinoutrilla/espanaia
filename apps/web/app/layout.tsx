import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "../lib/i18n/context";

export const metadata: Metadata = {
  title: "EspañaIA",
  description:
    "Inteligencia política y presupuestaria de España: BOE, Congreso, Senado, presupuestos territoriales y fuentes europeas en una superficie de decisión navegable.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EspañaIA",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://cdn.amcharts.com" />
        <link rel="dns-prefetch" href="https://cdn.amcharts.com" />
      </head>
      <body><LangProvider>{children}</LangProvider></body>
    </html>
  );
}
