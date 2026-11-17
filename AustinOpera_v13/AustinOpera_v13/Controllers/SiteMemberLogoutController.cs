using AustinOpera_v13.Extensions;
using AustinOpera_v13.Services;
using Umbraco.Cms.Core.Services.Navigation;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Security;
using Umbraco.Extensions;

namespace AustinOpera_v13.Controllers;

/// <summary>
/// GET /logout: signs the member out and redirects to the site's "logoutRedirect" setting, or "/"
/// (replaces Igloo's IglooMemberLogoutController 13.1.5, same route).
/// While the Igloo package is still installed, SiteComposer removes Igloo's controller so the route is not ambiguous.
/// </summary>
public class SiteMemberLogoutController : Controller
{
    private readonly IUmbracoContextFactory _umbracoContextFactory;
    private readonly IMemberSignInManager _memberSignInManager;
    private readonly ISiteSettingsService _settingsService;
    private readonly IDocumentNavigationQueryService _navigation;

    public SiteMemberLogoutController(IUmbracoContextFactory umbracoContextFactory, IMemberSignInManager memberSignInManager, ISiteSettingsService settingsService, IDocumentNavigationQueryService navigation)
    {
        _navigation = navigation;
        _umbracoContextFactory = umbracoContextFactory;
        _memberSignInManager = memberSignInManager;
        _settingsService = settingsService;
    }

    [Route("logout")]
    public async Task<IActionResult> Logout()
    {
        using UmbracoContextReference contextReference = _umbracoContextFactory.EnsureUmbracoContext();

        TempData.Clear();
        await _memberSignInManager.SignOutAsync();

        IPublishedContent? site = contextReference.UmbracoContext.Content?.GetAtRoot(_navigation).FirstOrDefault(x => x.IsDocumentType("site"));
        string? url = _settingsService.Get<IPublishedContent?>(site, "logoutRedirect")?.Url();
        return Redirect(string.IsNullOrEmpty(url) ? "/" : url);
    }
}
