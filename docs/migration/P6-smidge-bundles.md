# P6 · Former Smidge bundles (input for P10)

Smidge is not part of Umbraco 14+. In P6 `Composers/SmidgeBundlesComposer.cs` was removed and
`Views/Master.cshtml` now emits one plain `<link>` / `<script>` tag per file, in the same order,
prefixed with `@contentSite` (scheme + host), as the Smidge loop did.

Note: in v13 (non-debug) Smidge served each bundle as one minified, concatenated request. Now each
file is a separate, unminified request. P10 can move these into the webpack build (`/Static/dist`)
or add `asp-append-version` cache busting.

## igloo-js-bundle (13 files, rendered at the end of `<body>`)

1. /scripts/lib/ls.respimg.min.js
2. /scripts/lib/ls.bgset.min.js
3. /scripts/lib/lazysizes.min.js
4. /scripts/lib/fluidvids.js
5. /scripts/lib/photoswipe.min.js
6. /scripts/lib/photoswipe-ui-default.min.js
7. /scripts/lib/flickity.pkgd.min.js
8. /scripts/lib/forms/promise-polyfill/polyfill.min.js
9. /scripts/lib/forms/aspnet-validation/aspnet-validation.min.js
10. /scripts/lib/intersection-observer.js
11. /scripts/lib/axios.min.js
12. /scripts/ig-app.js
13. /scripts/custom.js

## igloo-css-bundle (9 files, rendered in `<head>` before the theme CSS and /Static/dist/main.css)

1. /css/lib/reset.css
2. /css/ig-theme.defaults.css
3. /css/lib/font-awesome.css
4. /css/lib/photoswipe.css
5. /css/ig-base.css
6. /css/ig-header.css
7. /css/ig-footer.css
8. /css/ig-widgets.css
9. /css/custom.css
