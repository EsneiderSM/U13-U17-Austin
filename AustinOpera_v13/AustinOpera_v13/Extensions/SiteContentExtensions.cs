using System.Text.RegularExpressions;
using AustinOpera_v13.Services;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Extensions;

namespace AustinOpera_v13.Extensions;

/// <summary>
/// Site-owned versions of Igloo's PublishedContentExtensions/GuidExtensions (13.1.5) content helpers used by the views:
/// GetThemePath, GetThemeNode, GetCulture, GetFlag, ImageCropCalculation and GetShortId.
/// </summary>
public static class SiteContentExtensions
{
    public const string ThemeAlias = "theme";

    /// <summary>
    /// URL of the generated theme stylesheet of the site, with a cache buster:
    /// /css/generated-themes/ig-theme-{shortKey}.css?v={theme update date ddMMyyyyHHmm}.
    /// Empty when the site has no theme node.
    /// </summary>
    public static string GetThemePath(this IPublishedContent model)
    {
        IPublishedContent? themeNode = model.GetThemeNode();
        if (themeNode == null)
        {
            return string.Empty;
        }

        return "/" + ThemeCssService.OutputFolder + "/ig-theme-" + themeNode.Key.GetShortId() + ".css?v=" + themeNode.UpdateDate.ToString("ddMMyyyyHHmm");
    }

    /// <summary>The "theme" child of the site's "websiteSettings" node.</summary>
    public static IPublishedContent? GetThemeNode(this IPublishedContent model)
    {
        IPublishedContent? settingsContainer = model.Root()?.Children()?.FirstOrDefault(x => x.IsDocumentType(SiteSettingsService.SettingsContainerAlias));
        return settingsContainer?.Children()?.FirstOrDefault(x => x.IsDocumentType(ThemeAlias));
    }

    /// <summary>The culture info of the content for the culture of the current domain.</summary>
    public static PublishedCultureInfo? GetCulture(this IPublishedContent model)
    {
        string key = model.GetCultureFromDomains() ?? string.Empty;
        model.Cultures.TryGetValue(key, out PublishedCultureInfo? value);
        return value;
    }

    /// <summary>Default flag icon for a culture: /ig-assets/flags/{region}.svg.</summary>
    public static string GetFlag(this PublishedCultureInfo culture)
    {
        string code = culture.Culture;
        if (code.Contains('-'))
        {
            code = code.Split('-')[1];
        }

        return "/ig-assets/flags/" + code.ToLower() + ".svg";
    }

    public static string GetFlag(this PublishedCultureInfo culture, string path) =>
        path + culture.Culture.Split('-')[1].ToLower() + ".svg";

    /// <summary>"{width}x{height}" for PhotoSwipe, scaled down to a maximum width of 2000.</summary>
    public static string ImageCropCalculation(this IPublishedContent? media)
    {
        if (media == null)
        {
            return string.Empty;
        }

        float width = Convert.ToInt32(media.Value("umbracoWidth"));
        float height = Convert.ToInt32(media.Value("umbracoHeight"));
        float newWidth = width;
        double newHeight = height;
        if (width > 2000f)
        {
            float ratio = height / width;
            newWidth = 2000f;
            newHeight = Math.Ceiling(newWidth * ratio);
        }

        return newWidth + "x" + newHeight;
    }

    /// <summary>Short, URL-safe form of a key: base64 of the bytes without '/', '+' and '='.</summary>
    public static string GetShortId(this Guid key) =>
        Regex.Replace(Convert.ToBase64String(key.ToByteArray()), "[/+=]", string.Empty);
}
