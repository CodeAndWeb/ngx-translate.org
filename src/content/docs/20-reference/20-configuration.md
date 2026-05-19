---
title: Configuration
description: Reference documentation for configuring ngx-translate v18 — provider functions, plugin helpers, and the HTTP loader.
slug: reference/configuration
---

ngx-translate is configured using standalone provider functions. The legacy
`TranslateModule.forRoot/forChild` API was removed in v18; see
[NgModules Support](/reference/ngmodules/) for the transition stub.

For Angular version compatibility, see
[Angular Compatibility](/getting-started/angular-compatibility/).

## `provideTranslateService` / `provideChildTranslateService` config

Both provider functions accept the same plugin slots (`loader`, `compiler`,
`parser`, `missingTranslationHandler`); the root variant adds language fields
(`fallbackLang`, `lang`). The plugin slots accept the **`TranslateProvider`**
shape — a regular Angular `Provider` object, the matching `provideTranslate*`
helper, a bare class, or a bare factory function. Bare classes and factories
are auto-wrapped under the correct DI token (see
[Bare-class auto-wrap warning](/reference/translate-service-api/#bare-class-auto-wrap-warning)).

:::note
`TranslateProvider` is a **type** (alias for `Provider | (() => unknown)`), not
a callable function. Where older docs spoke of a "TranslateProvider shape",
that means the union of accepted forms above.
:::

### provideTranslateService(config: RootTranslateServiceConfig)

Configures the root `TranslateService` at app bootstrap. Use it once in
`appConfig` (or in `bootstrapApplication` providers).

~~~ts title="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/assets/i18n/' }),
      fallbackLang: 'en',
      lang: 'de',
    }),
  ],
};
~~~

#### Configuration

All properties are optional. Plugin slots fall back to no-op / default
implementations when omitted.

