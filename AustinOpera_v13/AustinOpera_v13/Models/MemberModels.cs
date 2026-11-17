using System.ComponentModel.DataAnnotations;
using MemberPropertyModel = Umbraco.Cms.Core.Models.MemberPropertyModel;

namespace AustinOpera_v13.Models;

/// <summary>Login form model (replaces Igloo's MemberLoginViewModel). Posted with prefix "loginModel".</summary>
public class MemberLoginViewModel
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    public string? RedirectUrl { get; set; }

    public bool RememberMe { get; set; }
}

/// <summary>Register form model (replaces Igloo's MemberRegisterModel). Posted with prefix "registerModel".</summary>
public class MemberRegisterModel
{
    public string? RedirectUrl { get; set; }

    [Display(Name = "Email")]
    [EmailAddress]
    [Required]
    public string Email { get; set; } = string.Empty;

    public List<MemberPropertyModel>? MemberProperties { get; set; }

    [Editable(false)]
    public string? MemberTypeAlias { get; set; }

    public string? Name { get; set; }

    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    [Required]
    [StringLength(256)]
    public string Password { get; set; } = string.Empty;

    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    public string? ConfirmPassword { get; set; }

    public string? Username { get; set; }

    public bool UsernameIsEmail { get; set; }
}
