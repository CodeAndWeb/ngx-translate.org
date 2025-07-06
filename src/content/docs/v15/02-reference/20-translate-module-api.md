---
title: TranslateModule API
description: Reference documentation of the TranslateModule API for ngx-translate.
slug: v15/reference/translate-module-api
---

The `TranslateModule` must be initialized in your `app.config.ts` or `app.module.ts`
file, depending on your Angular setup.

#### TranslateModule.forRoot(config: [TranslateModuleConfig](#translatemoduleconfig))

Use this static method in your application's root module or `app.config.ts` to
provide the `TranslateService`.

\####TranslateModule.forChild(config: [TranslateModuleConfig](#translatemoduleconfig))

Use this static method in your (non-root) modules to import the directive/pipe.
This is not required for standalone components.

## TranslateModuleConfig

All properties in this configuration object are optional. The configuration
can be used for both `TranslateModule.forRoot()` and `TranslateModule.forChild()`.

### Basic configuration

| Name               | Type      | Description                                                                                                                                                                      |
|--------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `defaultLanguage`   | `string`  | The default language set on startup, used when a translation is missing in the current language. See the `useDefaultLang` flag.                                                  |
| `useDefaultLang`    | `boolean` | Default: `true`. If `true`, shows text from the default language if a translation ID is not found. If `false`, the `MissingTranslationHandler` is used instead.                  |
| `extend`            | `boolean` | Extends translations for a given language instead of ignoring them.                                                                                                              |
| `isolate`           | `boolean` | Isolates the service instance; used only for lazy-loaded modules or components with the "providers" property.                                                                     |

### Providers

Providers allow you to replace default implementations of the Loader, Compiler,
Parser, and MissingTranslationsHandler with enhanced versions, either from
[plugins](/v15/resources/plugins/) or your own implementation.

| Name                        | Type      | Description                                                                                                                                                                      |
|-----------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `loader`                    | `Provider`| Provides a [`TranslateLoader`](/v15/reference/translate-loader-api/) to load translations.                                                                                             |
| `compiler`                  | `Provider`| Provides a [`TranslateCompiler`](/v15/reference/translate-compiler-api/) to prepare translations after loading. The default implementation does nothing.                               |
| `parser`                    | `Provider`| Provides a [`TranslateParser`](/v15/reference/translate-parser-api/) that interpolates parameters in translations. The default checks translations for placeholders like `{{value}}`.   |
| `missingTranslationHandler` | `Provider`| Provides a [`MissingTranslationHandler`](/v15/reference/missing-translation-handler-api/) that handles missing translations. The default returns the translation key.                   |

Providers use the standard Angular [Providers API](https://angular.dev/guide/di/dependency-injection-providers).

For example, to use the `TranslateHttpLoader`, use:

~~~ts title="app.config.ts / app.module.ts"
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    })
~~~

with a factory method to initialize the loader:

~~~ts
const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = 
  (http: HttpClient) => new TranslateHttpLoader(http, './i18n/', '.json');
~~~
