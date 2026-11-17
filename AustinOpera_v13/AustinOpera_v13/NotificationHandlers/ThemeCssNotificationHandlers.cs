using AustinOpera_v13.Extensions;
using AustinOpera_v13.Services;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.Navigation;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace AustinOpera_v13.NotificationHandlers;

/// <summary>
/// Regenerates the theme stylesheet when a "theme" node is published (replaces the theme part of
/// Igloo's IglooPublishedNotification 13.1.5) and shows a warning in the backoffice on failure.
/// </summary>
public class ThemeCssPublishedHandler : INotificationHandler<ContentPublishedNotification>
{
    private readonly IThemeCssService _themeCssService;

    public ThemeCssPublishedHandler(IThemeCssService themeCssService) => _themeCssService = themeCssService;

    public void Handle(ContentPublishedNotification notification)
    {
        foreach (IContent node in notification.PublishedEntities)
        {
            if (node.ContentType.Alias != SiteContentExtensions.ThemeAlias)
            {
                continue;
            }

            if (!_themeCssService.Generate(node.Key))
            {
                notification.Messages.Add(new EventMessage(
                    "Theme Error",
                    "There was an error building the theme stylesheet (see the log).",
                    EventMessageType.Warning));
            }
        }
    }
}

/// <summary>
/// Once per application start (on the first request, when the content cache is loaded), generates the theme
/// stylesheet of each site whose generated file is missing or empty (for example on a fresh deployment).
/// Existing files are left alone.
/// </summary>
public class ThemeCssStartupHandler : INotificationHandler<UmbracoRequestBeginNotification>
{
    private static int _checked;

    private readonly IThemeCssService _themeCssService;
    private readonly IUmbracoContextFactory _umbracoContextFactory;
    private readonly IRuntimeState _runtimeState;
    private readonly ILogger<ThemeCssStartupHandler> _logger;
    private readonly IDocumentNavigationQueryService _navigation;

    public ThemeCssStartupHandler(IThemeCssService themeCssService, IUmbracoContextFactory umbracoContextFactory, IRuntimeState runtimeState, ILogger<ThemeCssStartupHandler> logger, IDocumentNavigationQueryService navigation)
    {
        _navigation = navigation;
        _themeCssService = themeCssService;
        _umbracoContextFactory = umbracoContextFactory;
        _runtimeState = runtimeState;
        _logger = logger;
    }

    public void Handle(UmbracoRequestBeginNotification notification)
    {
        if (_runtimeState.Level != RuntimeLevel.Run || Interlocked.Exchange(ref _checked, 1) == 1)
        {
            return;
        }

        try
        {
            var themeKeys = new List<Guid>();
            using (UmbracoContextReference contextReference = _umbracoContextFactory.EnsureUmbracoContext())
            {
                foreach (IPublishedContent root in contextReference.UmbracoContext.Content?.GetAtRoot(_navigation) ?? Enumerable.Empty<IPublishedContent>())
                {
                    IPublishedContent? theme = root.GetThemeNode();
                    if (theme != null)
                    {
                        themeKeys.Add(theme.Key);
                    }
                }
            }

            _logger.LogInformation("Checking generated theme stylesheets for {Count} theme node(s)", themeKeys.Count);
            foreach (Guid key in themeKeys)
            {
                var file = new FileInfo(_themeCssService.GetOutputFilePath(key));
                if (!file.Exists || file.Length == 0)
                {
                    _themeCssService.Generate(key);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Could not check the generated theme stylesheets on startup");
        }
    }
}
