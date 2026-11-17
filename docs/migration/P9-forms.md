# P9: Forms and member login on Umbraco 17

Working copy: `C:\Projects\sandbox\AustingU13\U13-u17` (branch `upgrade/umbraco-17`). Database copy: **AustinOpera_U13_Stage_u17**.

## Code changes
| File | Change |
|---|---|
| `Views/Partials/widgets/Grid/ColumnUmbracoForm.cshtml` | P8 stub replaced with `await Component.InvokeAsync("RenderForm", new { formId = content.Form.Value, theme = "igloo", includeScripts = true })`. The form id is the `Guid?` from the IG - Form Picker (1288). |
| `Views/Partials/widgets/UmbracoForm.cshtml` | No change: it already used the `RenderForm` view component (`includeScripts = true`). |
| `Views/Partials/Forms/Themes/igloo/Form.cshtml` | No change needed: it compiles against the Forms 17.6.2 `FormViewModel` (RazorCompileOnBuild=true, 0 errors). Fields not overridden fall back to the Forms 17 default theme. |
| `Views/Master.cshtml` | No change: `@Html.RenderUmbracoFormDependencies(Url)` is still the Forms 17 API (it renders `/App_Plugins/UmbracoForms/assets/...?v=17.6.2`). |

Why `includeScripts = true` (the plan said `false`): the U13 macro was called with `ExcludeScripts = "0"`, so the form
scripts (conditions, multi-page navigation) were rendered with the form. Master.cshtml only renders the dependencies,
not the form scripts, so `false` would have dropped them. `true` matches U13 and `widgets/UmbracoForm.cshtml`.

## Manual tests (local site on the working copy, database copy AustinOpera_U13_Stage_u17)
Form pages: /plan-your-visit/contact-us/, /shows-events/ticket-info-offers/ticket-donation-request-form/,
/about/resident-artists/chorus-audition-form/, /about/join-austin-opera/ and any page with a Grid "Umbraco Form" column.
Member pages: /umbraco-login-page/, /error-umbraco-login-page/, plus the Login/Register widgets.

## Review findings (end-to-end tests on the database copy)

Tests ran against `AustinOpera_U13_Stage_u17` with email redirected to a local pickup folder
(`Umbraco:CMS:Global:Smtp:DeliveryMethod=SpecifiedPickupDirectory`, SMTP host pointed at an unused local port), so no
email left the machine. Only two published pages render an Umbraco Form.

| Form (page) | Steps | Result | Record | Workflow emails |
|---|---|---|---|---|
| Ticket Donation Request (`/shows-events/ticket-info-offers/ticket-donation-request-form/`) | 2 | "Thank you" | 73 | 2: to information@ (template) and dacosta@ ("Send Email (Test)") |
| Austin Opera Chorus Audition (`/about/resident-artists/chorus-audition-form/`) | 2 | Success message | 74 | 1: to dacosta@, with the 4 uploaded files attached |

- Client-side rules seen and honoured: required fields, an 8-character limit, allowed upload types (PDF; images for the headshot).
- Forms 17 has a **honeypot** field: a submission that fills it is shown "Thank you" but is not stored and runs no
  workflow (logged as "A bot submission has been assumed").
- Records 73 and 74 are test data in the database copy and can be deleted in Forms › Entries.
- `/plan-your-visit/contact-us/` and `/about/join-austin-opera/` contain no Umbraco Form. No published page uses the
  site's Contact, Newsletter, Login or Register widgets.

### Member login: the macro regression

`Umbraco Login Page` (node 3935, `/umbraco-login-page/`) rendered its login form through a **macro** embedded in a rich
text block: `<?UMBRACO_MACRO macroAlias="UmbracoLogin" />`. Umbraco 17 no longer runs macros and drops the tag, so the
page shows its text but no form (stage on 13 shows "User name / Password / Log in"). It is the only macro left in the
content. Impact today is low: the page is the login page of `Auditions Landing Page` (3934, the only protected page),
which is in the recycle bin. `Views/Partials/Shared/UmbracoLogin.cshtml` already holds the replacement markup, but no
template or block calls it. Decision needed: if the auditions login is still wanted, replace the macro with a block that
renders that partial (or the site's Login widget); otherwise leave it and unpublish the login pages.

**Applied on the copy (2026-11-12):** the macro block on `Umbraco Login Page` was replaced with the site's Login widget
and published. The page now renders the login form (posting to `SiteMemberController`, prefix `loginModel`). A login with
an unknown user shows "Invalid username or password", `/logout` redirects to `/`, and the log has no errors. A successful
login into the protected page was not tested (`Auditions Landing Page` is still in the recycle bin and there is no test
member). Production keeps the macro until the cutover: see `P12-cutover-backlog.md`, item C5.
