# Nanditha C P — Portfolio

Next.js 15 + Payload CMS 3 + Three.js scroll animation portfolio.

## Quick Start

```bash
npm install
npm run dev
```

- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

### Seed Data

```bash
npm run seed
```

Creates admin user (`admin@nandithacp.com` / `changeme123`) and sample case studies.

### Required Assets

**GLB Model**: Place `Sprint.glb` in `public/` for the scroll animation.

**Fonts** in `public/fonts/`:
- `HaasGrotDispTrial-65Medium.woff2`, `HaasGrotDispTrial-75Bold.woff2`
- `SFProText-Regular.woff2`, `SFProText-Medium.woff2`, `SFProText-Semibold.woff2`

## Cloudflare Deployment

```bash
wrangler d1 create nanditha-portfolio-db
wrangler r2 bucket create nanditha-portfolio-media
# Update wrangler.toml with database_id
wrangler secret put PAYLOAD_SECRET
npm run build && wrangler deploy
```

Configure R2 credentials in `.env` for media storage.
