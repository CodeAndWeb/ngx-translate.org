---
title: NgModules Support
description: TranslateModule was removed in v18. Use the standalone provider functions instead.
slug: reference/ngmodules
---

`TranslateModule`, `TranslateModule.forRoot()`, and `TranslateModule.forChild()`
were **removed in v18**. ngx-translate is now configured exclusively through
standalone provider functions:

* `provideTranslateService()` — replaces `TranslateModule.forRoot(...)`
* `provideChildTranslateService()` — replaces `TranslateModule.forChild({ extend: true })`
  (connected child with parent fallback)
* `provideTranslateService()` on a route — replaces `TranslateModule.forChild({ isolate: true })`
  (isolated subtree root, own language state)

In templates, import `TranslatePipe` and `TranslateDirective` directly into
the component's `imports` array instead of importing `TranslateModule`.

See the [migration guide](/getting-started/migration-guide/) for the full
NgModule → standalone mapping, including bridging providers into a legacy
`AppModule`.

The v17 NgModule reference documentation remains available at
[`/v17/reference/ngmodules/`](/v17/reference/ngmodules/).