| Name                        | Type                  | Description                                                                                                                                                       |
|-----------------------------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fallbackLang`              | `string`              | Fallback language used when a translation is missing in the current language.                                                                                     |
| `lang`                      | `string`              | Initial active language on startup.                                                                                                                               |
| `loader`                    | `TranslateProvider`   | Provides a [`TranslateLoader`](/reference/translate-loader-api/). Defaults to a no-op loader; provide `setTranslation()`-loaded data if you don't use one.        |
| `compiler`                  | `TranslateProvider`   | Provides a [`TranslateCompiler`](/reference/translate-compiler-api/) that pre-processes translations after loading. Defaults to a no-op.                          |
| `parser`                    | `TranslateProvider`   | Provides a [`TranslateParser`](/reference/translate-parser-api/) that interpolates `{{ placeholder }}` values. Defaults to the bundled `TranslateDefaultParser`.  |
| `missingTranslationHandler` | `TranslateProvider`   | Provides a [`MissingTranslationHandler`](/reference/missing-translation-handler-api/). Defaults to returning the key.                                             |

If `fallbackLang` is unset and a key is missing in the current language, the
`missingTranslationHandler` is invoked directly.

:::caution
**Provider precedence**

Anything passed in the config object is bound under the correct DI token by
`provideTranslateService()`. Top-level `provideTranslate*` calls in the same
`providers` array are **not** picked up — the defaults installed by
`provideTranslateService()` win. Always nest plugin helpers inside the config
object.
:::

### provideChildTranslateService(config: ChildTranslateServiceConfig)

Creates a connected child service with its own store and (optionally) its own
loader. Child services delegate `currentLang` / `fallbackLang` to the root and
walk up the parent chain when a key isn't found locally. Use this inside route
or component providers — typically for lazy-loaded features.

For an **isolated** child (no parent fallback, own language state), use
`provideTranslateService()` again on the route instead.

~~~ts title="feature.routes.ts"
import { Routes } from '@angular/router';
import { provideChildTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const routes: Routes = [
  {
    path: 'feature',
    providers: [
      provideChildTranslateService({
        loader: provideTranslateHttpLoader({ prefix: '/assets/i18n/feature/' }),
      }),
    ],
    loadChildren: () => import('./feature/feature.routes'),
  },
];
~~~

#### Configuration

| Name                        | Type                | Description                                                                                                       |
|-----------------------------|---------------------|-------------------------------------------------------------------------------------------------------------------|
| `loader`                    | `TranslateProvider` | Override the loader for this child only.                                                                          |
| `compiler`                  | `TranslateProvider` | Override the compiler for this child only.                                                                        |
| `parser`                    | `TranslateProvider` | Override the parser for this child only.                                                                          |
| `missingTranslationHandler` | `TranslateProvider` | Override the handler for this child only.                                                                         |

Unspecified slots use the parent service's plugins. Most child services only
override `loader` to point at a feature-specific translation file. See
[Concepts → Hierarchical Services](/reference/concepts/#hierarchical-services)
for the chain semantics.

## Provider helpers

Each plugin ships with a `provideTranslate*` helper. The helpers accept either
a class **or** a factory function:

~~~ts
import {
  provideTranslateLoader,
  provideTranslateCompiler,
  provideTranslateParser,
  provideMissingTranslationHandler,
} from '@ngx-translate/core';
~~~

### Class form

Use the class form when Angular's constructor DI can satisfy every dependency
of your plugin.

~~~ts title="app.config.ts"
provideTranslateService({
  loader: provideTranslateLoader(MyTranslateLoader),
  compiler: provideTranslateCompiler(MyCompiler),
  parser: provideTranslateParser(MyParser),
  missingTranslationHandler: provideMissingTranslationHandler(MyHandler),
})
~~~

### Factory form

Use the factory form when your plugin needs runtime arguments (e.g. a custom
path) or values that come from `inject()`. New in v18.

~~~ts
provideTranslateService({
  loader: provideTranslateLoader(() => new MyLoader(inject(HttpClient), '/i18n')),
  compiler: provideTranslateCompiler(() => new MyCompiler({ icu: true })),
})
~~~

The factory runs inside Angular's injection context, so you can call
`inject()` freely.

## HTTP Loader Configuration

### provideTranslateHttpLoader(config?)

The HTTP loader fetches JSON translation files. v18 adds built-in multi-resource
support — pass a `resources` array to load and deep-merge several sources per
language.

#### Single-source form

~~~ts title="app.config.ts"
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

provideTranslateService({
  loader: provideTranslateHttpLoader({
    prefix: '/assets/i18n/',
    suffix: '.json',
    enforceLoading: false,
    useHttpBackend: false,
  }),
})
~~~

| Name             | Type      | Default          | Description                                                                                                  |
|------------------|-----------|------------------|--------------------------------------------------------------------------------------------------------------|
| `prefix`         | `string`  | `/assets/i18n/`  | URL prefix. Final URL = `${prefix}${lang}${suffix}`.                                                         |
| `suffix`         | `string`  | `.json`          | URL suffix.                                                                                                  |
| `enforceLoading` | `boolean` | `false`          | If `true`, appends a cache-busting `?enforceLoading=<timestamp>` query string to bypass HTTP caches.         |
| `useHttpBackend` | `boolean` | `false`          | If `true`, bypasses HTTP interceptors by using `HttpBackend` directly.                                       |
| `failOnError`    | `boolean` | `false`          | See [failOnError](#failonerror) below.                                                                       |

#### Multi-resource HTTP loader

Pass `resources` instead of `prefix`/`suffix` to load and deep-merge several
sources per language. Each entry can be a bare prefix string, or a
`{ prefix, suffix }` object. All resources are fetched in parallel; results
are **deep-merged in order**, so later entries overwrite earlier entries on
key collisions.

~~~ts
provideTranslateHttpLoader({
  resources: [
    '/assets/i18n/common/',                                // shared dictionary
    { prefix: '/assets/i18n/feature/', suffix: '.json' },  // feature overrides
  ],
})
~~~

| Name             | Type                                          | Default        | Description                                                                              |
|------------------|-----------------------------------------------|----------------|------------------------------------------------------------------------------------------|
| `resources`      | `(string \| { prefix: string; suffix?: string })[]` | required       | Resources to load and merge per language. Later entries overwrite earlier on collision. |
| `enforceLoading` | `boolean`                                     | `false`        | Cache-busting query string, as above.                                                    |
| `useHttpBackend` | `boolean`                                     | `false`        | Bypass interceptors via `HttpBackend`.                                                   |
| `failOnError`    | `boolean`                                     | `false`        | See [failOnError](#failonerror) below.                                                   |

`provideTranslateMultiHttpLoader()` is also exported as an explicit alias of
the multi-resource form.

This built-in support replaces the standalone
`@codeandweb/ngx-translate-multi-http-loader` package.

#### failOnError

By default the HTTP loader is **permissive** (`failOnError: false`): a failed
request — for example a 404 on a missing language file — is caught
per-resource, replaced with an empty object, and logged via
`console.warn(@ngx-translate/http-loader: error loading translation for <lang>: ...)`.
Other resources still contribute their keys, and the app keeps rendering with
partial translations.

Pass `failOnError: true` to restore the v17 fail-fast behavior. Any per-resource
failure then propagates and fails the whole language load. Use this when a
missing translation file should fail a deploy rather than silently serve a
partial dictionary.

~~~ts
provideTranslateHttpLoader({
  prefix: '/assets/i18n/',
  failOnError: true,
})
~~~
