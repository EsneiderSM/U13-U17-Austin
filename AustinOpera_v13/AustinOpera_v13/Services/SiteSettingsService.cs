using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Extensions;

namespace AustinOpera_v13.Services;

/// <summary>
/// Site-owned replacement for Igloo's ISettingsService (LittleNorth Igloo Core 13.1.5).
/// Reads a "site setting" for the site that <c>content</c> belongs to.
/// </summary>
public interface ISiteSettingsService
{
    /// <summary>
    /// Returns the value of property <paramref name="alias"/> from the settings node of the site that
    /// <paramref name="content"/> belongs to, or <paramref name="defaultValue"/> when there is no such
    /// setting or it has no value. Same signature (and named parameters) as Igloo's ISettingsService.Get.
    /// </summary>
    T Get<T>(IPublishedContent? content, string alias, string? culture = null, T defaultValue = default!);

    /// <summary>
    /// The settings node that holds <paramref name="alias"/>: the first child of the site's
    /// "websiteSettings" node that has a property with that alias.
    /// </summary>
    IPublishedContent? GetSettingsNode(IPublishedContent? content, string alias);
}

/// <summary>
/// Lookup order (identical to Igloo 13.1.5):
/// 1. site = content.Root() (the level-1 ancestor);
/// 2. the first child of the site whose document type is "websiteSettings";
/// 3. the first child of that node whose document type has a property <c>alias</c>;
/// 4. its value for <c>culture</c>, falling back to <c>defaultValue</c> when it has no value.
/// Any failure (no site, no settings node, conversion error) returns <c>defaultValue</c>.
/// Igloo cached each value in the runtime cache until a settings node was published; this version
/// does not cache: the lookup is an in-memory walk of a handful of published nodes.
/// </summary>
public class SiteSettingsService : ISiteSettingsService
{
    public const string SettingsContainerAlias = "websiteSettings";

    private readonly ILogger<SiteSettingsService> _logger;

    public SiteSettingsService(ILogger<SiteSettingsService> logger) => _logger = logger;

    public T Get<T>(IPublishedContent? content, string alias, string? culture = null, T defaultValue = default!)
    {
        try
        {
            IPublishedContent? settingsNode = GetSettingsNode(content, alias);
            if (settingsNode == null)
            {
                return defaultValue;
            }

            return settingsNode.Value<T>(alias, culture, fallback: Fallback.ToDefaultValue, defaultValue: defaultValue)!;
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Could not read site setting {Alias}", alias);
            return defaultValue;
        }
    }

    public IPublishedContent? GetSettingsNode(IPublishedContent? content, string alias)
    {
        IPublishedContent? site = content?.Root();
        IPublishedContent? settingsContainer = site?.Children()?.FirstOrDefault(x => x.IsDocumentType(SettingsContainerAlias));
        return settingsContainer?.Children()?.FirstOrDefault(x => x.HasProperty(alias));
    }
}
