using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Umbraco.Cms.Core.Models.Blocks;

namespace AustinOpera_v13.Extensions;

/// <summary>
/// Site-owned version of Igloo's WidgetExtension.RenderWidget (13.1.5).
/// Renders a Block List item with the partial ~/Views/Partials/Widgets/{content type alias}.cshtml and passes
/// ViewData "order" (the widget index) and "errors" (the validation summary), as Igloo did.
/// Igloo's version also ran a licence check that, on hosts it did not recognise, wrote a banner from
/// Response.OnStarting. That broke the chunked response ("Invalid character in chunk size"). It is not kept.
/// </summary>
public static class SiteWidgetExtensions
{
    // The parameter is named "WidgetIndex" because RenderWidgets.cshtml passes it by name.
    public static async Task<IHtmlContent> RenderWidget(this IHtmlHelper html, BlockListItem widget, int WidgetIndex = 1)
    {
        IHtmlContent validationSummary = html.ValidationSummary();
        string partialPath = GetWidgetPartialViewPath(widget.Content.ContentType.Alias);
        html.ViewData["order"] = WidgetIndex;
        html.ViewData["errors"] = validationSummary;
        return await html.PartialAsync(partialPath, widget, new ViewDataDictionary(html.ViewData));
    }

    private static string GetWidgetPartialViewPath(string alias) =>
        "~/Views/Partials/Widgets/" + alias.Replace(" ", string.Empty).Trim() + ".cshtml";
}
