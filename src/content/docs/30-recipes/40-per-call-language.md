---
title: Translate in a specific language (per-call `lang`)
description: How to use the per-call `lang` parameter to fetch translations outside the active/fallback chain.
---

`translate()`, `get()`, `instant()`, `stream()`, `getStreamOnTranslationChange()`,
and `getParsedResult()` all accept an optional `lang` parameter that bypasses
the current and fallback languages.

## Display a fixed-language label

Useful for brand names, marketing taglines, or accessibility labels that
shouldn't follow the active language:

```ts
import { Component, inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({ selector: "app-brand", template: `<span>{{ tagline }}</span>` })
export class BrandComponent {
  private translate = inject(TranslateService);
  tagline = this.translate.instant("brand.tagline", undefined, "en");
}
```

## Pre-load a language before using `instant()` with an explicit `lang`

`instant("KEY", undefined, "de")` returns the key (and logs a one-shot
`console.warn` per unloaded lang) if `de` translations are not yet loaded.
Pre-load with `use()` (active switch), `setTranslation()` (manual), or
load on demand:

```ts
// Option A: load and switch the active language
await firstValueFrom(this.translate.use("de"));
const text = this.translate.instant("greeting", undefined, "de"); // safe

// Option B: load without switching the active language
await firstValueFrom(this.translate.reloadLang("de"));
const text = this.translate.instant("greeting", undefined, "de"); // safe

// Option C: seed translations manually (no loader call)
this.translate.setTranslation("de", { greeting: "Hallo" });
const text = this.translate.instant("greeting", undefined, "de"); // safe
```

## Live-update on a specific language's changes

`stream(key, undefined, lang)` emits initially and re-emits whenever the
specified language's translations change — independent of the active language:

```ts
this.translate.stream("greeting", undefined, "de")
  .subscribe(text => console.log("German greeting is now:", text));

// Later, somewhere else:
this.translate.setTranslation("de", { greeting: "Servus" }, true);
// The subscriber above fires with "Servus".
```
