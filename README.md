# PicksRecord

Tracker **privado** de picks deportivos entre amigos. No es casa de apuestas, no maneja dinero real ni predicciones — solo registra tus picks (ganados, perdidos, pendientes, push) y calcula tu rendimiento como si fuera un portafolio: P&L, ROI, win rate, racha y curva de equity.

Estética sports-analytics + fintech: dark mode, números en mono tabular, curva de equity animada.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **Framer Motion**
- **Neon** serverless Postgres (`@neondatabase/serverless`)
- Auth propia: **bcryptjs** (hashing) + **jose** (JWT en cookie httpOnly), protegida por `middleware.ts`

---

## Levantar el server (local)

### 1. Prerrequisitos
- Node.js 20+ (probado en 24)
- Una base de datos Postgres (este proyecto usa [Neon](https://neon.tech))

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de entorno
Crea `.env.local` en la raíz:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
AUTH_SECRET="<cadena-aleatoria-larga>"
```
Genera un `AUTH_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 4. Migrar la base de datos
Crea las tablas (`users`, `events`, `event_members`, `picks`). Es idempotente, puedes correrlo las veces que quieras:
```bash
npm run migrate
```

### 5. Arrancar en desarrollo
```bash
npm run dev
```
Abre **http://localhost:3000**.

### Otros comandos
```bash
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # linter
```

---

## Deploy

> ⚠️ **GitHub Pages no sirve para esta app.** GitHub Pages solo aloja sitios **estáticos**, y PicksRecord necesita un runtime de servidor para Server Actions, `middleware`, la conexión a Neon y las cookies de sesión. Exportarla como estática (`output: "export"`) rompería el login, el registro y todo el CRUD. Usa un host con Node.

### Opción recomendada: Vercel (deploy desde GitHub)

Vercel es de los creadores de Next.js y soporta todo el runtime sin configurar nada.

1. **Sube el repo a GitHub**
   ```bash
   git init
   git add .
   git commit -m "PicksRecord"
   git branch -M main
   git remote add origin git@github.com:TU_USUARIO/picksrecord.git
   git push -u origin main
   ```
   > `.env.local` está en `.gitignore` — tus credenciales **no** se suben.

2. **Importa el proyecto en Vercel**
   - Entra a [vercel.com/new](https://vercel.com/new) e importa el repo de GitHub.
   - Framework: *Next.js* (autodetectado). No cambies build/output.

3. **Configura las variables de entorno** en Vercel → *Settings → Environment Variables*:
   - `DATABASE_URL` → tu connection string de Neon
   - `AUTH_SECRET` → el mismo valor seguro que generaste

4. **Deploy.** Cada `git push` a `main` redeploya automáticamente. Las preview deployments salen por cada PR.

5. **Migración en prod:** corre la migración una vez apuntando a la DB de producción:
   ```bash
   DATABASE_URL="<url-de-prod>" node scripts/migrate.mjs
   ```

### Alternativas
Cualquier host con Node.js funciona igual (mismo `build`/`start` y mismas env vars): **Netlify**, **Railway**, **Render** o un VPS con `npm run build && npm run start` detrás de un reverse proxy.

### ¿Y si *obligatoriamente* tiene que ser GitHub Pages?
Tendrías que convertir esto en una app 100% estática (SPA), lo que implica **eliminar el backend**: nada de Server Actions ni `middleware`, mover la lógica a un backend/serverless aparte y exponer una API, y manejar auth/DB desde el cliente contra ese servicio. En la práctica es **reescribir la arquitectura**, no un deploy. Por eso la recomendación es Vercel.

---

## Estructura

```
src/
  app/
    (auth)/login, register      # pantallas de autenticación
    (app)/dashboard, events,    # rutas protegidas (con sidebar)
          picks, profile
    onboarding                  # wizard inicial
    actions/                    # server actions (auth, events, picks, profile)
    page.tsx                    # landing pública
  components/                   # UI, charts, motion, forms
  lib/
    schema.sql                  # esquema de la DB
    db.ts, queries.ts           # acceso a datos
    auth.ts, session.ts         # hashing + sesiones JWT
    odds.ts, stats.ts           # cálculos de profit, ROI, win rate, equity
  middleware.ts                 # protección de rutas
scripts/migrate.mjs             # aplica schema.sql
```

## Notas

- Las contraseñas se guardan **solo** como `password_hash` (bcrypt). Nunca se devuelven al cliente.
- Reglas de odds: americano `+150 → stake·odds/100`, `-120 → stake·100/|odds|`; decimal `2.50 → stake·(odds−1)`; push = 0; pending no afecta P&L ni win rate.
- `event_members` existe para compartir eventos a futuro; el MVP scopea todo al usuario dueño.
