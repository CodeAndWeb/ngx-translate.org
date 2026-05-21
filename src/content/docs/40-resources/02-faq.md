---
title: ngx-translate FAQ - Frequently Asked Questions
description: Find answers to common questions about ngx-translate, Angular translation, internationalization, migration, licensing, and troubleshooting issues.
slug: resources/faq
---

## About ngx-translate


### Who are you?

I am Andreas Löw, owner of [CodeAndWeb GmbH](https://www.codeandweb.com). We are a small
software company located in the south of Germany in a city called Neu-Ulm.

We develop tools to make a developer's life easier. We started in 2010 with a tool called
[TexturePacker](https://www.codeandweb.com/texturepacker), which we still maintain, support,
and add new features to over this long period of time.

In 2015, we started our first Angular project and wanted to build it as a multilingual
application right from the start. This is how we learned about ngx-translate.
We quickly realized that editing and maintaining multiple JSON translation files becomes
a pain. So we created a tool to help with this:
[BabelEdit](https://www.codeandweb.com/babeledit).


### How is developing for this library financed?

It's easy to start a library like ngx-translate, but maintaining and supporting it
long-term requires time and effort, or in other words, some form of funding.

For us, this comes from [BabelEdit](https://www.codeandweb.com/babeledit).
You are not required to use it, of course, but we would be happy if you give it a try.
If you like it, get a license, and this also supports the development of this library.


### What's the future of this library?

This is what we currently plan to do:

We'll integrate **bug fixes** and **adjustments to Angular releases** early.

The feature set of the library itself is already quite mature. Our goal is to
keep ngx-translate lean, flexible, and downward compatible. We don't want the
library to become a large, bloated package with functions for even the most absurd
edge-cases.


### Where can I report issues or request new features?

We use the **GitHub bug tracker** to manage all issues, bugs, and feature requests.
If you encounter any problems while using `@ngx-translate/core` or have ideas for
new features, feel free to submit them there.

1. Go to the [GitHub repository](https://github.com/codeandweb/ngx-translate).
2. Open an issue if you've found a bug or suggest an enhancement.
3. Provide as much detail as possible, including steps to reproduce the issue or a clear
   explanation of the feature you would like to see.

We welcome contributions from the community and encourage you to participate in improving
the library. Your feedback helps us make `ngx-translate` better for everyone!

Please read [What's the future of this library?](#whats-the-future-of-this-library) to
understand our plans for the library, especially when it comes to feature requests.






## Licensing

### Which license is used for the library?

Olivier released the original version under [MIT license](https://opensource.org/license/mit) and 
we keep it this way
for our changes.


### Is the library free? Even for commercial used?

Yes.

## Migration

### What are the main breaking changes in v18?

The full list lives in the [Migration Guide](/getting-started/migration-guide/). The
biggest pieces:

1. **`TranslateModule` removed.** Use `provideTranslateService()` /
   `provideChildTranslateService()` and import `TranslatePipe` / `TranslateDirective`
   directly in component `imports`.
2. **`currentLang` is a `Signal<Language | null>`.** Call it: `translate.currentLang()`.
3. **`defaultLang` aliases removed.** `setDefaultLang`, `getDefaultLang`,
   `defaultLang`, `onDefaultLangChange`, `defaultLanguage`, `useDefaultLang`,
   `DefaultLangChangeEvent` are all gone. Use the `fallback`-named replacements.
4. **HTTP loader is permissive by default.** A 404 now resolves to an empty object;
   opt back into fail-fast with `failOnError: true`.
5. **`setTranslation()` no longer auto-merges.** The third `shouldMerge` argument
   is `false` by default. The v17 `extend: true` config that toggled the merge is gone.

### Can I still use NgModule configuration in v18?

No. `TranslateModule` and `TranslateModule.forRoot()` / `forChild()` are removed in v18. Use `provideTranslateService()` and `provideChildTranslateService()` instead. See the [Migration Guide](/getting-started/migration-guide/) for details.

### What's the difference between `RootTranslateServiceConfig` and `ChildTranslateServiceConfig`?

- **`RootTranslateServiceConfig`** is used with `provideTranslateService()`. It accepts
  the four plugin slots (`loader`, `compiler`, `parser`, `missingTranslationHandler`)
  plus language fields (`fallbackLang`, `lang`).
- **`ChildTranslateServiceConfig`** is used with `provideChildTranslateService()`. It
  accepts the same four plugin slots; unspecified slots inherit the parent's plugins.

`provideChildTranslateService()` always creates a **connected** child: its store is
checked first, the parent chain provides fallback for missing keys. To create an
**isolated** subtree with its own language state, call `provideTranslateService()`
again on the route. The v17 `extend` / `isolate` flags are gone.

### How do I register a custom loader (or compiler/parser/handler)?

Use the matching `provideTranslate*` helper, nested inside `provideTranslateService()`:

**Class form** — when Angular DI can satisfy every dependency:

```typescript
provideTranslateService({
  loader: provideTranslateLoader(MyTranslateLoader),
})
```

**Factory form** — when you need runtime arguments or `inject()`:

```typescript
provideTranslateService({
  loader: provideTranslateLoader(
    () => new MyLoader(inject(HttpClient), '/i18n'),
  ),
})
```

The same shape works for `provideTranslateCompiler`, `provideTranslateParser`, and
`provideMissingTranslationHandler`. See
[Configuration → Provider helpers](/reference/configuration/#provider-helpers).

Bare classes (`loader: MyLoader`) are accepted and auto-wrapped, but emit a
[bare-class auto-wrap warning](/reference/translate-service-api/#bare-class-auto-wrap-warning).
Prefer the explicit helper.

### How do I handle the EventEmitter to Observable changes?

`onLangChange`, `onFallbackLangChange`, and `onTranslationChange` are Observables you
subscribe to:

```typescript
this.translate.onLangChange.subscribe(event => {
  // Handle language change
});
```

For most reactive UI work in v18, reach for the `currentLang` / `fallbackLang`
signals first — they compose with `computed()` and `effect()` without manual
subscription cleanup.

## Technical

### I want to hot reload the translations in my application but `reloadLang` does not work

If you want to reload your translations and see the update on all your components
without reloading the page, you need to load the translations manually and call the
[`setTranslation`](/reference/translate-service-api/#settranslation) function, which
triggers [`onTranslationChange`](/reference/translate-service-api/#ontranslationchange).

In v18, `setTranslation(lang, translations)` **replaces** the stored translations by
default. To merge new keys on top of the existing dictionary (the v17 default), pass
`true` as the third argument: `setTranslation(lang, translations, true)`.

### How do I test components with the new provider functions?

Type your fake against `ITranslateService` (the abstract class extracted in v18) so
TypeScript catches API drift. Then provide it under the `TranslateService` token:

```typescript
import { ITranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { signal } from '@angular/core';

const mockTranslateService: Partial<ITranslateService> = {
  get: jasmine.createSpy().and.returnValue(of('translated')),
  instant: jasmine.createSpy().and.returnValue('translated'),
  currentLang: signal<string | null>('en'),
};

TestBed.configureTestingModule({
  providers: [
    { provide: TranslateService, useValue: mockTranslateService },
  ],
});
```

For tests that aren't shape-sensitive, instantiate the real `TranslateService` via
`provideTranslateService({ loader: provideTranslateLoader(FakeLoader) })`.
