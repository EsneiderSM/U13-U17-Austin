# P10 · Front-end assets on supported tools

## Toolchain (AustinOpera_v13/AustinOpera_v13/package.json)
- `node-sass ^7.0.3` (deprecated, needs Node 16 native bindings) replaced by `sass ^1.83.0` (dart-sass).
- `sass-loader 12.6.0` -> `^16.0.4` (uses the modern Sass API, picks up `sass` automatically; no config change needed).
- `engines.node` `^16.13.2` -> `>=22.12.0` (Node 22 LTS); `.nvmrc` added with `22`.
- `package-lock.json` was NOT regenerated (no npm in the migration tool): run `npm install` once on Node 22 and commit the new lock file, then `npm ci` works.

## SCSS
No hard dart-sass errors were found by inspection. Expect deprecation **warnings** (not errors) for:
- slash division (`$a / 2`) in functions.scss, +layout.scss, +helpers.scss, +button-base.scss, _icon-btns.scss,
  _button-list.scss, _show-hide-password.scss, @column-width.scss -> later `math.div` (check `$responsive-variable` types first);
- `@import` (whole tree, incl. nested imports in tnew/tnew.scss) -> later `@use`/`@forward`;
- global built-ins (`type-of`, `unitless`, `map-get`, `abs`) and `!global` on undeclared variables (@responsive-context.scss).
These were left unchanged to keep the compiled CSS identical.

## Former Smidge bundles (Views/Master.cshtml)
Option chosen: keep the ordered `<link>` / `<script>` tags (same 9 CSS + 13 JS, same order) and add
`asp-append-version="true"` for cache busting. The URLs are now app-relative (`~/css/...`, `~/scripts/...`)
instead of `scheme://host/...` because the version tag helper ignores absolute URLs; the origin is the same.
The webpack outputs (`/Static/dist/main.css`, `tnew.css`, `global.js`) also get `asp-append-version`.
The generated theme CSS (`Model.GetThemePath()`) stays a separate link, outside the build.
The vendor scripts were not moved into webpack: they rely on globals (lazysizes, PhotoSwipe, Flickity,
aspnet-validation) used by ig-app.js / custom.js, and bundling them would change load semantics.

## Review findings (2026-11-12)
- `npm install` on Node 24 (engines `>=22.12` satisfied) resolved `sass 1.108.2`; the new `package-lock.json` has no `node-sass`.
  `npm run build` finished with 0 errors and 31 Sass deprecation warnings (expected).
- Compiled output against the committed `wwwroot/Static/dist` (node-sass):
  - `global.js`, `main.js`, `tnew.js`: byte-identical.
  - `tnew.css`: same 596 declarations in the same order; differences are only formatting (quotes, `.5rem` -> `0.5rem`, `@extend` selector order).
  - `main.css`: same 356 declarations. Two real changes from dart-sass:
    1. The `dark-theme` mixin emits `.light-color X, .dark-bg.light-color X`; dart-sass drops the second selector as redundant.
       Visible effect only on an **invalid** form field inside an element with both `dark-bg` and `light-color`:
       the error border (`--error`) now wins over the light border (before, the higher specificity hid the error colour).
    2. Declarations written after a nested rule (`outline: none` in `@mixin focus`) are emitted as a separate rule after it;
       different property, no cascade change.
- The recompiled `main.css` / `tnew.css` and the new lock file were copied into the working copy.
- Site run (P10 build, database copy): every `<link>`/`<script>` of the former bundles and of `Static/dist` carries `?v=<hash>` and
  returns 200; the HTML of the 21 snapshot pages differs from `html-u17/` only in those asset tags, the sitemap `lastmod`
  of the republished Theme node and the login page change (C5). No errors in the log.
- `css/custom.css` and `scripts/custom.js` are empty files (already empty on 13).
- Not checked here (needs a browser): console errors, sliders, PhotoSwipe, lazy loading, client-side validation.
- Browser check found `umbracoforms.min.js: window.umbracoFormsValidationService.validateForm is not a function` on the form pages.
  Cause: Umbraco Forms 17 loads its own `aspnet-validation.min.js` in `<head>` (via `RenderUmbracoFormDependencies`), and the
  former JS bundle loaded the site's Forms 13-era copy (`scripts/lib/forms/aspnet-validation/`, no `validateForm`) at the end of
  `<body>`, overwriting `window.aspnetValidation`. No site code uses that library, so the tag was removed from `Master.cshtml`.
  This came with the Forms 17 upgrade (P8/P9), not from P10; the P9 tests posted the forms server-side and did not run the client script.
