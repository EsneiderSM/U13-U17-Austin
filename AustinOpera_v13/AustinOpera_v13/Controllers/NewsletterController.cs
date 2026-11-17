using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using AustinOpera_v13.Models;
using AustinOpera_v13.Services;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Web.Common;
using Umbraco.Extensions;

namespace AustinOpera_v13.Controllers;

/// <summary>
/// Newsletter widget endpoints (replaces Igloo's IglooNewsletterController 13.1.5).
/// POST JSON from ig-app.js; returns { success, message }. The API key is the site's "newsletterAPIKey"
/// setting; the list id is posted by the widget (its ListID setting or the site's
/// "newsletterDefaultSubscriberListID"). The provider requests are the same as Igloo's.
/// </summary>
[Route(BaseRoute + "/[action]")]
public class NewsletterController : Controller
{
    public const string BaseRoute = "umbraco/api/sitenewsletter";
    public const string AddMailchimpMemberUrl = "/" + BaseRoute + "/addmailchimpmember";
    public const string AddCampaignMonitorMemberUrl = "/" + BaseRoute + "/addcampaignmonitormember";

    private readonly ISiteSettingsService _settingsService;
    private readonly IPublishedContentQuery _publishedContentQuery;
    private readonly UmbracoHelper _umbracoHelper;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<NewsletterController> _logger;

    public NewsletterController(
        ISiteSettingsService settingsService,
        IPublishedContentQuery publishedContentQuery,
        UmbracoHelper umbracoHelper,
        IHttpClientFactory httpClientFactory,
        ILogger<NewsletterController> logger)
    {
        _settingsService = settingsService;
        _publishedContentQuery = publishedContentQuery;
        _umbracoHelper = umbracoHelper;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpPost]
    public async Task<SiteApiResponse> AddMailchimpMember([FromBody] NewsletterViewModel request)
    {
        if (!ModelState.IsValid)
        {
            return Result(false, "Newsletter Invalid Email");
        }

        IPublishedContent? site = _publishedContentQuery.Content(request.PageID)?.AncestorOrSelf(1);
        if (site == null)
        {
            return Result(false, "No Site Node");
        }

        string apiKey = _settingsService.Get<string>(site, "newsletterAPIKey") ?? string.Empty;
        string dataCenter = apiKey.Substring(apiKey.IndexOf('-') + 1);
        string subscriberHash = string.IsNullOrEmpty(request.Email) ? string.Empty : Md5Hex(request.Email.ToLower());
        string url = $"https://{dataCenter}.api.mailchimp.com/3.0/lists/{request.ListID}/members/{subscriberHash}";

        HttpClient client = CreateClient(new AuthenticationHeaderValue("Basic", apiKey));
        using HttpResponseMessage response = await client.PutAsJsonAsync(url, new { email_address = request.Email, status_if_new = "pending" });
        return await ToResult(response, "Mailchimp");
    }

    [HttpPost]
    public async Task<SiteApiResponse> AddCampaignMonitorMember([FromBody] NewsletterViewModel request)
    {
        if (!ModelState.IsValid)
        {
            return Result(false, "Newsletter Invalid Email");
        }

        IPublishedContent? site = _publishedContentQuery.Content(request.PageID)?.AncestorOrSelf(1);
        if (site == null)
        {
            return Result(false, "No Site Node");
        }

        string apiKey = _settingsService.Get<string>(site, "newsletterAPIKey") ?? string.Empty;
        string url = $"https://api.createsend.com/api/v3.1/subscribers/{request.ListID}.json";
        string credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes(apiKey + ":" + apiKey));

        HttpClient client = CreateClient(new AuthenticationHeaderValue("Basic", credentials));
        using HttpResponseMessage response = await client.PostAsJsonAsync(url, new
        {
            EmailAddress = request.Email,
            Resubscribe = true,
            RestartSubscriptionBasedAutoresponders = true,
        });
        return await ToResult(response, "Campaign Monitor");
    }

    private HttpClient CreateClient(AuthenticationHeaderValue authorization)
    {
        HttpClient client = _httpClientFactory.CreateClient(nameof(NewsletterController));
        client.DefaultRequestHeaders.Authorization = authorization;
        client.DefaultRequestHeaders.Accept.Clear();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return client;
    }

    private async Task<SiteApiResponse> ToResult(HttpResponseMessage response, string provider)
    {
        if (response.IsSuccessStatusCode)
        {
            return Result(true, "Subscriber Added");
        }

        string body = await response.Content.ReadAsStringAsync();
        _logger.LogWarning("{Provider} subscription failed with {StatusCode}: {Body}", provider, (int)response.StatusCode, body);

        return response.StatusCode == HttpStatusCode.Unauthorized
            ? Result(false, "Invalid Auth")
            : Result(false, "Subscriber Not Added");
    }

    private static string Md5Hex(string input)
    {
        byte[] hash = MD5.HashData(Encoding.ASCII.GetBytes(input));
        return Convert.ToHexString(hash);
    }

    private SiteApiResponse Result(bool success, string dictionaryKey) =>
        new() { Success = success, Message = _umbracoHelper.GetDictionaryValue(dictionaryKey) ?? string.Empty };
}
