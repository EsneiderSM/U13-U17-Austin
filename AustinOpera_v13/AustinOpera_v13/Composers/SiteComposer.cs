using AustinOpera_v13.NotificationHandlers;
using AustinOpera_v13.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;

namespace AustinOpera_v13.Composers;

/// <summary>
/// Registers the site-owned replacements of the Igloo Core 13.1.5 runtime (see docs/migration/P3-igloo-feature-map.md).
/// The last-chance (404) content finder is set in Program.cs, after AddComposers(), so it replaces Igloo's.
/// </summary>
public class SiteComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<ISiteSettingsService, SiteSettingsService>();
        builder.Services.AddSingleton<IThemeCssService, ThemeCssService>();
        builder.Services.AddHttpClient();

        builder.AddNotificationHandler<ContentPublishedNotification, ThemeCssPublishedHandler>();
        builder.AddNotificationHandler<UmbracoRequestBeginNotification, ThemeCssStartupHandler>();
    }
}
