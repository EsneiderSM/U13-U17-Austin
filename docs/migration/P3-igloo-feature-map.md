# P3 · Igloo runtime feature map (LittleNorth.Igloo.Core 13.1.5 → site code)

Source: the decompiled `LittleNorth.Igloo.Core` 13.1.5 in the job workspace (`reference/igloo-core-13.1.5-decompiled/`).
`LittleNorth.Igloo` 13.1.5 itself only ships `Igloo.Nuget.dll` (build glue: views, assets, `igloo/package*.xml`). All runtime
behaviour is in Igloo.Core. Paths below are relative to `AustinOpera_v13/AustinOpera_v13/`.

Decisions: **replace** = re-implemented as site code (file given); **drop** = not needed once the package is removed (P4);
**core** = already covered by Umbraco; **P4/P5** = backoffice feature, out of P3 scope, with the phase that handles it.

## Composers and DI registrations

| Igloo feature | What it does | Decision | Site file |
|---|---|---|---|
| `Igloo.Core.Services.Composer` → `ISettingsService` (singleton) | Site settings lookup | replace | `Services/SiteSettingsService.cs`, registered in `Composers/SiteComposer.cs` |
| `Igloo.Core.IglooConfig.Composer` → `IIglooConfig` | Reads/writes `igloo/Igloo.config` (search doc types + fields) | replace | Values inlined in `Controllers/SiteSearchController.cs` (`DocumentTypes`, `Fields`) |
| `IglooComposer` → `IThemeService` | Theme CSS generation | replace | `Services/ThemeCssService.cs` |
| `IglooComposer` → `SetContentLastChanceFinder<Igloo404ContentFinder>` | 404 page from settings | replace | `Routing/SiteNotFoundContentFinder.cs`, set in `Program.cs` after `AddComposers()` |
| `IglooComposer` → `ILicenseCheckService`, `IIglooLicenseService`, `LicenseCheckBackgroundService` (hosted service) | Igloo licence check against LittleNorth's API, token in `igloo/Igloo.token` | drop (P4) | none |
| `IglooComposer` → `ContentPublishedNotification` → `IglooPublishedNotification` | (a) theme node published → regenerate theme CSS; (b) child of websiteSettings published → licence check + clear `Setting_*` cache | replace (a); drop (b) | (a) `NotificationHandlers/ThemeCssNotificationHandlers.cs` (`ThemeCssPublishedHandler`); (b) the site service does not cache, so there is nothing to clear |
| `IglooComposer` → 11 × `MigrationPlansExecutedNotification` handlers (`IglooPostMigrationNotificationHandler6`–`16`) + `IglooPackageMigrationPlan` (`IglooPackageMigration1`–`16`) | Package migrations: import `igloo/package*.xml` (doc types, data types, views, content) | drop (P4) | none. The content model is already in the DB. The `Umbraco.Core.Upgrader.State+Igloo` key stays (ADR-001) |
| `Igloo.Core.Dashboard.IglooDashboard` (settings section) | Licence key dashboard (`App_Plugins/IglooDashboard`) | drop (P4) | none |

There are no IComponent, UrlProvider, view component, tag helper, middleware, Examine index customisation or scheduled job in Igloo.Core 13.1.5.

## Controllers and endpoints

