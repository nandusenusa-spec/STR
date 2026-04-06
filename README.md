# Comunidad

Next.js + Supabase (auth, datos) + Mercado Pago (checkout).

## Requisitos

- Node.js 20+ (recomendado)
- Cuenta Supabase y proyecto con las tablas / políticas que use la app
- (Opcional) Mercado Pago para pagos reales

## Arranque local

```bash
cp .env.example .env.local
```

Rellená `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y el resto según `.env.example`. No subas `.env.local` a Git (ya está ignorado).

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando      | Uso              |
|-------------|------------------|
| `npm run dev`   | Desarrollo       |
| `npm run build` | Build producción |
| `npm run start` | Servir build     |
| `npm run lint`  | ESLint           |

## Producción (resumen)

- En el host (p. ej. Vercel): mismas variables que en `.env.example`, con URLs del dominio real.
- `NEXT_PUBLIC_APP_URL` = URL pública del sitio.
- Webhooks de Mercado Pago apuntando al endpoint del deploy; `SUPABASE_SERVICE_ROLE_KEY` solo en servidor.

## Git y GitHub

Si el repo remoto aún no está vinculado:

```bash
git remote add origin https://github.com/TU_ORG/comunidad.git
git push -u origin main
```

(Reemplazá la URL por la de vuestro repositorio.)
