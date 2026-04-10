# EspañaIA

EspañaIA ya funciona como una base real de producto para una plataforma de inteligencia política y presupuestaria sobre España. En esta iteración el proyecto cubre web futurista, API dedicada, esquema PostgreSQL inicial, conectores oficiales para BOE, BORME, Congreso y Senado, censo parlamentario unificado y una app de escritorio para macOS construida sobre la misma base.

## Qué incluye ya

- Monorepo con workspaces para `apps/*` y `packages/*`
- `apps/web` en Next.js con home command center, directorios y fichas de territorios, partidos y políticos
- `apps/api` en Fastify con endpoints públicos e ingestión manual
- `apps/desktop` para empaquetado desktop y `apps/macos-native` como shell nativa para macOS
- `packages/shared-types` con el modelo de dominio compartido
- `packages/seed-data` con seed data y helpers de consulta
- `packages/official-connectors` con conectores oficiales para BOE, BORME, Congreso y Senado
- `apps/api/db/schema.sql` con la primera base de datos PostgreSQL del producto
- Snapshots de ingestión persistidos en `data/ingestion/*` o en la carpeta local de usuario desde la app desktop

## Estructura

- `apps/web`: frontend principal del producto
- `apps/api`: API pública, endpoints de ingestión y almacenamiento de snapshots
- `apps/desktop`: empaquetado desktop del producto
- `apps/macos-native`: shell nativa en macOS con `WKWebView` y arranque coordinado de web + API
- `packages/shared-types`: contratos de dominio reutilizables
- `packages/seed-data`: dataset seed y funciones de acceso
- `packages/official-connectors`: clientes de BOE, BORME, Congreso y Senado con descubrimiento de feeds y normalización inicial
- `docs/architecture.md`: visión de arquitectura de la plataforma
- `data/ingestion`: snapshots descargados desde fuentes oficiales

## Arranque local

```bash
npm install
npm run dev:web
npm run dev:api
```

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Arranque como app macOS

```bash
npm run dev:desktop
```

La app desktop levanta su propio web server en `http://127.0.0.1:3310` y su propia API en `http://127.0.0.1:4310` para no interferir con tu entorno habitual.

## Empaquetado macOS

```bash
npm run package:desktop
```

Salida esperada:

- `apps/desktop/release/mac-arm64/EspañaIA.app`

Esta primera build se genera sin firma automática para que puedas abrirla localmente en desarrollo.

## Endpoints principales de la API

- `GET /health`
- `GET /v1/search?q=`
- `GET /v1/connectors`
- `GET /v1/territories`
- `GET /v1/territories/:slug`
- `GET /v1/parties`
- `GET /v1/parties/:slug`
- `GET /v1/politicians`
- `GET /v1/politicians/:slug`
- `GET /v1/political-census`
- `GET /v1/political-census/layers`
- `GET /v1/political-census/:slug`
- `GET /v1/boe/latest`
- `GET /v1/borme/sumario/:date`
- `GET /v1/datos-auxiliares/:dataset`
- `GET /v1/budgets/summary`
- `GET /v1/parliamentary-initiatives`
- `GET /v1/ingest/snapshots`
- `POST /v1/ingest/boe/run`
- `POST /v1/ingest/borme/run`
- `POST /v1/ingest/congreso/run`
- `POST /v1/ingest/senado/run`
- `POST /v1/ingest/political-census/run`

## Estado actual frente al blueprint

1. API dedicada y esquema PostgreSQL: base creada.
2. Conectores oficiales BOE/BORME/Congreso/Senado: primera versión operativa.
3. Censo parlamentario oficial: Congreso y Senado ya unificados en 616 perfiles oficiales.
4. Ingestión por capas: Congreso y Senado en vivo; autonómico y local preparados como siguientes capas.
5. Producto navegable: home, directorios y páginas de detalle conectadas entre sí.
6. App de escritorio macOS: creada y empaquetable.

## Próxima fase sugerida

1. Conectar PostgreSQL real a la API y sustituir parte del seed por persistencia viva.
2. Añadir workers de ingestión incremental y entity resolution.
3. Crear icono `.icns`, firma y notarización para una distribución macOS más pulida.
4. Incorporar alertas, búsqueda semántica y navegación documental más profunda.
