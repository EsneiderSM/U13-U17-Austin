# P6 · Build state on .NET 10 / Umbraco 17.8.1

`dotnet restore` and `dotnet build` of AustinOpera_v13.sln: **0 errors, 11 warnings**.
The site was NOT started against the database copy (the 13 → 17 database upgrade is P7).

Packages: Umbraco.Cms 17.8.1, Umbraco.Forms 17.6.2, Skybrud.Umbraco.Redirects 17.0.5, uSync 17.6.2,
Umbraco.StorageProviders.AzureBlob / .ImageSharp 17.1.0. Microsoft.ICU.ICU4C.Runtime and the
AppLocalIcu option were removed.

Temporary measures (owned by later phases):
- `<Compile Remove="umbraco\models\**" />`: the v13 ModelsBuilder models are excluded until P8 regenerates them.
- `RazorCompileOnBuild=false`: views are NOT compiled by this build. Views that use the generated models,
  `Umbraco.RenderMacroAsync`, Forms 13 APIs, `UMB-XSRF-TOKEN`, etc. will fail at runtime until P8/P9.

## Warnings (C#)

| File | Warning | Note |
|---|---|---|
| Controllers/SiteSearchController.cs (28, 32, 53) | CS0618 `ILocalizationService` obsolete (removal in v18) | use `ILanguageService` before v18 |
| Controllers/ContactFormController.cs (89) | CS0618 `IEmailSender.SendAsync(EmailMessage, string)` obsolete | use the overload with `expires` |
| Controllers/SiteMemberController.cs (151) | CS0618 `IMemberService.GetByKey(Guid)` obsolete | use `GetById` |
| Helpers/HtmlHelperExtensions.cs (14, 58, 60) | CS8602/CS8603/CS8604/CS8625 nullable warnings | pre-existing code, newly surfaced by the v17 nullable annotations |

## Code changes made to compile

- `Controllers/SiteThemeBackofficeControllers.cs`: `UmbracoAuthorizedApiController` no longer exists.
  `IglooGetThemeColorsController` removed (its only consumer, the IglooApprovedColorPicker editor, was replaced in P5).
  `IglooThemeExplorerController` is now a plain `Controller` at the same route
  (`POST /umbraco/backoffice/Igloo/IglooThemeExplorer/Save`), authorised with the backoffice cookie scheme;
  `SaveAndPublish` → `Save` + `Publish(content, ["*"])`.
- `IPublishedContentCache.GetAtRoot()` was removed: new `Extensions/PublishedCacheExtensions.cs`
  (`GetAtRoot(IDocumentNavigationQueryService)`), used by `Routing/SiteNotFoundContentFinder.cs`,
  `NotificationHandlers/ThemeCssNotificationHandlers.cs` and `Controllers/SiteMemberLogoutController.cs`.
- `Helpers/HtmlHelperExtensions.cs`: removed the unused `Umbraco.Cms.Web.Common.PublishedModels` using.
- `Program.cs`: removed `UseInstallerEndpoints()`. `AddDeliveryApi()` kept (P1 decision D1 is still OPEN).
