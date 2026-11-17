using Examine;
using Examine.Search;
using AustinOpera_v13.Models;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Examine;
using Umbraco.Extensions;

namespace AustinOpera_v13.Controllers;

/// <summary>
/// Site search used by the search modal and the Search page (ig-app.js)
/// (replaces Igloo's IglooSearchController 13.1.5, same query and response).
/// GET /umbraco/api/sitesearch/search?query=&amp;amount=&amp;page=&amp;siteId=&amp;culture=
/// The document types and fields are the ones from igloo/Igloo.config.
/// </summary>
[Route(BaseRoute + "/[action]")]
public class SiteSearchController : Controller
{
    public const string BaseRoute = "umbraco/api/sitesearch";

    // Values of igloo/Igloo.config (identical to Igloo's defaults).
    public static readonly string[] DocumentTypes = { "page", "site", "post", "feed" };
    public static readonly string[] Fields = { "nodeName", "metaTitle", "metaDescription", "heading", "text", "widgets" };

    private readonly ILocalizationService _localizationService;
    private readonly IPublishedContentQuery _publishedContentQuery;
    private readonly IExamineManager _examineManager;

    public SiteSearchController(ILocalizationService localizationService, IPublishedContentQuery publishedContentQuery, IExamineManager examineManager)
    {
        _localizationService = localizationService;
        _publishedContentQuery = publishedContentQuery;
        _examineManager = examineManager;
    }

    [HttpGet]
    public SiteSearchResponse Search(string query, int amount, int page, int siteId, string? culture)
    {
        var response = new SiteSearchResponse();

        if (!_examineManager.TryGetIndex(Constants.UmbracoIndexes.ExternalIndexName, out IIndex? index) || index is not IUmbracoIndex)
        {
            throw new InvalidOperationException("The required index ExternalIndex was not found");
        }

        IPublishedContent? site = _publishedContentQuery.Content(siteId);
        amount = amount == 0 ? 6 : amount;
        query = (query ?? string.Empty).ToLower();

        if (_localizationService.GetAllLanguages().Count() == 1)
        {
            culture = string.Empty;
        }

        var fields = new List<string>();
        foreach (string field in Fields)
        {
            fields.Add(string.IsNullOrEmpty(culture) ? field : field + "_" + culture.ToLower());
            fields.Add(field);
        }

        string publishedField = string.IsNullOrEmpty(culture) ? "__Published" : "__Published_" + culture.ToLower();

        IBooleanOperation search = index.Searcher.CreateQuery("content")
            .ManagedQuery(query, fields.ToArray())
            .And().GroupedOr(new[] { publishedField }, "y")
            .And().GroupedOr(new[] { "__NodeTypeAlias" }, DocumentTypes);

        if (site != null)
        {
            search = search.And().GroupedOr(new[] { "__Path" }, (site.Path + ",*").MultipleCharacterWildcard(), (site.Path ?? string.Empty).Escape());
        }

        search = search.Not().Field("hideFromSearch", "1");

        ISearchResults results = search.Execute();
        response.ResultCount = results.TotalItemCount;

        foreach (ISearchResult result in results.Skip((page - 1) * amount).Take(amount))
        {
            IPublishedContent? content = _publishedContentQuery.Content(result.Id);
            IPublishedContent? metaImage = content?.Value<IPublishedContent>("metaImage");
            // Umbraco 17: Name("")/Value(alias, "") no longer fall back to the invariant value, so pass null for invariant sites.
            string? variantCulture = string.IsNullOrEmpty(culture) ? null : culture;
            string description = content?.Value<string>("metaDescription", variantCulture) ?? string.Empty;
            string? title = content?.Name(variantCulture);
            if (string.IsNullOrEmpty(title))
            {
                title = content?.Name;
            }
            string? url = content?.Url(culture) == "#" ? content?.Url() : content?.Url(culture);

            if (title != null)
            {
                response.Result.Add(new SiteSearchResult
                {
                    Title = title,
                    Url = url ?? string.Empty,
                    Description = description,
                    ImageUrl = metaImage?.Url() ?? string.Empty,
                });
            }
        }

        return response;
    }
}