| Igloo controller / route | Used by | Decision | Site file / new route |
|---|---|---|---|
| `IglooMemberController.Login` (SurfaceController, prefix `loginModel`) | `Partials/Shared/LoginForm.cshtml` | replace | `Controllers/SiteMemberController.cs` (`Login`) |
| `IglooMemberController.HandleRegisterMember` (prefix `registerModel`) | `Partials/widgets/Register.cshtml` | replace | `Controllers/SiteMemberController.cs` (`HandleRegisterMember`) |
| `IglooMemberLogoutController` `GET /logout` | Navigation links in content | replace (same route) | `Controllers/SiteMemberLogoutController.cs`; Igloo's controller is excluded from MVC by `SiteComposer` until P4 |
| `IglooContactFormController.HandleContactForm` `POST /umbraco/api/igloocontactform/handlecontactform` | `Partials/widgets/ContactForm.cshtml` + `scripts/ig-app.js` | replace | `Controllers/ContactFormController.cs`, `POST /umbraco/api/sitecontactform/handlecontactform` |
| `IglooNewsletterController.AddMailchimpMember` / `AddCampaignMonitorMember` | `Partials/widgets/Newsletter.cshtml` + `ig-app.js` | replace | `Controllers/NewsletterController.cs`, `POST /umbraco/api/sitenewsletter/addmailchimpmember` and `/addcampaignmonitormember` |
| `IglooSearchController.Search` `GET /umbraco/api/igloosearch/search` | `scripts/ig-app.js` (search modal + Search page) | replace | `Controllers/SiteSearchController.cs`, `GET /umbraco/api/sitesearch/search` (ig-app.js updated) |
| `IglooThemeExplorerController.Save` `POST /umbraco/backoffice/Igloo/IglooThemeExplorer/Save` | `scripts/lib/theme-explorer.js` (Theme Explorer, shown when `showThemeExplorer` is set or in preview) | P4: drop, or replace at the same route once the package is gone | none yet. `Partials/Shared/ThemeExplorer.cshtml` now reads settings from the site service. Only its Save button depends on Igloo |
| `IglooGetThemeColorsController.Get` `GET /umbraco/backoffice/igloo/IglooGetThemeColors/Get` | `App_Plugins/IglooApprovedColorPicker` (backoffice editor) | P4 (same route, site-owned UmbracoAuthorizedApiController) then P5 (editor replaced) | none yet. **P4 must add it** or the approved colour picker breaks between P4 and P5 |
| `IglooApiController` `GetLicenseKey` / `SetLicenseKey` / `SetLicenseToken` | `App_Plugins/IglooDashboard` | drop (P4) | none |

## Services, extensions, models used by the views

| Igloo API | Exact behaviour (13.1.5) | Decision | Site file |
|---|---|---|---|
| `ISettingsService.Get<T>(content, alias, culture = null, defaultValue = default)` | site = `content.Root()`; first child of type `websiteSettings`; its first child **that has a property `alias`**; `Value<T>(alias, culture, Fallback.ToDefaultValue, defaultValue)`; any exception → `defaultValue`. Cached per alias+site+culture in the runtime cache (the key ignored `T` and `defaultValue`) until a websiteSettings child was published | replace (same signature and parameter names) | `Services/SiteSettingsService.cs`. Without the cache: the lookup is a walk over a handful of published nodes and is always fresh |
| `PublishedContentExtensions.GetThemePath()` | `/css/generated-themes/ig-theme-{GetShortId(theme.Key)}.css?v={theme.UpdateDate:ddMMyyyyHHmm}`; theme = `websiteSettings` child of type `theme`; `""` if missing | replace | `Extensions/SiteContentExtensions.cs` |
| `GetThemeNode()`, `GetCulture()`, `GetFlag()`, `ImageCropCalculation()`, `GuidExtensions.GetShortId()` | as named (flags: `/ig-assets/flags/{region}.svg`; crop: width capped at 2000, height scaled with ceiling) | replace | `Extensions/SiteContentExtensions.cs` |
| `WidgetExtension.RenderWidget(html, BlockListItem, WidgetIndex = 1)` | ViewData `order` + `errors` (validation summary), partial `~/Views/Partials/Widgets/{alias}.cshtml`. **Also called `BannerCheckService.BannerCheck`**: on hosts outside `dev-`, `stage-`, `localhost`, `azurewebsites.net`, `umbraco.io` and `cloudflare.com`, with no valid licence token, it wrote a banner from `Response.OnStarting`. That corrupts the chunked response and is the cause of the truncated bodies ("Invalid character in chunk size") seen in P1/P2 | replace (without the banner) | `Extensions/SiteWidgetExtensions.cs` |
| Theme CSS (`ThemeService`, `ColorHelper`, `StyleHelper`) | Template `wwwroot/css/ig-theme.css` with `{alias}` placeholders filled from the theme node; for hex values also `{aliasRGB}`, `{aliasDarker}` (10% to black), `{aliasLighter}` (5% to white); lines whose placeholder is empty are blanked; minified; written to `wwwroot/css/generated-themes/ig-theme-{shortKey}.css` | replace | `Services/ThemeCssService.cs` + `NotificationHandlers/ThemeCssNotificationHandlers.cs` (on publish of a `theme` node; also once per start, on the first request, if the file is missing or empty) |
| `Igloo.Core.Models.MemberLoginViewModel` | Username*, Password*, RedirectUrl, RememberMe | replace | `Models/MemberModels.cs` |
| `Igloo.Core.Controllers.MemberRegisterModel` | Email*, Password* (≤256), ConfirmPassword (Compare), Name, Username, UsernameIsEmail, MemberTypeAlias, RedirectUrl, MemberProperties | replace | `Models/MemberModels.cs` |
| `Igloo.Core.Models.ContactFormViewModel`, `NewsletterViewModel`, `IglooWebApiResponseModel`, `SearchResponse`/`SearchResult` | Request and response DTOs (JSON: `success`/`message`, `result`/`resultCount`) | replace | `Models/FormApiModels.cs` |
| `MailHelper` / `SendMail` | System.Net.Mail SmtpClient with Umbraco:CMS:Global:Smtp Host/Port/Username/Password (ignores `SecureSocketOptions`); From = Smtp.From; HTML from `wwwroot/ig-assets/ContactFormEmailTemplate.html` with `{Message}` `{Name}` `{Email}` `{SendDate}` | replace | `Controllers/ContactFormController.cs` (Umbraco `IEmailSender`, same settings, and it honours `SecureSocketOptions`; user input is HTML-encoded) |
| `Igloo.Core.Helpers.SettingsHelper` | Same lookup as the settings service (used by GetThemeColors) | core / replace | covered by `ISiteSettingsService.GetSettingsNode` |

