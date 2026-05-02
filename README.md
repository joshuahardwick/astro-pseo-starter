# astro-pseo-starter

A starter template for building programmatic SEO sites with Astro. Designed to be used with Claude Code and the accompanying workspace `CLAUDE.md` instructions, but works as a standalone starting point too.

## What's included

- **Astro** — static site generation, file-based routing
- **Tailwind CSS v4** — CSS-first config via `@tailwindcss/vite`
- **DaisyUI v5** — component classes, added via `@plugin "daisyui"` in global.css
- **Supabase JS client** — pre-configured in `src/lib/supabase.ts`
- **`fetchAllPages()` helper** — handles Supabase's 1000-row pagination cap automatically
- **`@astrojs/sitemap`** — pre-configured, reads `PUBLIC_SITE_URL` at build time
- **Standard folder structure** — components, layouts, lib, pages, styles

## Folder structure

```
/src
  /components     # Reusable UI components
  /layouts        # Layout.astro — base HTML shell with head, canonical, meta
  /lib            # supabase.ts, utils.ts (fetchAllPages, toSlug)
  /pages          # File-based routes only
  /styles         # global.css — Tailwind + DaisyUI imports
/public           # Static assets
```

## Environment variables

Copy `.env.example` to `.env` and fill in your values:

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
PUBLIC_SITE_URL=
```

`PUBLIC_SITE_URL` is required at build time for the sitemap. If it's missing or still a placeholder when you deploy, Cloudflare Pages will throw a clear error rather than silently deploying a broken sitemap.

## Supabase types

Once your tables are created, you can generate TypeScript types from your schema so every query is fully typed.

If you're using the Claude Code workflow, this is handled automatically once your schema is set up. If working manually, run:

```bash
supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts
```

Then uncomment the typed client lines at the bottom of `src/lib/supabase.ts`.

## Key pattern: bulk data fetching

All data fetching for dynamic routes must happen in `getStaticPaths`, not the component body. A site with thousands of pages making individual API calls at render time will time out on Cloudflare's 20-minute build limit.

Use `fetchAllPages()` to bulk-fetch all rows once, then pass data to each page via props:

```ts
export async function getStaticPaths() {
  const rows = await fetchAllPages((from, to) =>
    supabase.from('my_table').select('*').range(from, to)
  );
  return rows.map(row => ({
    params: { slug: row.slug },
    props: { row },
  }));
}
```

## Deploying to Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Add these environment variables in Cloudflare Pages (Settings → Environment variables):
  - `PUBLIC_SITE_URL` — your live domain, e.g. `https://yoursite.com`
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`

The sitemap outputs `sitemap-index.xml` (the index) and `sitemap-0.xml` (the pages). Your `robots.txt` points at the index — Google follows it and discovers all individual sitemap files automatically.

## Using with Claude Code

This template is designed to be used with a `CLAUDE.md` workspace config that instructs Claude Code how to scaffold new projects, handle Supabase setup, generate types, and follow pSEO build patterns. The Claude Code workflow handles the full setup automatically — just say "set up a new site" and it takes care of the rest.
