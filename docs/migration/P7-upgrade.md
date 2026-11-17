# P7 – Database upgrade Umbraco 13.16.4 → 17.8.1 (attempt 3)

Database copy: **AustinOpera_U13_Stage_u17** (never AustinOpera_U13_Stage).
Working copy: `C:\Projects\sandbox\AustingU13\U13-u17` (branch `upgrade/umbraco-17`).
Starting point: orchestrator checkpoint `migrator/P7-start` (git tag + database backup). Attempt 2 was rolled back
because the UTC system-date migration used the dev PC's timezone.

## Configuration used

| Setting | Value |
|---|---|
| `Umbraco:CMS:SystemDateMigration:LocalServerTimeZone` (appsettings.json) | `Central Standard Time` (v13 stage server ran in America/Chicago) |
| Unattended upgrade | `Umbraco__CMS__Unattended__UpgradeUnattended=true`, set by the migration tool (`run_site upgradeDatabase=true`) |
| Interactive upgrade screen | not used, /umbraco was not opened before the upgrade finished |
| Build before the run | `dotnet build`: 0 errors, 11 warnings |

## Run (single run, 2026-11-12)

| Item | Result |
|---|---|
| Upgrade outcome | **finished, not failed**. Log: "Unattended upgrade completed successfully." |
| Upgrade duration (go-live window) | **≈ 86 s** total wait from site start until the upgrade finished (86 081 ms), with ≈ 27 s of that being host startup (26 968 ms). Plan for **≤ 5 min** of downtime for the DB step, plus a margin for production database size and I/O. |
| ERROR/FATAL lines in the log | 0 |
| Skybrud.Umbraco.Redirects | 4.0.9 → AddDestinationNameColumnMigration, NullableColumnsMigration → final state `4b5fabfc` |
| uSync | "uSync: Startup Complete" (no errors) |
| Umbraco Forms | Analytics backfill ran after the upgrade (02/04/2025–11/11/2026) |
| Igloo | Igloo packages were removed in P4, so no Igloo migration plan ran |

### Timezone of the UTC system-date migration

The expected line is
`Migrating system dates to UTC using the configured timezone: Central Standard Time`.

**Not confirmed by the tool.** `run_site` returns only the log tail (from "uSync: Startup Complete" onward), and this
run wrote no new trace-log file under `AustinOpera_v13/AustinOpera_v13/umbraco/Logs` (the newest file there,
`UmbracoTraceLog.ADAGE-PF5PYD9W.20261112_002.json`, holds only older Umbraco 13 runs). Per the instructions the
upgrade was not started a second time. The setting is in place (see above). The user must confirm the line in the
console or log output of this run, or with the SQL check in "Open checks" below.

## Smoke test right after the upgrade

| Path | Status |
|---|---|
| /umbraco, /umbraco/login | 200 "Umbraco" |
| /, /about/, /education/, /education/learning-for-schools-educators/ | **404 "Page Not Found"** |

The log shows `WRN No physical template file was found for template Page`, even though `Views/Page.cshtml` exists.
Most likely cause: Umbraco 17 has no runtime Razor compilation, and the csproj still has `RazorCompileOnBuild=false`
(P6 note). The views and models belong to P8. This is a front-end rendering issue, not a database upgrade failure.

## Open checks (manual)

1. Timezone line: find "Migrating system dates to UTC" in the console/log output of this run. As a cross-check, in SSMS on
   AustinOpera_U13_Stage_u17: compare `umbracoContentVersion.versionDate` of a few nodes with the same rows in
   `AustinOpera_U13_ready.bak` (restored under another name). The values must be shifted by +6 h (CST) or +5 h (CDT).
2. `SELECT [key],[value] FROM umbracoKeyValue WHERE [key] LIKE 'Umbraco.Core.Upgrader.State+%'`: final 17.x states for
   Umbraco.Core, UmbracoForms, Skybrud.Umbraco.Redirects and uSync. Any Igloo row stays unchanged.
3. Tiptap: Settings › Data Types › 1324 "IG - Text - Rich Text Editor" shows the Tiptap editor (Umb.PropertyEditorUi.Tiptap).
4. Counts: 201 documents, 699 media, 119 document types, data types = 108 − (1048, 1049, 1276), 61 Skybrud redirects,
   1058 relations, 12 users, 1 member, plus the Forms count from P1.S8.
5. Backoffice: open Theme, Home, a Post and a page with SEO settings (no "missing property editor"), and 5 redirects in Skybrud.
6. Back up as `AustinOpera_U17_upgraded.bak`, run a uSync export to `uSync/v17`, then tag `u17-P7-done`.

## Risks carried forward

- Front-end 404 / "No physical template file" until the views are compiled (P8: RazorCompileOnBuild=true and models).
- `Application URL auto-detection is disabled`: set `Umbraco:CMS:WebRouting:UmbracoApplicationUrl` per environment (later phase).
- The `umbraco/Data/TEMP` folder still holds the v13 NuCache/DistCache files (I have no delete tool). Umbraco 17 no longer
  reads NuCache, and the upgrade completed. Delete the folder anyway before the production rehearsal.
