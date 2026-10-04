# Airreload documentation

The Airreload documentation site, built with Next.js, Fumadocs, and MDX. Product documentation lives at `/docs`; the homepage is maintained separately in `app/(home)`.

## Develop

Use Node.js 22 or newer and npm:

```sh
npm ci
npm run dev
```

Open [localhost:3000/docs](http://localhost:3000/docs).

## Check and build

```sh
npm run lint
npm run types:check
npm run build
npm start
```

GitHub Actions runs lint, type checking, and a production build. Use the committed lockfile for reproducible dependencies. The site can run on a Next.js-compatible Node host using `npm run build` and `npm start`. No deployment destination or public domain is assumed. Set `SITE_URL` to your chosen public origin before building for deployment so docs social-image URLs use the correct domain (local default: `http://localhost:3000`). Search and Markdown negotiation use server routes; this configuration is not a plain static export.

## Edit the docs

- `content/docs/`: user-facing MDX pages and `meta.json` navigation order.
- `lib/source.ts`: Fumadocs MDX collection, page tree, and Markdown export.
- `lib/layout.shared.tsx`: docs branding and navigation links.
- `components/mdx.tsx`: shared MDX components, including cards, callouts, tabs, steps, and accordions.
- `app/docs/[[...slug]]/page.tsx`: page rendering, metadata, and static parameters.
- `app/api/search/route.ts`: local Orama search index; no external search account needed.
- `app/llms.txt`, `app/llms-full.txt`, `app/llms.mdx`: machine-readable docs.
- `proxy.ts`: Markdown content negotiation and `.md` URL support.

Add an MDX page with `title`, `description`, and an optional Lucide `icon` in its frontmatter, then add it to its folder's `meta.json`. Use `/docs/...` links for navigation. Keep heading anchors stable when other pages link to them. The framework automatically includes pages in search, the page tree, and Markdown exports.

## Documentation structure

The sidebar has five pages: Why Airreload?, Getting started, Everyday development, CLI reference, and Troubleshooting. Getting started contains the full install-to-hot-reload flow. Platform-specific commands use tabs; optional reference details and troubleshooting answers use Fumadocs accordions. The existing visual components and styles are maintained separately from this content.

Older standalone guide URLs redirect in `next.config.mjs` to their consolidated sections. Preserve these redirects when reorganizing content.

## Content sources and release maintenance

The initial content was checked on October 3, 2026 against:

- [Airreload CLI v0.3.0-beta.6](https://github.com/Airreload/cli/tree/v0.3.0-beta.6): command definitions in `lib/src/cli.dart`, workflow in `run_workflow.dart`, SDK list/selection in `flutter_sdk.dart`, project preparation in `instrumentation.dart`, and updater behavior in `update.dart`.
- [Airreload Go v1.1.0-beta.4](https://github.com/Airreload/airreload-go/tree/v1.1.0-beta.4): README and published release.
- [Airreload installer](https://github.com/Airreload/installer): install/uninstall scripts and the published `versions.env` manifest.

When releasing product changes, review Getting started, Everyday development, CLI reference, and Troubleshooting together. Keep optional details in accordions and the initial setup flow short. Verify commands against the implementation and current release manifest: older READMEs may lag behavior (for example, Windows automatic updates arrived after CLI beta.4). Keep preview status and unsupported platforms explicit. Do not describe the docs-site build as device acceptance testing of Airreload.

GitHub source links assume the published docs branch will be `main`; adjust `lib/shared.ts` if a different default branch is chosen.
