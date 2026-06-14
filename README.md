# Landbruck — Sistema E-Commerce

Tienda Shopify de semillas con inventario local SQL Server, sincronización en nube (Supabase), despacho Starken y panel administrador Next.js.

## Estructura

```
landbruck/
  api/              → Backend Express (Node.js)
  admin-panel/      → Frontend Next.js (panel admin)
  .env.example      → Variables de entorno
```

## Setup rápido

### 1. Clonar y configurar variables
```bash
cp .env.example api/.env
# Editar api/.env con tus credenciales
```

### 2. Instalar dependencias
```bash
cd api && npm install
cd ../admin-panel && npm install
```

### 3. Crear base de datos en SQL Server
```bash
cd api && npm run migrate
```

### 4. Levantar el proyecto
```bash
# Terminal 1 — API
cd api && npm run dev

# Terminal 2 — Panel admin
cd admin-panel && npm run dev
```

API:          http://localhost:3001
Panel admin:  http://localhost:3000

## Variables de entorno requeridas

Ver `.env.example` para la lista completa.

## Orden de desarrollo

- [x] Fase 1 — API y DB (estructura base)
- [ ] Fase 2 — Panel admin (inventario, alta de producto)
- [ ] Fase 3 — Shopify (publicación y webhooks)
- [ ] Fase 4 — Starken + Supabase (fulfillment)
- [ ] Fase 5 — Dashboard y reportes
