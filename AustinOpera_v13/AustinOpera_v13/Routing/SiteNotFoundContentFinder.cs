using AustinOpera_v13.Extensions;
using AustinOpera_v13.Services;
using Umbraco.Cms.Core.Services.Navigation;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;

namespace AustinOpera_v13.Routing;

/// <summary>
/// Last-chance content finder: renders the site's "error404Page" setting for unknown URLs
/// (replaces Igloo's Igloo404ContentFinder 13.1.5).
/// The site is the root node of the domain that matches the request (host or https://host), otherwise
/// the root node of the first domain, otherwise the first root node.
/// Registered in Program.cs after AddComposers() so it wins over the one Igloo registers.
/// </summary>
public class SiteNotFoundContentFinder : IContentLastChanceFinder
{
    private readonly IUmbracoContextFactory _umbracoContextFactory;
    private readonly ISiteSettingsService _settingsService;
    private readonly IDocumentNavigationQueryService _navigation;

    public SiteNotFoundContentFinder(IUmbracoContextFactory umbracoContextFactory, ISiteSettingsService settingsService, IDocumentNavigationQueryService navigation)
    {
        _umbracoContextFactory = umbracoContextFactory;
        _settingsService = settingsService;
        _navigation = navigation;
    }

    public Task<bool> TryFindContent(IPublishedRequestBuilder request)
    {
        using UmbracoContextReference contextReference = _umbracoContextFactory.EnsureUmbracoContext();
        IUmbracoContext umbracoContext = contextReference.UmbracoContext;

        string authority = request.Uri.Authority;
        List<Domain> domains = umbracoContext.Domains?.GetAll(true).ToList() ?? new List<Domain>();
        Domain? domain = domains.FirstOrDefault(d => d.Name == authority || d.Name == "https://" + authority) ?? domains.FirstOrDefault();

        IPublishedContent? site = domain != null ? umbracoContext.Content?.GetById(false, domain.ContentId) : null;
        site ??= umbracoContext.Content?.GetAtRoot(_navigation).FirstOrDefault();
        if (site == null)
        {
            return Task.FromResult(false);
        }

        IPublishedContent? notFoundPage = _settingsService.Get<IPublishedContent?>(site, "error404Page");
        if (notFoundPage != null)
        {
            request.SetPublishedContent(notFoundPage);
        }

        return Task.FromResult(request.PublishedContent != null);
    }
}