## Behaviour notes and deliberate differences

- **Login:** Igloo's quirk is kept. A successful login *without* a RedirectUrl still adds "Invalid username or password" (the member is signed in anyway). The Login widget always posts a RedirectUrl.
- **Register:** no member group is assigned (Igloo assigned none). An empty MemberTypeAlias makes Umbraco use the default `Member` type. The member is signed in after registering.
- **Contact form:** errors while sending now return "Email Not Sent" and are logged (Igloo returned HTTP 500).
- **Newsletter:** the requests are identical to Igloo's. Mailchimp is called with `Authorization: Basic <raw api key>` (not base64), exactly as Igloo did. Check against the provider before go-live.
- **Search:** `ILocalizationService.GetAllLanguages()` is used for the single-language check. On Umbraco 17 switch to `ILanguageService.GetAllAsync()` (P6/P8).
- **404 finder / logout:** they use `UmbracoContext.Content.GetById/GetAtRoot` and `Domains.GetAll`. These are the APIs that change most on Umbraco 17 (P8).
- Igloo is still installed in P3. Its theme-publish handler also writes the same file on publish (same content). Its licence hosted service still runs. Both go with the package in P4.

## Theme CSS check (P3.S4)

The generator was run against the published Theme node of `AustinOpera_U13_Stage_u17` (key `549c0d69-7506-45ea-9948-404cc5674c8e` →
`ig-theme-aQ2cVAZ16kWZSEBMxWdMjg.css`). The output has exactly the same structure, order, minification and derived colours
(`--theme-rgb:7,138,89`, `--theme-darker:#067C50`, `--theme-alt-darker:#DAA417`), but **10 values differ** from the committed file.
The published Theme node holds `--heading-dark:#111`, `--text-dark:#444`, `--background-dark:#111`,
`--background-dark-lighter:#1C1C1C`, `--selected-nav-item:#078A59`, `--navigation-padding:30px`,
`--navigation-font-size:1rem` (desktop and ≤992px), `--navigation-font-weight:bold`, `--font-size-small:0.875rem`. The committed file has
`#000`, `#000`, `#000`, `#0C0C0C`, `#000`, `20px`, `1.625rem`/`1.325rem`, `normal`, `1rem`.
So the committed CSS was not generated from this database's published Theme node, or the local NuCache file is stale.
**Publishing the Theme node (with Igloo or with this code) would change the live look.** The committed file was restored unchanged.
