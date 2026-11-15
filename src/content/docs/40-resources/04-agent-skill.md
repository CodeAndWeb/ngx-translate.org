---
title: Agent skill
description: Install the ngx-translate agent skill and check JSON translation catalogues for missing keys and interpolation mismatches.
slug: resources/agent-skill
---

Install the `ngx-translate` skill to give a coding agent guidance for setup, migrations, and
translation audits. Its bundled checker compares JSON catalogues for missing keys, extra keys,
value types, and interpolation parameters.

:::note[Preview]
The skill is proposed in [ngx-translate/core#1705](https://github.com/ngx-translate/core/pull/1705).
Use the [preview source](https://github.com/ngx-translate/core/tree/0fdaa5065fadc32b6ab0e66c8ac5d62ea097b186/skills/ngx-translate)
while that PR is unmerged. The checker runs directly from the skill folder; it does not need npm
installation or a build step.
:::

## Install the skill

You need an agent that supports skills and can run local commands. The checker requires Node.js 22
or later.

1. Get a separate checkout of [core#1705](https://github.com/ngx-translate/core/pull/1705):

   ```bash
   git clone https://github.com/ngx-translate/core.git ngx-translate-skills
   git -C ngx-translate-skills fetch origin pull/1705/head
   git -C ngx-translate-skills checkout --detach FETCH_HEAD
   ```

2. Copy `ngx-translate-skills/skills/ngx-translate` into your agent's configured skills directory.
   Keep `SKILL.md`, `scripts/`, and `LICENSE` together.
3. Enable the skill using your agent's instructions and ask it to check your catalogues. For example:

   ```text
   Use the ngx-translate skill to compare public/i18n/fr.json and public/i18n/de.json against en.json.
   Explain missing keys and interpolation mismatches without modifying the files.
   ```

The skill checks the application's installed library versions before choosing APIs for setup or
migrations. For catalogue audits, it uses the bundled checker and explains the findings in the
context of your application's configuration.

## Run the checker directly

You can run the checker without an agent. Replace `/path/to/ngx-translate` below with the installed
skill directory, and `/path/to/app/public/i18n` with the directory containing your catalogues.

List the JSON files directly inside that directory:

```bash
node "/path/to/ngx-translate/scripts/check.mjs" list --root "/path/to/app/public/i18n"
```

The listing is sorted and excludes subdirectories and symlink entries. Use `--directory feature`
to list a subdirectory relative to `--root`.

Compare target languages against the source catalogue:

```bash
node "/path/to/ngx-translate/scripts/check.mjs" audit --root "/path/to/app/public/i18n" --source en.json --target fr.json --target de.json
```

Repeat `--target` for each language. The `--root` argument is required; catalogue paths must be
relative to it. Paths and symlinks that escape this root are rejected. The checker reads files
without modifying them. Run `node "/path/to/ngx-translate/scripts/check.mjs" --help` for command
usage.

## Read the results

An audit writes JSON to stdout with `sourceFile` and a `results` array. Each target report contains
its `file` and these findings:

| Field                   | Meaning                                                                           |
| ----------------------- | --------------------------------------------------------------------------------- |
| `missingKeys`           | Keys present in the source but absent from the target                             |
| `extraKeys`             | Keys present in the target but absent from the source                             |
| `placeholderMismatches` | Keys with missing or extra interpolation parameter names                          |
| `typeMismatches`        | Keys whose scalar or empty-container types differ, with expected and actual types |

For `{"hello":"Hello {{name}}"}` in `en.json` and `{"hello":"Bonjour {{person}}"}` in `fr.json`,
the audit returns:

```json
{
  "sourceFile": "en.json",
  "results": [
    {
      "file": "fr.json",
      "missingKeys": [],
      "extraKeys": [],
      "placeholderMismatches": [{ "key": "hello", "missing": ["name"], "extra": ["person"] }],
      "typeMismatches": []
    }
  ]
}
```

The process exit code distinguishes findings from an incomplete audit:

| Exit code | Meaning                                                                   |
| --------- | ------------------------------------------------------------------------- |
| `0`       | The audit completed with no differences, or a list/help command succeeded |
| `1`       | The audit completed with differences; read stdout                         |
| `2`       | Invalid arguments or an incomplete audit; read the JSON error on stderr   |

An error produces no partial report. Fix unreadable files or invalid input and rerun before treating
any requested catalogue as checked. Malformed JSON, non-object catalogue roots, and ambiguous flat
and nested keys that produce the same path are rejected.

## Interpret findings in your application

The checker compares nested objects and dotted keys by flattened paths. Arrays use numeric indices.
Placeholder checks follow the default `TranslateDefaultParser` syntax, such as `{{name}}` or
`{{ name }}`. Repeated parameters and their order do not affect the comparison.

Account for [fallback languages](/reference/configuration/) and
[merged loader resources](/getting-started/translation-files/#loading-multiple-resources) before
treating an absent key as a defect. The checker compares the files as supplied and does not emulate
runtime translation lookup. Custom parsers and ICU/messageformat compilers need their own validation.

An extra key is absent from the source catalogue. It may still be used by the application, including
through a dynamically constructed key. The checker does not scan application references, so confirm
usage before deleting keys.

## Resource limits

| Resource          | Limit                        |
| ----------------- | ---------------------------- |
| Targets per audit | 20                           |
| Catalogue size    | 1 MiB per file               |
| Catalogue entries | 10,000, including containers |
| Nesting depth     | 100 levels                   |
| Directory listing | 1,000 JSON files             |
| JSON output       | 2 MiB                        |

Commands return exit code `2` if a limit is exceeded. Compare fewer files, choose a smaller directory,
or split catalogues as appropriate.
