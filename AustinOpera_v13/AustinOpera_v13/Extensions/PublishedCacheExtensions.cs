using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services.Navigation;

namespace AustinOpera_v13.Extensions;

/// <summary>
/// P6 (Umbraco 17): IPublishedContentCache.GetAtRoot() was removed; root nodes now come from the
/// navigation service. Same result as the v13 call: published root nodes in sort order.
/// </summary>
public static class PublishedCacheExtensions
{
    public static IEnumerable<IPublishedContent> GetAtRoot(this IPublishedContentCache? cache, IDocumentNavigationQueryService navigation)
    {
        if (cache == null || !navigation.TryGetRootKeys(out IEnumerable<Guid> rootKeys))
        {
            return Enumerable.Empty<IPublishedContent>();
        }

        return rootKeys
            .Select(key => cache.GetById(key))
            .OfType<IPublishedContent>()
            .ToList();
    }
}
