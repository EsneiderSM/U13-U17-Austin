using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AustinOpera_v13.Models;

/// <summary>
/// Contact form request (replaces Igloo's ContactFormViewModel). ig-app.js posts the form fields
/// as a JSON object whose values are all strings, so numbers are read from strings as well.
/// </summary>
public class ContactFormViewModel
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.MultilineText)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public int ParentModelID { get; set; }

    [Required]
    public string Culture { get; set; } = string.Empty;

    public string? __RequestVerificationToken { get; set; }
}

/// <summary>Newsletter signup request (replaces Igloo's NewsletterViewModel).</summary>
public class NewsletterViewModel
{
    [Required]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public int PageID { get; set; }

    [Required]
    public string ListID { get; set; } = string.Empty;

    [Required]
    [RegularExpression("\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*")]
    public string Email { get; set; } = string.Empty;

    public string? __RequestVerificationToken { get; set; }
}

/// <summary>Response of the contact and newsletter endpoints, read by ig-app.js as { success, message }.</summary>
public class SiteApiResponse
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("success")]
    public bool Success { get; set; }
}

/// <summary>Response of the search endpoint, read by ig-app.js as { result: [...], resultCount }.</summary>
public class SiteSearchResponse
{
    [JsonPropertyName("result")]
    public List<SiteSearchResult> Result { get; set; } = new();

    [JsonPropertyName("resultCount")]
    public long ResultCount { get; set; }
}

public class SiteSearchResult
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("imageUrl")]
    public string ImageUrl { get; set; } = string.Empty;
}
