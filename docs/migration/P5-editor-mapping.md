# P5 · Igloo property editors → core Umbraco editors (still on Umbraco 13.16.4)

Database copy: **AustinOpera_U13_Stage_u17** (never the source `AustinOpera_U13_Stage`).
Working copy: `C:\Projects\sandbox\AustingU13\U13-u17` (branch `upgrade/umbraco-17`).

## 1. Principle

Every target editor stores **the same plain string** the Igloo editor stored, so no content
value has to be rewritten and the ModelsBuilder models (all `string` properties, `SourceCodeManual`)
and the views stay unchanged:

| Igloo editor | What it stored | Target core editor | Stored format after the switch |
|---|---|---|---|
| `BBB.ButtonPicker` | the selected button value, e.g. `daily`, `0.5`, `standard` | `Umbraco.RadioButtonList` (same option values, same order) | identical string |
| `IglooApprovedColorPicker` | a **token**: `dark`, `white`, `gray`, `theme`, `theme-alt` (not a hex value) | `Umbraco.RadioButtonList` with those tokens (deviation from the plan, see §4) | identical string |
| `ColorValue` | free text CSS colour, e.g. `#078A59`, `rgba(0,0,0,0.08)` | `Umbraco.TextBox` (Textstring) (deviation from the plan, see §4) | identical string |
| `IglooMeasurmentValue` | number + unit, e.g. `16px`, `1.2rem` (unit from config `measurment`) | `Umbraco.TextBox` (Textstring) | identical string |
| `IconPicker` | Font Awesome class, e.g. `fa-phone` | `Umbraco.TextBox` (Textstring) | identical string (0 values) |

Radio Button List, Textstring and their value converters all exist in Umbraco 17 under the same aliases
(`Umbraco.RadioButtonList`, `Umbraco.TextBox`). Umbraco's 13→17 migrations convert their configuration
automatically, and the stored values are not touched.

## 2. Data type mapping (from uSync/v9/DataTypes, stored counts from the inventory)

Counts are `umbracoPropertyData` rows on documents. Values inside Block List JSON (block settings)
are **not** in these counts. They are strings inside the block JSON and are not affected by
changing the data type's editor.

### 2.1 BBB.ButtonPicker → Radio Button List

| Id | Name | Options (exact, in order) | Igloo default | Values |
|---|---|---|---|---|
| 1321 | IG - Sitemap Page Change Frequently - Buttons | always, hourly, daily, weekly, monthly, yearly, never | daily | 105 |
| 1322 | IG - Sitemap Page Priority - Buttons | 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0 | 0.5 | 105 |
| 1279 | IG - Container Width - Buttons | small, standard, big, full width | standard | 2 |
| 1281 | IG - Cookie Consent Dialog Position - Buttons | float-left, float-right, banner-bottom | float-left | 1 |
| 1291 | IG - Header Layout - Buttons | navigation-left, navigation-center, navigation-right, navigation-left-logo-center | navigation-right | 1 |
| 1274 | IG - Button Size - Buttons | small, default, big | default | 0 |
| 1275 | IG - Button Style - Buttons | solid, border, underline | solid | 0 |
| 1287 | IG - Gallery Group - Buttons | 1, 2, 3, 4, 5, 6, 7, 8 | 2 | 0 |
| 1292 | IG - Horizontal Align Columns - Buttons | left, center, right, space-around | left | 0 |
| 1294 | IG - Horizontal Alignment - Buttons | left, center, right | left | 0 |
| 1296 | IG - Left and Right - Buttons | left, right | left | 0 |
| 1297 | IG - Level of Children - Buttons | 0, 1, 2, 3, 4, 5 | 0 | 0 |
| 1304 | IG - Member Visibility - Buttons | Always, Logged In, Logged Out | Always | 0 |
| 1311 | IG - People Per Row - Buttons | 2, 3, 4, 5 | 3 | 0 |
| 1327 | IG - Text Size - Buttons | small, normal, big, xl | normal | 0 |
| 1329 | IG - Vertical Align Columns - Buttons | top, center, bottom | top | 0 |
| 1330 | IG - Vertical Alignment - Buttons | top, center, **bottom** (not in the Igloo config, but 25 block values use it) | top | 0 rows; values live in blocks |
| 3810 | Adage - Container Width - Image | one third, two thirds, fifty fifty | one third | 0 |
| 1276 | IG - Butttons butttons | test 1, test 2 | test 1 | 0, 0 property types → **delete** |

