using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;

namespace AustinOpera_v13.Helpers
{
    public static partial class AdageHtmlHelper
    {
        public static string GetAltText(this Umbraco.Cms.Core.Models.MediaWithCrops image, string fallBackAltText)
        {
            if (image != null)
            {
                if (image.HasProperty("altText"))
                {
                    return image.GetProperty("altText").GetValue().ToString();
                }
                else
                {
                    return fallBackAltText;
                }
            }
            else
            {
                return "";
            }
        }
        public static string GetAbsoluteUrl(Link hyperlink, string? contentSite)
        {
            var linkUrl = hyperlink.Url;
            if (linkUrl != null)
            {
                if (!linkUrl.ToString().Contains("https://"))
                {
                    return $"{contentSite}{linkUrl}";
                }
                else return linkUrl;
            }
            else return String.Empty;
        }
        public static string GetAbsoluteUrlFromString(string hyperlink, string? contentSite)
        {
            var linkUrl = hyperlink;
            if (linkUrl != null)
            {
                if (!linkUrl.ToString().Contains("https://"))
                {
                    return $"{contentSite}{linkUrl}";
                }
                else return linkUrl;
            }
            else return String.Empty;
        }

        public static string GetCssFocalPoint(MediaWithCrops image)
        {
            var localFocalPoint = image.LocalCrops?.FocalPoint;
            var mediaFocalPoint = (image.Value("umbracoFile") as ImageCropperValue)?.FocalPoint;

            var focalPoint = localFocalPoint != null ? localFocalPoint : mediaFocalPoint;

            if (focalPoint != null)
            {
                return $"--h:{Math.Round(focalPoint.Left * 100, 2)}%; --v:{Math.Round(focalPoint.Top * 100, 2)}%;";
            }

            return string.Empty;
        }
    }
}
