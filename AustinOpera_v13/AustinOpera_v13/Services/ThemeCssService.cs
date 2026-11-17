using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using AustinOpera_v13.Extensions;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace AustinOpera_v13.Services;

/// <summary>
/// Builds the theme stylesheet from the "theme" settings node, replacing what Igloo Core 13.1.5
/// (ThemeService + IglooPublishedNotification) did on publish:
/// - template: wwwroot/css/ig-theme.css, with <c>{propertyAlias}</c> placeholders;
/// - for hex colours, <c>{aliasRGB}</c>, <c>{aliasDarker}</c> (10% towards black) and
///   <c>{aliasLighter}</c> (5% towards white) are filled in as well;
/// - every template line whose placeholder has no value is blanked;
/// - the result is minified and written to wwwroot/css/generated-themes/ig-theme-{shortKey}.css,
///   the path returned by <see cref="SiteContentExtensions.GetThemePath"/>.
/// The output is byte-compatible with the file Igloo generated.
/// </summary>
public interface IThemeCssService
{
    /// <summary>Regenerates the stylesheet of the theme node with this key. Returns false on failure.</summary>
    bool Generate(Guid themeKey);

    /// <summary>Absolute file path of the generated stylesheet for a theme node.</summary>
    string GetOutputFilePath(Guid themeKey);
}

public class ThemeCssService : IThemeCssService
{
    public const string TemplateFile = "css/ig-theme.css";
    public const string OutputFolder = "css/generated-themes";

    private static readonly Regex PlaceholderRegex = new("{(.*?)}", RegexOptions.Compiled);
    private static readonly Regex HexColorRegex = new("^#(?:[0-9a-fA-F]{3}){1,2}$", RegexOptions.Compiled);
    private static readonly object WriteLock = new();

    private readonly IUmbracoContextFactory _umbracoContextFactory;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly ILogger<ThemeCssService> _logger;

    public ThemeCssService(IUmbracoContextFactory umbracoContextFactory, IWebHostEnvironment webHostEnvironment, ILogger<ThemeCssService> logger)
    {
        _umbracoContextFactory = umbracoContextFactory;
        _webHostEnvironment = webHostEnvironment;
        _logger = logger;
    }

    public string GetOutputFilePath(Guid themeKey) =>
        Path.Combine(_webHostEnvironment.WebRootPath, OutputFolder, "ig-theme-" + themeKey.GetShortId() + ".css");

    public bool Generate(Guid themeKey)
    {
        try
        {
            string templatePath = Path.Combine(_webHostEnvironment.WebRootPath, TemplateFile);
            string css = File.ReadAllText(templatePath, Encoding.UTF8);

            using UmbracoContextReference contextReference = _umbracoContextFactory.EnsureUmbracoContext();
            IPublishedContent? theme = contextReference.UmbracoContext.Content?.GetById(themeKey);
            if (theme == null)
            {
                _logger.LogWarning("Theme CSS not generated: theme node {ThemeKey} is not published", themeKey);
                return false;
            }

            css = ApplyTheme(css, alias => theme.Value<string>(alias));
            if (string.IsNullOrEmpty(css))
            {
                return false;
            }

            css = Minify(css);

            string outputPath = GetOutputFilePath(themeKey);
            Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
            lock (WriteLock)
            {
                // Same content as Igloo's StreamWriter.WriteLine: UTF-8 without BOM plus a line break.
                File.WriteAllText(outputPath, css + Environment.NewLine, new UTF8Encoding(false));
            }

            _logger.LogInformation("Theme CSS generated for {ThemeKey} at {Path}", themeKey, outputPath);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Theme CSS could not be generated for {ThemeKey}", themeKey);
            return false;
        }
    }

    /// <summary>Fills the template placeholders, in template order (the order matters, as in Igloo).</summary>
    public static string ApplyTheme(string template, Func<string, string?> getValue)
    {
        string css = template;
        foreach (Match match in PlaceholderRegex.Matches(template))
        {
            string alias = match.Groups[1].Value;
            string? value = getValue(alias);

            if (string.IsNullOrEmpty(value))
            {
                // Blank every line that still uses this placeholder.
                css = Regex.Replace(css, ".*{" + alias + "}.*", string.Empty);
                continue;
            }

            if (HexColorRegex.IsMatch(value))
            {
                (int r, int g, int b) = ParseHex(value);
                css = css.Replace("{" + alias + "RGB}", r + ", " + g + ", " + b);
                css = css.Replace("{" + alias + "Darker}", ToHex(Blend((r, g, b), (0, 0, 0), 0.1f)));
                css = css.Replace("{" + alias + "Lighter}", ToHex(Blend((r, g, b), (255, 255, 255), 0.05f)));
            }

            css = css.Replace(match.Value, value);
        }

        return css;
    }

    /// <summary>The same minification rules as Igloo's StyleHelper, applied in the same order.</summary>
    public static string Minify(string css)
    {
        css = Regex.Replace(css, "[a-zA-Z]+#", "#");
        css = Regex.Replace(css, "[\\n\\r]+\\s*", string.Empty);
        css = Regex.Replace(css, "\\s+", " ");
        css = Regex.Replace(css, "\\s?([:,;{}])\\s?", "$1");
        css = css.Replace(";}", "}");
        css = Regex.Replace(css, "([\\s:]0)(px|pt|%|em)", "$1");
        css = Regex.Replace(css, "/\\*[\\d\\D]*?\\*/", string.Empty);
        return css;
    }

    private static (int R, int G, int B) ParseHex(string value)
    {
        string hex = value.Replace("#", string.Empty);
        if (hex.Length == 3)
        {
            // Kept as Igloo did it ("abc" -> "abcabc") so the output stays identical.
            hex += hex;
        }

        return (
            int.Parse(hex.Substring(0, 2), NumberStyles.AllowHexSpecifier),
            int.Parse(hex.Substring(2, 2), NumberStyles.AllowHexSpecifier),
            int.Parse(hex.Substring(4, 2), NumberStyles.AllowHexSpecifier));
    }

    // Linear blend in single precision, truncated to a byte, exactly as Igloo's ColorHelper.Lerp.
    private static (int R, int G, int B) Blend((int R, int G, int B) from, (int R, int G, int B) to, float amount) =>
        (BlendChannel(from.R, to.R, amount), BlendChannel(from.G, to.G, amount), BlendChannel(from.B, to.B, amount));

    private static byte BlendChannel(float start, float end, float amount) => (byte)(start + ((end - start) * amount));

    private static string ToHex((int R, int G, int B) c) => "#" + c.R.ToString("X2") + c.G.ToString("X2") + c.B.ToString("X2");
}
