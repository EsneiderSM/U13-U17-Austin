# P8: every page rendering on Umbraco 17

Working copy: `C:\Projects\sandbox\AustingU13\U13-u17` (branch `upgrade/umbraco-17`). Database copy: **AustinOpera_U13_Stage_u17**.

## What changed
| File | Change |
|---|---|
| `umbraco/models/*.generated.cs` (127 files) | Regenerated with the Umbraco 17.8.1 Models Builder (same generator as Settings › Models Builder), through a one-off startup hook. All 127 files now carry `17.8.1+89c87c2`; none of the v13 output is left. New property found: `Page.UnlinkInNavigation`. |
| `AustinOpera_v13.csproj` | Removed `<Compile Remove="umbraco\models\**" />`. `RazorCompileOnBuild`/`RazorCompileOnPublish` = **true** (Umbraco 17 has no runtime Razor compilation; this caused the P7 "No physical template file" 404s). |
| `Views/Partials/widgets/Grid/ColumnUmbracoForm.cshtml` | `Umbraco.RenderMacroAsync("renderUmbracoForm", …)` stubbed: it now outputs an HTML comment. **P9.S1 replaces it.** |
| `Views/Partials/widgets/Grid/ColumnPod.cshtml` | `content.Image?.Url()`: NullReferenceException on pods with no image (Component Library page). |
| `Views/Post.cshtml`, `Partials/widgets/Grid.cshtml`, `Text.cshtml` (2×), `Grid/ColumnSlider.cshtml`, `Grid/ColumnSubGrid.cshtml`, `Partials/Shared/Footer.cshtml`, `NavigationGrid.cshtml` | `columnWidth`: on 17 an empty dropdown returns `""` (v13 returned null), which rendered `class="col- "`. Added `.NullOrWhiteSpaceAsNull()` so the `"100"` fallback applies again. |
| `Controllers/SiteSearchController.cs` | `Name("")`/`Value(alias, "")` no longer fall back to the invariant value on 17, so every search result had an empty title and description. The culture is now passed as null on invariant sites. |
| `Views/Post.cshtml` | JSON-LD `dateModified` = ISO 8601 UTC with `Z` (e.g. `2025-01-10T20:47:04Z`). |
| `Views/Sitemap.cshtml` | No change: it already writes `{0:s}+00:00`, and system dates are UTC on 17. |
| `Composers/TempModelsGenerationComposer.cs`, `Controllers/P8DiagController.cs` | Temporary helpers, now emptied (comment only). **Delete them:** `git rm` both files. |

## Evidence
- `dotnet build`: 0 errors, 201 warnings (nullable/obsolete warnings from the now-compiled views, e.g. `IPublishedContent.Children` obsolete in 18).
- `P8-pages.tsv`: every published node with its URL, document type and HTTP status. All 84 nodes with a template returned 200 (after the ColumnPod fix). The settings/people/person nodes have no template.
- `html-u17/`: rendered HTML of one page per document type, plus home, about, education, contact-us, login, tnew, search, sitemap, the 404 page and the search API, all captured on 17. The absolute URLs contain the loopback port of the test run.
- Sitemap (`/?altTemplate=Sitemap`): 83 `<url>` entries. Every `<lastmod>` ends in `+00:00` (Razor writes `&#x2B;00:00`, as on v13, which XML reads as `+`). `/sitemap.xml` is 404, as it already was on v13 (P1 notes).
- Theme CSS: `wwwroot/css/generated-themes/ig-theme-aQ2cVAZ16kWZSEBMxWdMjg.css` regenerated through `IThemeCssService` on 17. A second regeneration is byte-identical. **The first regeneration changed the committed file**: review it with `git diff`.

## Not done here (manual)
- HTML diff against `docs/migration/html-baseline/`: that folder was never created (P3.S1), so `html-u17/` is the first full snapshot.
- Screenshot comparison with the stage baseline (`baseline/` in the job workspace).
- Publishing the Theme node from the backoffice to check the ContentPublishedNotification handler.

## Review findings (applied before accepting P8)

- **Column widths (regression, reverted).** The views map an empty `columnWidth` to `col` on purpose (an auto column that
  shares the row: `.col, .col- { flex-grow: 1; flex-basis: 0 }`). The added `.NullOrWhiteSpaceAsNull()` turned `""` into
  the `"100"` fallback, so those columns rendered `col-100` and stacked at full width on every page. Umbraco 17 returns
  `""` for an empty dropdown, the same as 13, so the change was removed from the 7 views.
- **Theme CSS (restored).** `ig-theme-aQ2cVAZ16kWZSEBMxWdMjg.css` is restored to the committed file, which is byte-identical
  to the file the stage site serves today. The Theme node values in the database differ from it in 9 properties
  (pre-existing on 13). Decision: keep the current look (option a) and align the Theme node values with the file, so a
  later publish of Theme regenerates the same CSS. Until then, **do not publish the Theme node**.
- **HTML comparison with Umbraco 13.** 25 pages captured from the same database on 13 (after P5) were compared
  structurally with 17. Remaining differences are expected: Umbraco Forms 17 script tags (no promise polyfill, lowercase
  `assets` paths with `?v=`), `application/ld&#x2B;json` (the encoding .NET 10 uses for `+`, read identically by browsers),
  the Forms 17 markup of the two form pages (P9), and Umbraco's own text on the built-in 404 template.
- `html-u17/` was recaptured after these fixes (same file names, host `localhost:5517`).
