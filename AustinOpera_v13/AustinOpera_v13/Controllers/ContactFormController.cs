using System.Globalization;
using System.Net;
using AustinOpera_v13.Models;
using AustinOpera_v13.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Mail;
using Umbraco.Cms.Core.Models.Email;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Web.Common;
using Umbraco.Extensions;

namespace AustinOpera_v13.Controllers;

/// <summary>
/// Contact form widget endpoint (replaces Igloo's IglooContactFormController 13.1.5).
/// POST JSON from ig-app.js; returns { success, message }.
/// The email goes to the "contactFormEmail" setting with the "contactFormSubject" setting as subject, from
/// Umbraco:CMS:Global:Smtp:From, with the HTML template wwwroot/ig-assets/ContactFormEmailTemplate.html.
/// It is sent with Umbraco's IEmailSender (same SMTP settings; unlike Igloo's System.Net.Mail client it also
/// honours Smtp:SecureSocketOptions).
/// </summary>
[Route(BaseRoute + "/[action]")]
public class ContactFormController : Controller
{
    public const string BaseRoute = "umbraco/api/sitecontactform";
    public const string HandleContactFormUrl = "/" + BaseRoute + "/handlecontactform";
    public const string EmailTemplateFile = "ig-assets/ContactFormEmailTemplate.html";

    private readonly ISiteSettingsService _settingsService;
    private readonly IPublishedContentQuery _publishedContentQuery;
    private readonly UmbracoHelper _umbracoHelper;
    private readonly IEmailSender _emailSender;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly GlobalSettings _globalSettings;
    private readonly ILogger<ContactFormController> _logger;

    public ContactFormController(
        ISiteSettingsService settingsService,
        IPublishedContentQuery publishedContentQuery,
        UmbracoHelper umbracoHelper,
        IEmailSender emailSender,
        IWebHostEnvironment webHostEnvironment,
        IOptions<GlobalSettings> globalSettings,
        ILogger<ContactFormController> logger)
    {
        _settingsService = settingsService;
        _publishedContentQuery = publishedContentQuery;
        _umbracoHelper = umbracoHelper;
        _emailSender = emailSender;
        _webHostEnvironment = webHostEnvironment;
        _globalSettings = globalSettings.Value;
        _logger = logger;
    }

    [HttpPost]
    public async Task<SiteApiResponse> HandleContactForm([FromBody] ContactFormViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return Result(false, "Email Not Sent");
        }

        IPublishedContent? site = _publishedContentQuery.Content(model.ParentModelID)?.Root();
        if (site == null)
        {
            return Result(false, "No Site Node");
        }

        string? toEmail = _settingsService.Get<string>(site, "contactFormEmail", model.Culture);
        string? subject = _settingsService.Get<string>(site, "contactFormSubject", model.Culture);
        if (string.IsNullOrEmpty(toEmail) && string.IsNullOrEmpty(subject))
        {
            toEmail = _settingsService.Get<string>(site, "contactFormEmail");
            subject = _settingsService.Get<string>(site, "contactFormSubject");
        }

        try
        {
            string body = (await System.IO.File.ReadAllTextAsync(Path.Combine(_webHostEnvironment.WebRootPath, EmailTemplateFile)))
                .Replace("{Message}", WebUtility.HtmlEncode(model.Message))
                .Replace("{Name}", WebUtility.HtmlEncode(model.Name))
                .Replace("{Email}", WebUtility.HtmlEncode(model.Email))
                .Replace("{SendDate}", DateTime.Now.ToString("dd MMMM yyyy HH:mm", CultureInfo.CurrentCulture));

            var message = new EmailMessage(_globalSettings.Smtp?.From, toEmail, subject, body, true);
            await _emailSender.SendAsync(message, "ContactForm");
        }
        catch (Exception ex)
        {
            // Igloo let the exception escape (HTTP 500). Logged here; the widget shows the "Email Not Sent" message.
            _logger.LogError(ex, "Contact form email could not be sent");
            return Result(false, "Email Not Sent");
        }

        return Result(true, "Email Sent");
    }

    private SiteApiResponse Result(bool success, string dictionaryKey) =>
        new() { Success = success, Message = _umbracoHelper.GetDictionaryValue(dictionaryKey) ?? string.Empty };
}