Total on documents: 214 (the plan's "213" came from the risk register; the inventory gives 105+105+2+1+1).
Option values are case- and space-sensitive (`Logged In`, `full width`, `one third`). Enter them exactly.

### 2.2 IglooApprovedColorPicker → Radio Button List (tokens)

The Igloo editor showed swatches whose colours came from the Theme node
(`/umbraco/backoffice/igloo/IglooGetThemeColors/Get`), but it saved only the token.

| Id | Name | Options (from the `display*` flags) | Values |
|---|---|---|---|
| 1270 | IG - Approved Color Picker | dark, white, gray, theme, theme-alt | 1 |
| 1271 | IG - Background - Approved Color | dark, white, gray, theme, theme-alt | 0 |
| 1273 | IG - Button Color - Approved Color | dark, white, gray, theme, theme-alt | 0 |
| 1282 | IG - Dark Light - Approved Color | dark, white | 3 |
| 1326 | IG - Text Color - Approved Color | dark, white (`useTextColors=1`, swatches only) | 0 |
| 1328 | IG - To Top Button Color - Approved Color | dark, white, theme, theme-alt | 1 |

Total: 5 values, all kept byte-identical (no re-entry needed).

### 2.3 ColorValue / IglooMeasurmentValue / IconPicker → Textstring

| Id | Name | Igloo config | Values |
|---|---|---|---|
| 1277 | IG - Color Value | – | 15 (Theme node) |
| 1314 | IG - Pixel Value | measurment = px | 14 |
| 1318 | IG - Rem Value | measurment = rem | 13 |
| 1283 | IG - Empty | (no unit, stored a bare number) | 2 |
| 1315 | IG - Pixels | measurment = px | 0 (0 property types) |
| 1295 | IG - Icon Picker | – | 0 |

## 3. Read-only SQL (run in SSMS against AustinOpera_U13_Stage_u17)

Run it **before** the switch, save the output as `docs/migration/P5-before.csv`, run it again **after** the switch as
`P5-after.csv` and diff the two files. Only `propertyEditorAlias`/`config` may differ.

```sql
-- NOTE (review): 3.2/3.3 only see property rows. Most values of these data types live inside Block List/Grid JSON.
-- The full before snapshot (rows + blocks, current and published versions) is in docs/migration/P5-values-before.json.
-- 3.1 Data types still on Igloo editors (expect 31 rows before, 0 after)
SELECT n.id, n.text, dt.propertyEditorAlias, dt.config
FROM umbracoDataType dt JOIN umbracoNode n ON n.id = dt.nodeId
WHERE dt.propertyEditorAlias IN ('BBB.ButtonPicker','ColorValue','IglooMeasurmentValue',
                                 'IglooApprovedColorPicker','IconPicker')
ORDER BY dt.propertyEditorAlias, n.id;

-- 3.2 Stored value counts per data type (must be unchanged)
DECLARE @ids TABLE (id int);
INSERT @ids VALUES (1321),(1322),(1279),(1281),(1291),(1274),(1275),(1287),(1292),(1294),(1296),(1297),
                   (1304),(1311),(1327),(1329),(1330),(3810),(1276),
                   (1270),(1271),(1273),(1282),(1326),(1328),
                   (1277),(1314),(1318),(1283),(1315),(1295);
SELECT pt.dataTypeId, COUNT(*) AS valueCount
FROM umbracoPropertyData pd
JOIN cmsPropertyType pt ON pt.id = pd.propertyTypeId
WHERE pt.dataTypeId IN (SELECT id FROM @ids)
  AND COALESCE(pd.varcharValue, pd.textValue) IS NOT NULL AND COALESCE(pd.varcharValue, pd.textValue) <> ''
GROUP BY pt.dataTypeId ORDER BY pt.dataTypeId;

-- 3.3 10 sample values per data type, with a checksum (must be byte-identical)
WITH v AS (
  SELECT pt.dataTypeId, pt.alias, pd.versionId, COALESCE(pd.varcharValue, pd.textValue) AS val,
         ROW_NUMBER() OVER (PARTITION BY pt.dataTypeId ORDER BY pd.id) AS rn
  FROM umbracoPropertyData pd JOIN cmsPropertyType pt ON pt.id = pd.propertyTypeId
  WHERE pt.dataTypeId IN (SELECT id FROM @ids)
    AND COALESCE(pd.varcharValue, pd.textValue) IS NOT NULL AND COALESCE(pd.varcharValue, pd.textValue) <> '')
SELECT dataTypeId, alias, versionId, val, CONVERT(varchar(64), HASHBYTES('SHA2_256', val), 2) AS sha256
FROM v WHERE rn <= 10 ORDER BY dataTypeId, rn;

-- 3.4 Distinct values per data type (every value must be one of the Radio Button List options in §2)
SELECT pt.dataTypeId, COALESCE(pd.varcharValue, pd.textValue) AS val, COUNT(*) AS n
FROM umbracoPropertyData pd JOIN cmsPropertyType pt ON pt.id = pd.propertyTypeId
WHERE pt.dataTypeId IN (SELECT id FROM @ids)
GROUP BY pt.dataTypeId, COALESCE(pd.varcharValue, pd.textValue) ORDER BY 1, 2;
```

If 3.4 shows a value that is not in the option list (e.g. a trailing space or an old value), add it to the
Radio Button List **before** the switch. Otherwise the radio list shows nothing selected and the next save clears it.

## 4. Deviations from the plan, and why

* **Approved colour pickers → Radio Button List, not the core Color Picker.** The Igloo editor stores
  tokens (`dark`, `theme-alt`, …) and the views and theme CSS use those tokens as class names.
  The core `Umbraco.ColorPicker` stores `{"value":"000000","label":"dark"}`. Its value converter returns a
  hex string (or `PickedColor` with labels), which would change the model types and every view that
  reads these properties. A Radio Button List keeps the tokens byte-identical, so no code change and no
  re-entry is needed. The cost is that editors see the token names instead of swatches. If swatches are
  wanted later, it is a small U17 Lit property-editor UI on top of the same string schema.
* **1277 IG - Color Value → Textstring, not Eye Dropper.** The Theme values include `rgba(...)`
  (e.g. Border Dark "Default: rgba(0,0,0,0.08)") and possibly 3-digit hex. The Eye Dropper rewrites
  the value into its own format on save (and drops alpha unless `showAlpha` is on), which would
  change the generated theme CSS. Textstring is byte-safe. It can be switched to Eye Dropper (showAlpha on)
  after U17 if the 15 values are checked against its output.

## 5. Behaviour changes to know about

* `BBB.ButtonPicker` wrote its `defaultValue` into empty properties when an editor opened the item.
  Radio Button List has no default, so **new** items or blocks saved after the switch leave these properties
  empty. Existing content is unaffected. The views already handle empty values: Sitemap.cshtml falls back to
  `daily`/`0.5`, and the widgets' `switch` statements fall through to their `default` class. Editors should pick
  a value when they create pages or blocks.
* Theme node measurement fields: editors now type the unit themselves (`16px`, not `16`).

## 6. How the switch is applied (P5.S2, manual)

The 30 data type files in `uSync/v9/DataTypes` (all except `IGButttonsButttons.config`, see §2.1) are already
converted in the working copy (same keys, names and folders, new `EditorAlias` and `Config`).
`ImportAtStartup` is `None`, so nothing is applied until someone imports. See the manual instructions in the P5 report.

## 5. Review findings (applied after the uSync import)

- **Empty values: `null` → `""`.** Igloo's editors had no value converter, so an empty field reached the views as `null`.
  `Umbraco.TextBox` returns `""`. `ColumnPod.cshtml` tested `content.Icon != null`, so every pod without an icon
  rendered an empty `<i class="fa ">` instead of its image. Fixed by testing `string.IsNullOrWhiteSpace(...)` in
  `ColumnPod`, `SubHeader`, `Navigation` and `SectionNavigation`. The same check is valid on Umbraco 17.
- **Expected HTML difference:** empty `CustomIconColor` now renders `style=""` instead of `style="color:"`
  (no visual change). Every other byte of the 25 compared pages is identical to P4.
- **1330 Vertical Alignment** gained the option `bottom` (25 block values use it; see §2).
- **Stored values:** rows plus block JSON, current and published versions, are identical before and after the import
  (`P5-values-before.json`).
- The import also applied P2's removal of `umbmacro` from the `IG - Text - Rich Text Editor` toolbar, which the
  database copy had never received.
