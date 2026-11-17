using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace AustinOpera_v13.Controllers;

// P6 (Umbraco 17): UmbracoAuthorizedApiController no longer exists.
// - The former IglooGetThemeColorsController was removed: its only consumer, the
//   App_Plugins/IglooApprovedColorPicker editor, was replaced by a core Radio Button List in P5.
// - IglooThemeExplorerController is now a plain MVC controller at the same route, authorised by the
//   backoffice login cookie, so wwwroot/scripts/lib/theme-explorer.js keeps working unchanged.

/// <summary>
/// Site-owned replacement for Igloo Core 13.1.5's IglooThemeExplorerController, at the same route
/// (POST /umbraco/backoffice/Igloo/IglooThemeExplorer/Save), used by wwwroot/scripts/lib/theme-explorer.js.
/// Writes the posted values to the site's Theme node (websiteSettings > theme) and publishes it, like Igloo.
/// </summary>
[Route("umbraco/backoffice/Igloo/IglooThemeExplorer/[action]")]
[Authorize(AuthenticationSchemes = Constants.Security.BackOfficeAuthenticationType)]
public class IglooThemeExplorerController : Controller
{
    private readonly IContentService _contentService;
    private readonly IPublishedContentQuery _contentQuery;

    public IglooThemeExplorerController(IContentService contentService, IPublishedContentQuery contentQuery)
    {
        _contentService = contentService;
        _contentQuery = contentQuery;
    }

    [HttpPost]
    public IActionResult Save([FromBody] SiteThemeExplorerRequest request)
    {
        IPublishedContent? themeNode = _contentQuery.Content(request.currentPageId)?.Root()?
            .FirstChildOfType("websiteSettings")?
            .FirstChildOfType("theme");
        if (themeNode == null || request.theme == null)
        {
            return NotFound();
        }

        IContent? content = _contentService.GetById(themeNode.Id);
        if (content == null)
        {
            return NotFound();
        }

        foreach (KeyValuePair<string, string> item in request.theme)
        {
            content.SetValue(item.Key, (item.Value ?? string.Empty).Trim().Replace("pxpx", "px"));
        }

        // v13 SaveAndPublish(content, "*", -1) → Save + Publish in Umbraco 14+.
        _contentService.Save(content, -1);
        _contentService.Publish(content, new[] { "*" }, -1);
        return Ok();
    }
}

public class SiteThemeExplorerRequest
{
    public int currentPageId { get; set; }

    public Dictionary<string, string>? theme { get; set; }
}
