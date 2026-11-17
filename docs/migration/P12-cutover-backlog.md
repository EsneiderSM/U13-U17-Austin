# Cutover backlog (input for P12)

Items found during P3–P9 that must be handled on **production** (or decided) at go-live. P12 turns them into the
runbook. Keep this file updated as later phases find more.

## Before the production upgrade (on Umbraco 13)

| # | Item | Why | Found in |
|---|---|---|---|
| C1 | Confirm the **production server time zone**. If it is not Central Time, set `Umbraco:CMS:SystemDateMigration:LocalServerTimeZone` in `appsettings.Production.json` to its **Windows** time zone name. | The v17 upgrade converts all system dates from that zone to UTC (`AT TIME ZONE`, DST-aware). Stage (T1-DEVWEB19) is America/Chicago, set in `appsettings.json` as `Central Standard Time`. | P7 |
| C2 | Compare the production `wwwroot/css/generated-themes/ig-theme-*.css` with the production **Theme** node values. If they differ, align the Theme node with the CSS file (as done on the copy: 9 properties). | Publishing Theme regenerates the CSS from the node values. On stage they differed, and a publish would have changed the look. | P8 |
| C3 | Move secrets out of the committed `appsettings*.json` (connection strings, Azure Blob connection string, SMTP password) into App Service settings / Key Vault, and **rotate** the SendGrid key and the storage account key. | They are in git history. Deferred from P6 so the migration tooling keeps using the local settings. | P6 |
| C4 | Get an **Umbraco Forms licence valid for v17** for the production domain(s). | Forms 17 runs in trial mode without it. | P9 |
| C6 | Repeat the database steps that the rehearsal ran on 13: delete data types 1048/1049 and 1276, and import the converted Igloo data types (P5: uSync report must list only those data types, then import). Check that every stored value still matches its new editor's options (P5 found `bottom` missing on 1330). | The copy received them in P4/P5; production has not. The upgrade was rehearsed only from that state (`AustinOpera_U13_ready.bak`). | P4, P5 |

## After the production upgrade (on Umbraco 17)

| # | Item | Why | Found in |
|---|---|---|---|
| C5 | **Umbraco Login Page** (node 3935): remove the text block that holds `<?UMBRACO_MACRO macroAlias="UmbracoLogin" />` and add the site's **Login** widget (Heading "Audition Login Page", Text "Please enter the login for the Auditions Page", Redirect URL empty). Save and publish. | Umbraco 17 does not run macros, so the page shows no login form. Decision (2026-11-12): keep the auditions login, but do not change production before the cutover. | P9 |

## Editing experience (P11)

| # | Item | Found in |
|---|---|---|
| E1 | Block labels still use the AngularJS syntax (`Hero: {{heading}}`, `Button: {{buttonText}}`, `{{$settings.alias}}`); convert them to the Umbraco Flavored Markdown syntax. | P7 |
| E2 | Tiptap's Style Select shows Umbraco's default menu. Recreate the site styles from `/css/rte-formats.css`: Pre Header (`h6.pre-head`, 72 uses), Text Big (`.text-big`, 29), Text Small (`.text-small`, 17), plus Text, Quote, Image Left/Right. | P7 |

## Status after P11 (2026-11-12)
- E1 and E2 are done in code: `uSync/v17/DataTypes` (16 Block List label files and `IGTextRichTextEditor.config`) and
  `App_Plugins/AustinOpera/umbraco-package.json` (site style menu). They take effect only after a uSync import of those data types.
- **C7 (after the production upgrade):** deploy the code, then in uSync import the Data Types (Report first: expect only
  `IG - Text - Rich Text Editor` and the 16 `IG * Block List` data types).
- Note on the style menu: TinyMCE stored Text Big / Text Small as `<span class="text-big">`. Tiptap applies a class-only style to
  the block (`<p class="text-big">`). The site CSS uses class-only selectors (`.text-big`), so the result looks the same.
  Existing spans are kept (`Umb.Tiptap.HtmlTagSpan` + `HtmlAttributeClass` are enabled).
- uSync report on the copy (2026-11-12): 17/242 changes, all Data Types (the RTE + 16 Block Lists); everything else unchanged.
- uSync shows a "files from a previous version of uSync" banner because `uSync/v9` (Umbraco 13 export) is still in the repo.
  Remove `uSync/v9` once production has gone through C6 (it is only needed until then).
- Import done on the copy (2026-11-12 19:07 UTC): exactly 17 data types saved; RTE 1324 uses `AustinOpera.Tiptap.Toolbar.StyleSelect`
  and `/css/rte-formats.css`; 0 Block List labels with `{{`.
- Minor, audit only: ~11 `umbracoLog` rows written by Umbraco 17 *during* the upgrade (RTE, media types) show 21:49 UTC, i.e. +6 h,
  because `MigrateSystemDatesToUtc` also shifted rows that were already UTC. No content dates are affected. Expect the same on production.
