---
title: Configuration
description: Reference documentation for configuring ngx-translate v18, covering provider functions, plugin helpers, and the HTTP loader.
slug: reference/configuration
---

ngx-translate is configured using standalone provider functions. The legacy
`TranslateModule.forRoot/forChild` API was removed in v18; see
[NgModules Support](/reference/ngmodules/) for the transition stub.

For Angular version compatibility, see
[Angular Compatibility](/getting-started/angular-compatibility/).

## `provideTranslateService` / `provideChildTranslateService` config

Both provider functions accept `retry` and the same plugin slots (`loader`,
`compiler`, `parser`, `missingTranslationHandler`); the root variant adds language fields
(`fallbackLang`, `lang`). The plugin slots accept the **`TranslateProvider`**
shape: a regular Angular `Provider` object, the matching `provideTranslate*`
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
| `retry`                     | `number`              | Retries after a failed language load. Defaults to `0` (disabled). See [Retrying failed language loads](#retrying-failed-language-loads). |
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
`providers` array are **not** picked up; the defaults installed by
`provideTranslateService()` win. Always nest plugin helpers inside the config
object.
:::

### provideChildTranslateService(config: ChildTranslateServiceConfig)

Creates a connected child service with its own store and (optionally) its own
loader. Child services delegate `currentLang` / `fallbackLang` to the root and
walk up the parent chain when a key isn't found locally. Use this inside route
or component providers, typically for lazy-loaded features.

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
| `retry`                     | `number`            | Retries for this child's own language loads. Defaults to `0`, independently of the root. See [Retrying failed language loads](#retrying-failed-language-loads). |
| `loader`                    | `TranslateProvider` | Override the loader for this child only.                                                                          |
| `compiler`                  | `TranslateProvider` | Override the compiler for this child only.                                                                        |
| `parser`                    | `TranslateProvider` | Override the parser for this child only.                                                                          |
| `missingTranslationHandler` | `TranslateProvider` | Override the handler for this child only.                                                                         |

Unspecified slots use the parent service's plugins. Most child services only
override `loader` to point at a feature-specific translation file. See
[Concepts → Hierarchical Services](/reference/concepts/#hierarchical-services)
for the chain semantics.

### Retrying failed language loads

Set `retry` to the number of retries allowed after the initial load attempt.
The default is `0`, so failed loads are not retried automatically. For example,
`retry: 2` allows up to three attempts, with a fixed 100 ms delay before each
retry. This can help recover from transient network or response-parsing errors;
it does not repair invalid JSON or missing files.

With `@ngx-translate/http-loader`, you must also set `failOnError: true`.
The default HTTP loader catches request errors and returns an empty object for
each failed resource, leaving the service with no error to retry.

~~~ts title="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      lang: 'en',
      retry: 2,
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        failOnError: true,
      }),
    }),
  ],
};
~~~

The option applies to initial loads, language switches, fallback-language loads,
and `reloadLang()`. `isLoading()` stays `true` during retry delays. If every
attempt fails, the load Observable emits the error through the existing error
handling. A later call can start a fresh load.

Configure `retry` separately in `provideChildTranslateService()` for a child's
own loader; the root's retry count is not inherited. The same `failOnError: true`
requirement applies. With a multi-resource HTTP loader, a retry repeats the
whole language load, including resources that succeeded on the previous attempt.

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
support. Pass a `resources` array to load and deep-merge several sources per
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
| `onLoadError`    | `(failure: TranslateHttpLoaderError) => void` | `undefined` | Reports each failed resource attempt. See [onLoadError](#onloaderror) below. |

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
| `onLoadError`    | `(failure: TranslateHttpLoaderError) => void` | `undefined` | Reports each failed resource attempt. See [onLoadError](#onloaderror) below. |

:::note
Arrays in translation values are **replaced wholesale** by later resources,
not concatenated. If multiple resources contribute an array under the same
key, the last-loaded resource's array wins.
:::

:::caution[Bare-string resources ignore the `suffix` option]
When a `resources` entry is a plain string (e.g. `"/assets/i18n/common/"`),
the loader assembles the URL as `<resource><lang>.json` — it does **not**
apply your custom `suffix`. If you need a non-default suffix per resource,
use the object form: `{ prefix: "/assets/i18n/common/", suffix: ".yaml" }`.
:::

`provideTranslateMultiHttpLoader()` is also exported as an explicit alias of
the multi-resource form.

This built-in support replaces the standalone
`@codeandweb/ngx-translate-multi-http-loader` package.

#### failOnError

By default the HTTP loader is **permissive** (`failOnError: false`): a failed
request (for example a 404 on a missing language file) is caught
per-resource, replaced with an empty object, and logged via
`console.warn(@ngx-translate/http-loader: error loading translation for <lang>: ...)`
unless an [`onLoadError`](#onloaderror) callback is configured.
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

`failOnError: true` is also required when using the service's
[`retry` option](#retrying-failed-language-loads) to retry HTTP failures.

#### onLoadError

Use `onLoadError` to report resource failures through your own logger or monitoring
service. The option is available on both `TranslateHttpLoaderConfig` and
`TranslateMultiHttpLoaderConfig`: it works with either form of
`provideTranslateHttpLoader()` and with `provideTranslateMultiHttpLoader()`.

~~~ts
import { provideTranslateService } from '@ngx-translate/core';
import {
  provideTranslateHttpLoader,
  type TranslateHttpLoaderError,
} from '@ngx-translate/http-loader';

provideTranslateService({
  loader: provideTranslateHttpLoader({
    resources: ['/assets/i18n/common/', '/assets/i18n/feature/'],
    onLoadError: ({ lang, resource, url, error }: TranslateHttpLoaderError) => {
      console.warn('Translation resource failed', { lang, resource, url, error });
    },
  }),
});
~~~

Replace the example's `console.warn` with your application's reporting call.
The callback receives a `TranslateHttpLoaderError`, exported from
`@ngx-translate/http-loader`:

| Field | Type | Description |
|-------|------|-------------|
| `lang` | `string` | The requested language, before URL encoding. |
| `resource` | `string \| TranslateHttpLoaderResource` | The failing entry from `resources`. For the single-source form, this is a `{ prefix, suffix }` object with defaults applied. |
| `url` | `string \| undefined` | The constructed URL, including the encoded language and any `enforceLoading` query string. `undefined` if language encoding failed before URL construction. |
| `error` | `unknown` | The original error. Narrow its type before accessing properties such as an HTTP status. |

The callback runs once for each failed resource attempt, including failures during
service retries. Successful requests do not call it. It also reports failures
before an HTTP request, such as malformed Unicode that cannot be encoded or
rejected `.` and `..` language values. A constructed `url` does not guarantee
that a request was sent.

Reporting does not change the failure policy:

| `failOnError` | With `onLoadError` | Without `onLoadError` |
|--------------|-------------------|----------------------|
| `false` (default) | Call the callback, then substitute `{}` for the failed resource. Other resources still contribute their keys. | Log the default loader warning, then substitute `{}`. |
| `true` | Call the callback, then propagate the original error and fail the whole language load. | Propagate the original error without a loader warning. |

Setting `onLoadError` alone does not enable retries. Configure both the service's
[`retry` option](#retrying-failed-language-loads) and `failOnError: true` to retry
HTTP failures. With multiple resources, each retry repeats the whole language
load; the callback reports any resource that fails again.

The callback replaces only the loader's default warning. Separate
`TranslateService` warnings after a terminal loading failure still apply.
If the callback throws synchronously, the loader warns that `onLoadError` failed
and continues with the original loading outcome: `{}` in permissive mode or the
original loading error in strict mode.
