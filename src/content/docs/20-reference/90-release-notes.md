---
title: Release Notes
description: What changed in each major ngx-translate release.
---

# Release Notes

For the canonical machine-readable release record, see the
[GitHub Releases page](https://github.com/ngx-translate/core/releases).

This page summarizes user-facing changes in each major release.

## v18.0

v18 rebuilds ngx-translate on Angular Signals. The library is now fully standalone — `TranslateModule` is gone — and gains hierarchical service isolation, a block directive for templates, and per-call language selection. Existing template syntax (`| translate`, `[translate]`) works as before.

### Supported Angular versions

v18 uses `effect()`, `takeUntilDestroyed()`, and stable signal APIs that landed in Angular 18. The peer dependency is `>=18`.

| ngx-translate | Angular peer dep | Status |
|---------------|------------------|--------|
| 18.x          | `>=18`           | current — active development |
| 17.x          | `>=16`           | critical fixes only; track the `v17` branch |
| ≤16.x         | `>=15`           | end-of-life |

If you are on Angular 16 or 17, stay on `@ngx-translate/core@17` until you can upgrade Angular. Mixed-version installs are not supported.

### Upgrading from v17

See [Migrating from v17 to v18](/getting-started/migration-guide/) for the full step-by-step guide. The headline changes:

| Change | Impact | Migration |
|--------|--------|-----------|
| `TranslateModule.forRoot/forChild` removed → use `provideTranslateService` / `provideChildTranslateService` | **High** | Per-app refactor of module imports |
| `currentLang` is now `Signal<Language \| null>` (was a string getter) | **High** | Add `()` to every read site |
| `defaultLang` / `setDefaultLang` / `onDefaultLangChange` removed | **Medium** | Replace with `fallbackLang*` equivalents |
| `extend: true` config removed | **Medium** | Use `provideChildTranslateService` instead |
| Mixed child content in `[translate]` elements no longer preserved | **Medium** | Restructure templates |
| Element text as translation key (`<el translate>KEY</el>`) deprecated, removed in v19 | **Medium** | Switch to `[translate]="'KEY'"` or `*translateBlock` |
| HTTP loader 404 → empty object (was: fail whole load) | **Medium** | Opt back into v17 behaviour with `failOnError: true` |
| `setValue` removed | **Low** | Use `insertValue` |
| `langs` getter removed | **Low** | Use `getLangs()` |
| Empty keys return `""` instead of throwing | **Low** | Drop the try/catch |
| ~10 store and pipe/directive internals removed | **Low** | Use public API |

2 High · 5 Medium · 4 Low. Full list under [Breaking Changes](#breaking-changes).

### Rollback

If v18 doesn't fit yet, downgrade with:

```
npm install @ngx-translate/core@17 @ngx-translate/http-loader@17
```

The v17 line accepts critical fixes against the `v17` branch.

### Highlights

- **Signals everywhere** — `currentLang`, `fallbackLang`, internal state management, the pipe, and the directive are all signal-driven. The new standalone `translate()` function returns a reactive `Signal` — no subscriptions, no cleanup.
- **`*translateBlock` directive** — Exposes a typed translation function to a template block. Cleaner than chaining pipes when you need multiple keys in one place.
- **Hierarchical services** — `provideChildTranslateService()` creates an isolated child with its own store and loader. Translations resolve child-first, then walk up to the parent. `provideTranslateService()` creates a fully independent root.
- **Per-call language override** — `translate()`, `get()`, `instant()`, `stream()`, and `getParsedResult()` accept an optional `lang` parameter to bypass the current/fallback chain.

### New Features

#### Hierarchical services with isolation

`provideChildTranslateService()` creates a child service with its own `TranslateStore` and loader, scoped to a lazy-loaded module or component subtree. Child services delegate language selection (current/fallback lang) to the root, but load and store translations independently — child translations never write to the parent store.

A child can read translations from its parent (and up the chain), but siblings cannot see each other's translations. This gives each feature module a clean, isolated scope while still inheriting shared keys from the root.

```ts
// Root — in bootstrapApplication() or app config
providers: [
    provideTranslateService({
        loader: provideTranslateHttpLoader(),
    }),
]

// Lazy route or component — child service with its own translations
providers: [
    provideChildTranslateService({
        loader: provideTranslateHttpLoader({ prefix: "/assets/i18n/feature/" }),
    }),
]
```

Translation lookup resolves child-first, then walks up to the parent. Local keys take precedence; shared keys from the root remain accessible.

To create a fully independent service with no parent fallback, use `provideTranslateService()` instead — it creates a separate root with its own language state and store.

`TranslateService.getParent()` returns the service this one inherits translations from, or `null` if it is a root (top-level service or isolated subtree root). Use it to introspect the fallback chain without reaching into protected fields:

```ts
let svc: TranslateService | null = inject(TranslateService);
while (svc) {
    console.log(svc);
    svc = svc.getParent();
}
```

#### Standalone `translate()` function

A standalone function that returns a `Signal<Translation>`, usable in component class code within an injection context:

```ts
@Component({ ... })
export class MyComponent {
    greeting = translate('HELLO');
    labels   = translate(['SAVE', 'CANCEL']);
    dynamic  = translate(() => this.model().currentKey);
    fromSig  = translate(this.keySignal, this.paramsSignal);
}
```

Each parameter (`key`, `params`, `lang`) accepts a plain value, an arrow function, or a `Signal`. Signal reads inside the function are tracked automatically, so no separate `computed()` is needed for derived inputs. The `key` parameter also accepts a `string[]` for multi-key lookup, matching `get()`, `instant()`, and `stream()`. The result updates automatically on language changes, translation reloads, or input signal changes — no subscriptions or cleanup needed.

The same API is available as `TranslateService.translate(key, params?, lang?)` for use outside injection context.

#### `*translateBlock` structural directive

Exposes a typed translation function to a template block, ideal when multiple keys are needed:

```html
<ng-container *translateBlock="let t">
  <h1>{{ t('TITLE') }}</h1>
  <p>{{ t('GREETING', { name: userName }) }}</p>
</ng-container>
```

Delegates to `TranslateService.instant()` internally, so Angular's signal tracking keeps translations up to date.

#### Optional `lang` parameter on lookup methods

`translate()`, `get()`, `instant()`, `stream()`, `getStreamOnTranslationChange()`, and `getParsedResult()` now accept an optional `lang` parameter to look up translations in a specific language, bypassing the current/fallback chain.

#### `setCompiledTranslation()`

Stores pre-compiled translations without running them through the `TranslateCompiler`. Useful for build-time pre-compilation.

#### `getTranslations()`

Public read access to stored translations for a given language, returned as `DeepReadonly`.

#### `onTranslationRefresh`

A convenience observable that merges all events that could affect displayed translations (lang changes, fallback changes, translation updates for active languages). Use this when you need a single stream that fires whenever displayed translations might have changed.

#### `ITranslateService` abstract class

The `ITranslateService` abstract class has been moved from `translate.service.ts` into its own file, `translate.service.interface.ts`. Consumers can type against the interface for testing and library authoring. All shared type aliases (`Language`, `Translation`, `InterpolationParameters`, etc.) are also centralized here.

#### Factory function support for all plugin providers

`provideTranslateLoader()`, `provideTranslateCompiler()`, `provideTranslateParser()`, and `provideMissingTranslationHandler()` now accept factory functions in addition to classes:

```ts
provideTranslateLoader(() => new MyLoader(someConfig))
provideTranslateCompiler(() => new MyCompiler())
provideTranslateParser(() => new MyParser())
provideMissingTranslationHandler(() => new MyHandler(someConfig))
```

The existing class-based usage continues to work unchanged.

### Improvements

#### `getValue()` — stricter array index validation

Array index segments in key paths are now validated with `/^\d+$/` before parsing. Previously, `parseInt` coercion meant strings like `"1abc"` would silently resolve to index `1`. In v18 they correctly return `undefined`.

#### `getValue()` — array `length` support

`getValue()` now supports reading array length via key paths:

```ts
getValue({ items: [1, 2, 3] }, "items.length"); // 3 (was undefined in v17)
```

#### Translation load errors are now logged

Failed translation loads now emit `console.warn` instead of being silently swallowed. The core service logs `@ngx-translate/core: error loading translations for <lang>` and the HTTP loader logs `@ngx-translate/http-loader: error loading translation for <lang>`. This applies to all loaders, not just the HTTP loader.

#### Translation loading is now per-language cached

Each language load is tracked independently with `shareReplay({ bufferSize: 1, refCount: true })`. Concurrent requests for the same language are deduped, and completed loads are replayed without re-fetching.

#### Several `private` members are now `protected`

`parser`, `missingTranslationHandler`, `store`, and several internal methods (`loadOrExtendLanguage`, `changeLang`, `loadAndCompileTranslations`, `getParsedResultForKey`, interpolation helpers) are now `protected` instead of `private`, making subclassing easier.

#### `mergeDeep` utility is now a public export

The `mergeDeep(target, source)` deep-merge utility is now exported from `@ngx-translate/core`. The HTTP loader uses it internally for multi-resource merging; custom loaders can use it too.

#### Safer provider config — bare classes auto-wrapped

The `loader`, `compiler`, `parser`, and `missingTranslationHandler` fields on `provideTranslateService()` and `provideChildTranslateService()` accept the full `TranslateProvider` shape: a regular Angular `Provider` object, the matching `provideTranslate*` helper, **or** a bare class or bare factory function. Bare classes and factories are auto-wrapped internally so they register under the correct DI token.

```ts
// All five forms work in v18 and bind the loader under TranslateLoader:
provideTranslateService({ loader: provideTranslateHttpLoader() });
provideTranslateService({ loader: provideTranslateLoader(MyLoader) });
provideTranslateService({ loader: MyLoader });                     // bare class — auto-wrapped (warns)
provideTranslateService({ loader: () => new MyLoader(...) });      // bare factory — auto-wrapped (silent)
provideTranslateService({                                          // explicit Provider object
    loader: { provide: TranslateLoader, useClass: MyLoader },
});
```

Bare classes emit a one-line `console.warn` naming the field and the matching helper — your app keeps working, but the message nudges you toward the explicit `provideTranslate*` form for clarity. Bare factory functions are the documented compact form and pass through silently.

In v17, a bare class registered under its own token (not under `MissingTranslationHandler` / `TranslateLoader` / etc.), so the intended binding was silently absent and the parent scope's default was used instead. v18 closes that footgun by recognizing the bare-class shape and wrapping it for you. Motivated by [issue #1618](https://github.com/ngx-translate/core/issues/1618).

### HTTP Loader

The HTTP loader gains built-in multi-resource support and better error handling, replacing the need for the separate `@codeandweb/ngx-translate-multi-http-loader` package.

#### Built-in multi-resource loading

```ts
provideTranslateHttpLoader({
    resources: [
        "/assets/i18n/common/",
        { prefix: "/assets/i18n/feature/", suffix: ".json" },
    ],
})
```

Or use `provideTranslateMultiHttpLoader()` explicitly. Results are loaded in parallel and deep-merged.

#### Per-resource error resilience

Failed HTTP requests (e.g. 404s) are now caught per-resource and replaced with an empty object, with a `console.warn` for each failure. The remaining resources still contribute their keys. In v17, a single 404 would fail the entire language load.

To opt out and restore v17 fail-fast behaviour (useful when missing translation files should fail a deploy rather than serve partial translations):

```ts
provideTranslateHttpLoader({
    prefix: "/assets/i18n/",
    failOnError: true,
});
```

#### `prefix` and `suffix` now optional

`TranslateHttpLoaderConfig.prefix` and `.suffix` are now optional, defaulting to `"/assets/i18n/"` and `".json"`.

### Deprecations

#### Element text as translation key — will be removed in v19

Using `<span translate>HELLO</span>` (where the element's text content is the key) now produces a console deprecation warning, with the offending element passed as a second argument so DevTools can highlight it. The behavior still works in v18 but **will be removed in v19**. Use `[translate]="'HELLO'"` or `*translateBlock` instead.

### Breaking Changes

#### `TranslateModule` removed — Impact: High

`TranslateModule`, `TranslateModule.forRoot()`, and `TranslateModule.forChild()` have been removed. Use the standalone provider functions and import the pipe/directive directly:

```ts
// v17
@NgModule({
    imports: [
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: MyLoader },
            compiler: { provide: TranslateCompiler, useClass: MyCompiler },
            parser: { provide: TranslateParser, useClass: MyParser },
            missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyHandler },
            defaultLanguage: "en",
        }),
    ],
})

// v18 — in bootstrapApplication() or route config
providers: [
    provideTranslateService({
        loader: provideTranslateLoader(MyLoader),
        compiler: provideTranslateCompiler(MyCompiler),
        parser: provideTranslateParser(MyParser),
        missingTranslationHandler: provideMissingTranslationHandler(MyHandler),
        fallbackLang: "en",
    }),
]

// Component imports (replace TranslateModule in component imports)
@Component({
    imports: [TranslatePipe, TranslateDirective],
})
```

#### `currentLang` is now a Signal — Impact: High

`TranslateService.currentLang` was a plain string getter in v17. In v18 it returns a `Signal<Language | null>`. Any code that reads it as a string must call the signal:

```ts
// v17
if (service.currentLang === "en") { ... }

// v18
if (service.currentLang() === "en") { ... }
```

The upside: `currentLang` now works directly in `computed()` and `effect()`, and Angular's template change detection tracks it automatically — no manual subscriptions needed.

#### `getCurrentLang()` can return `null` — Impact: Medium

The return type changed from `Language` to `Language | null`. Before any language is set, it returns `null`.

#### Deprecated `defaultLang` aliases removed — Impact: Medium

`defaultLang`, `setDefaultLang()`, `getDefaultLang()`, and `onDefaultLangChange` have been removed. These were deprecated v17 aliases for the fallback equivalents:

- `defaultLang` → `fallbackLang` signal
- `setDefaultLang(lang)` → `setFallbackLang(lang)`
- `getDefaultLang()` → `getFallbackLang()`
- `onDefaultLangChange` → `onFallbackLangChange`

#### Deprecated config options `useDefaultLang` and `defaultLanguage` removed — Impact: Medium

These v16-era compatibility options have been removed from `RootTranslateServiceConfig`. Use `fallbackLang` instead.

#### `extend` config replaced by root/child hierarchy — Impact: Medium

The `extend: true` config option has been removed. Use `provideChildTranslateService()` instead — it automatically creates a non-root service. Child services delegate language selection to the root and maintain their own translation loader.

```ts
// v17
TranslateModule.forChild({
    loader: { provide: TranslateLoader, useClass: FeatureLoader },
    extend: true,
})

// v18
provideChildTranslateService({
    loader: provideTranslateLoader(FeatureLoader),
})
```

#### Child services now have their own store — Impact: Medium

`provideChildTranslateService()` now creates its own `TranslateStore` instance with a full set of default plugin providers. Child services look up translations in their own store first, then walk up the parent chain — so lazy-loaded modules can still access translations provided by the parent, while local translations take precedence. Child translations never write to the parent store, keeping scopes cleanly separated. To create a fully independent service (no parent fallback), use `provideTranslateService()` — which creates a root-level service with its own language state and store.

#### Mixed child content in `[translate]` elements — Impact: Medium

The directive now sets `el.textContent` directly for explicit-key bindings, replacing all child content. In v17, individual text nodes were updated, potentially preserving sibling HTML. If you have mixed content inside translated elements, restructure:

```html
<!-- This will lose the <b> in v18 -->
<span [translate]="'GREETING'"><b>Bold</b></span>

<!-- Instead, restructure -->
<span [translate]="'GREETING'"></span>
```

#### `setValue()` removed — Impact: Low

The deprecated `setValue()` utility function has been removed. Use `insertValue()` instead. Note that `insertValue()` returns a new object rather than mutating in place:

```ts
// v17 (mutation)
setValue(obj, "a.b", 42);

// v18 (immutable — assign the return value)
obj = insertValue(obj, "a.b", 42);
```

#### `TranslateStore` rewritten with Angular Signals — Impact: Low

The store's internal state is now held in `WritableSignal`s with public read-only `Signal` accessors:

- `translations: Signal<Record<Language, InterpolatableTranslationObject>>`
- `languages: Signal<Language[]>`
- `lastTranslationChange: Signal<TranslationChangeEvent | null>`

The `translationChange$` observable is still available for push-based subscribers.

All state updates are now immutable — each `setTranslations()` or `deleteTranslations()` call produces a new object reference, enabling proper signal change detection.

#### Language management moved from store to service — Impact: Low

`currentLang`, `fallbackLang`, and their associated getters, setters, and observables (`onLangChange`, `onFallbackLangChange`) have been removed from `TranslateStore`. These responsibilities now live in `TranslateService`.

#### `getTranslation(key)` removed from store — Impact: Low

The convenience method that looked up a key against current + fallback language has been removed because the store no longer tracks language selection. Use `TranslateService.instant(key)` or `store.getTranslationValue(language, key)`.

#### `getValue()` → `getTranslationValue()` — Impact: Low

The protected `getValue(language, key)` method is now public and renamed to `getTranslationValue(language, key)`.

#### `TranslateStore.onTranslationChange` → `translationChange$` — Impact: Low

On `TranslateStore`, the observable getter `onTranslationChange` has been replaced by the `translationChange$` property. For template-reactive reads, use the `lastTranslationChange` signal instead.

`TranslateService.onTranslationChange` is unaffected — it remains as a getter that returns `store.translationChange$`, so existing `translate.onTranslationChange.subscribe(...)` code continues to work.

#### `langs` getter removed — Impact: Low

Replace `translateService.langs` with `translateService.getLangs()`.

#### `currentLoader` and `compiler` are now protected — Impact: Low

These properties are no longer part of the public API. Use the service's public methods instead.

#### Empty keys no longer throw — Impact: Low

`get("")` and `instant("")` now return empty strings instead of throwing an `Error`. Code that relied on catching those exceptions needs adjustment.

#### `setTranslation()` no longer auto-merges with `extend` — Impact: Low

In v17, `setTranslation()` would force-merge when the service had `extend: true`. In v18, merging only happens when `shouldMerge` is explicitly `true`.

#### `DefaultLangChangeEvent` type removed — Impact: Low

The deprecated type alias has been removed. Use `FallbackLangChangeEvent` directly.

#### `TranslatePipe` rewritten with signals — Impact: Low

The pipe is now powered by `TranslateService.translate()` signals internally. All manual RxJS subscriptions, `ChangeDetectorRef.markForCheck()`, and `OnDestroy` cleanup are gone. Template usage is unchanged — `{{ 'KEY' | translate }}` works exactly as before. Previously-public internals are no longer accessible: `lastKey` and `lastParams` are now `private`; `updateValue()` and the manual subscription fields have been removed.

#### `TranslateDirective` rewritten with signals — Impact: Low

The directive now uses `WritableSignal`s for key/params and an `effect()` for DOM writes when using explicit key binding (`[translate]="'KEY'"`). The content-as-key path is delegated to `ContentKeyHandler` (deprecated). Manual subscriptions replaced by `onTranslationRefresh` + `takeUntilDestroyed`. Previously-public methods (`checkNodes()`, `updateValue()`, `getContent()`, `setContent()`) are removed.

### Internal

- Plugin base classes (`TranslateLoader`, `TranslateCompiler`, `TranslateParser`, `MissingTranslationHandler`) are unchanged in API and behavior
- `InterpolatableTranslationObject` type extracted from `translate.service.ts` into `translate.service.interface.ts` (no consumer impact)
