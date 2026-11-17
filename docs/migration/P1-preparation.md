# P1 – Preparation record (Austin Opera, Umbraco 13.0.0 → 17.8.1)

Status: **partially completed by the agent; the items marked OPEN need a person.**
Working copy: branch `upgrade/umbraco-17`, DB copy `AustinOpera_U13_Stage_u17`.

## 1. Decision record – vendor and licence questions (OPEN, need answers)

| # | Question | Answer | Source / date |
|---|----------|--------|---------------|
| Q1 | Igloo 17.4.2: what replaces Igloo.Core (`ISettingsService`, `Igloo.Core.Controllers` surface controllers for contact/newsletter/register/login, `Igloo.Core.Extensions`, `Igloo.Core.Models`)? Igloo.Core latest is 13.4.1 and is pinned to Umbraco 13. | OPEN | LittleNorth |
| Q2 | Do the property editor aliases `BBB.ButtonPicker`, `ColorValue`, `IglooMeasurmentValue`, `IglooApprovedColorPicker`, `IconPicker` exist in Igloo 17 with new-backoffice (Lit) UIs? | OPEN | LittleNorth |
| Q3 | Do the Igloo document type / element type aliases stay the same in 17 (so the ~119 doc types and generated models stay valid)? | OPEN | LittleNorth |
| Q4 | Do `igloo/Igloo.key` and `Igloo.token` licence the site on v17? | OPEN | LittleNorth |
| L1 | Igloo 17 licence valid for production + stage domains | OPEN | LittleNorth |
| L2 | Does `umbraco/Licenses/umbracoForms.lic` cover Umbraco Forms 17? | OPEN | Umbraco HQ / account portal |
| U1 | Is a direct DB upgrade from latest 13.x to 17.8.1 supported? (check the 14/15/16/17 upgrade notes: minimum source version, UTC system-date migration in 17, TinyMCE→Tiptap) | OPEN – plan assumes yes | docs.umbraco.com › Upgrading › Version specific |
| D1 | Does anything consume the Delivery API? (`AddDeliveryApi()` is registered in Program.cs) | OPEN | Client |

If U1 is "no", switch the strategy to stepwise before P3.

## 2. Run of the unchanged U13 site against the DB copy (agent, 2026-11-11)

- `dotnet build`: OK, 0 errors, 26 warnings.
- `/umbraco` → 302 to `/umbraco/login`, 200, title "Umbraco". **Backoffice loads.**
- `/`, `/about/`, `/education/` → status **200 but the body is truncated** ("Invalid character in chunk size"): the response is aborted mid-render. The Serilog error log is empty. This probably has the same cause as the stage homepage timing out at 60 s. Suspects: an Igloo licence or remote call, Azure Blob media/ImageSharp-cache access from the local machine, or Smidge bundles. **Investigate before P3**, because this is the baseline that the upgraded site will be compared against. Check the umbraco/Logs JSON file and run the site in Visual Studio with first-chance exceptions enabled.
- `/sitemap.xml`, `/sitemap/`, `/search` and `/search-results/` → 404. These are guessed URLs. Look up the real URLs of the Sitemap and Search nodes in the backoffice.

## 3. Adage customisations in the views (preliminary, found by code search; the diff against clean Igloo 13.1.5 is still OPEN)

Custom C#: `Helpers/HtmlHelperExtensions.cs` (`AdageHtmlHelper`: GetAltText, GetAbsoluteUrl, GetAbsoluteUrlFromString, GetCssFocalPoint), `Composers/SmidgeBundlesComposer.cs`.

Views that use AdageHtmlHelper or the `contentSite` absolute-URL pattern (Adage-specific):
- Views/Master.cshtml (contentSite, TNEW css switch for `TnewTemplatePage`)
- Views/TnewTemplatePage.cshtml (whole template is Adage)
- Partials/Shared/Header.cshtml (contentSite)
- Partials/widgets/Gallery.cshtml, Hero.cshtml (GetCssFocalPoint), ImageWidget.cshtml, LatestFromFeed.cshtml, Logos.cshtml, TextAndImages.cshtml
- Partials/widgets/Grid/ColumnCard.cshtml, ColumnImage.cshtml, ColumnNavigation.cshtml, ColumnPerson.cshtml, ColumnPod.cshtml, ColumnPriceTable.cshtml, ColumnQuote.cshtml
- Partials/widgets/Footer/FooterLogos.cshtml, FooterNavigation.cshtml
- Login button colour change (commit 7c2b778, AUSTINAC26-7). Find the changed file(s) with `git show 7c2b778 --stat`.

Views that depend on Igloo.Core (they must be reconciled against Igloo 17 in P6): Master, Post, Search, Partials/Shared/{CookieConsent, Footer, Header, LoginForm, Meta, Navigation, SubHeader, ThemeExplorer}, Partials/widgets/{ContactForm, Gallery, GlobalContentPicker, InstagramFeed, Login, Map, Newsletter, Register, RenderWidgets, Slider, Tabs}, Partials/widgets/Grid/ColumnCard.

Macro usage in code: Partials/widgets/Grid/ColumnUmbracoForm.cshtml (`renderUmbracoForm` macro), Partials/grid/editors/macro.cshtml, MacroPartials/UmbracoLogin.cshtml. The DB has 2 macros.

## 4. Macros in content (OPEN – read-only SQL on the DB copy)

```sql
SELECT n.id, n.text, pt.Alias
FROM umbracoPropertyData pd
JOIN umbracoContentVersion cv ON cv.id = pd.versionId AND cv.[current] = 1
JOIN umbracoNode n ON n.id = cv.nodeId
JOIN cmsPropertyType pt ON pt.id = pd.propertyTypeId
WHERE pd.textValue LIKE '%<?UMBRACO_MACRO%' OR pd.textValue LIKE '%umb-rte-macro%';
```
Also list the forms in Backoffice › Forms, plus any custom workflows or field types. No custom Forms C# was found in the solution.

## 5. Baseline (OPEN – extend)
Existing captures (job workspace `baseline/`): /about/, /about/mission-vision-values/, /education/, /education/learning-for-schools-educators/ (desktop + mobile). Still to capture: the homepage (fix the timeout first), a Post, Search results, the Sitemap XML, a page with an Umbraco Form, the Login/Register widgets, a Gallery/Slider page and the TNEW template page. That gives at least 10 pages covering all 7 templates.

### Manual test scenarios (run on U13 now and on U17 after the upgrade)
1. Homepage renders fully; header, navigation, footer and cookie consent work.
2. Every Umbraco Form on the site: submit with valid data, the entry appears in Backoffice › Forms › Entries and the workflow email is sent; submit with invalid data and the validation messages show.
3. Igloo Contact form widget: submit and check the email arrives.
4. Newsletter widget signup: submit and check the success message and the provider/list.
5. Member register → login → visit a protected page → logout; a protected page redirects anonymous users to login.
6. Search: a known term returns results and paging works; an empty term behaves sensibly.
7. Sitemap XML is valid and `<lastmod>` is correct (dates move to UTC in v17).
8. 5 of the 61 Skybrud redirects (pick from Backoffice › Redirects) return 301 to the right target.
9. A blob-storage image with an ImageSharp crop renders and is cached.
10. TNEW template page renders with tnew.css.
11. Gallery and Slider: navigation and lightbox work on desktop and mobile.
12. Post page: JSON-LD dateModified is present and correct.
13. Backoffice: log in, edit and publish a page, upload media.
