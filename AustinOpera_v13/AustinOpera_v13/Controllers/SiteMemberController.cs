using AustinOpera_v13.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Logging;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Web.Common;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Cms.Web.Common.Security;
using Umbraco.Cms.Web.Website.Controllers;
using Umbraco.Extensions;

namespace AustinOpera_v13.Controllers;

/// <summary>
/// Member login and registration for the Login and Register widgets
/// (replaces Igloo's IglooMemberController 13.1.5, same behaviour).
/// Forms: Html.BeginUmbracoForm&lt;SiteMemberController&gt;("Login" | "HandleRegisterMember").
/// </summary>
public class SiteMemberController : SurfaceController
{
    private readonly IMemberManager _memberManager;
    private readonly IMemberSignInManager _memberSignInManager;
    private readonly IMemberService _memberService;
    private readonly ICoreScopeProvider _coreScopeProvider;
    private readonly UmbracoHelper _umbracoHelper;

    public SiteMemberController(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbracoDatabaseFactory databaseFactory,
        ServiceContext services,
        AppCaches appCaches,
        IProfilingLogger profilingLogger,
        IPublishedUrlProvider publishedUrlProvider,
        IMemberManager memberManager,
        IMemberSignInManager memberSignInManager,
        IMemberService memberService,
        ICoreScopeProvider coreScopeProvider,
        UmbracoHelper umbracoHelper)
        : base(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider)
    {
        _memberManager = memberManager;
        _memberSignInManager = memberSignInManager;
        _memberService = memberService;
        _coreScopeProvider = coreScopeProvider;
        _umbracoHelper = umbracoHelper;
    }

    [HttpPost]
    [ValidateUmbracoFormRouteString]
    public async Task<IActionResult> Login([Bind(Prefix = "loginModel")] MemberLoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return CurrentUmbracoPage();
        }

        if (await _memberManager.ValidateCredentialsAsync(model.Username, model.Password)
            && (await _memberSignInManager.PasswordSignInAsync(model.Username, model.Password, model.RememberMe, true)).Succeeded)
        {
            TempData["LoginSuccess"] = true;
            if (!model.RedirectUrl.IsNullOrWhiteSpace())
            {
                return Redirect(model.RedirectUrl!);
            }

            // Igloo 13.1.5 behaviour kept as is: a successful login without RedirectUrl falls through to the
            // error below (the member is signed in). The Login widget always posts a RedirectUrl.
        }

        ModelState.AddModelError("loginModel", _umbracoHelper.GetDictionaryValueOrDefault("Invalid username or password", "Invalid username or password"));
        return CurrentUmbracoPage();
    }

    [HttpPost]
    [ValidateUmbracoFormRouteString]
    public async Task<IActionResult> HandleRegisterMember([Bind(Prefix = "registerModel")] MemberRegisterModel model)
    {
        if (!ModelState.IsValid)
        {
            return CurrentUmbracoPage();
        }

        MergeRouteValuesToModel(model);

        IdentityResult result = await RegisterMemberAsync(model);
        if (result.Succeeded)
        {
            TempData["FormSuccess"] = true;
            if (!model.RedirectUrl.IsNullOrWhiteSpace())
            {
                return Redirect(model.RedirectUrl!);
            }

            return RedirectToCurrentUmbracoPage();
        }

        foreach (IdentityError error in result.Errors)
        {
            ModelState.AddModelError("registerModel", error.Description);
        }

        return CurrentUmbracoPage();
    }

    // Values passed as additionalRouteVals of BeginUmbracoForm override the posted ones.
    private void MergeRouteValuesToModel(MemberRegisterModel model)
    {
        if (RouteData.Values.TryGetValue("RedirectUrl", out object? redirectUrl) && redirectUrl != null)
        {
            model.RedirectUrl = redirectUrl.ToString();
        }

        if (RouteData.Values.TryGetValue("MemberTypeAlias", out object? memberTypeAlias) && memberTypeAlias != null)
        {
            model.MemberTypeAlias = memberTypeAlias.ToString();
        }

        if (RouteData.Values.TryGetValue("UsernameIsEmail", out object? usernameIsEmail) && usernameIsEmail != null)
        {
            model.UsernameIsEmail = usernameIsEmail.ToString() == "True";
        }
    }

    // No member group is assigned: Igloo did not assign one either. An empty member type alias makes
    // Umbraco use the default "Member" type.
    private async Task<IdentityResult> RegisterMemberAsync(MemberRegisterModel model)
    {
        using ICoreScope scope = _coreScopeProvider.CreateCoreScope(autoComplete: true);

        if (string.IsNullOrEmpty(model.Name) && !string.IsNullOrEmpty(model.Email))
        {
            model.Name = model.Email;
        }

        model.Username = model.UsernameIsEmail || model.Username == null ? model.Email : model.Username;

        var identityUser = MemberIdentityUser.CreateNew(model.Username, model.Email, model.MemberTypeAlias!, true, model.Name);
        IdentityResult result = await _memberManager.CreateAsync(identityUser, model.Password);
        if (!result.Succeeded)
        {
            return result;
        }

        IMember member = _memberService.GetByKey(identityUser.Key)
            ?? throw new InvalidOperationException($"Could not find a member with key: {identityUser.Key}.");

        if (model.MemberProperties != null)
        {
            foreach (MemberPropertyModel property in model.MemberProperties.Where(p => p.Value != null && member.Properties.Contains(p.Alias)))
            {
                member.Properties[property.Alias]?.SetValue(property.Value);
            }
        }

        _memberService.Save(member);

        await _memberSignInManager.SignInAsync(identityUser, false);

        return result;
    }
}
