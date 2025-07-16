---
title: Configuration
description: Reference documentation for configuring ngx-translate v17.
slug: reference/configuration
---

ngx-translate is configured using provider functions in Angular applications with standalone components.

For detailed information about Angular version compatibility, see the [Angular Compatibility](/getting-started/angular-compatibility/) documentation.

For comprehensive information about using ngx-translate with NgModules, 
see the [NgModules Support](/reference/ngmodules/) documentation.


### provideTranslateService(config: [RootTranslateServiceConfig](#roottranslateserviceconfig))

Use the `provideTranslateService()` function in your `appConfig` to configure the service. 

This root `TranslateService` manages the translations and language changes.
You can attach children using the `provideChildTranslateService()` in components that there
the same settings.

You can also provide multiple independent instances of `TranslateService` using `provideTranslateService()`.
With this, it's possible to use different languages in parts of your application.

~~~ts title="app.config.ts"
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
    providers: [
        provideTranslateService({
            loader: provideTranslateHttpLoader({prefix:"/i18n/app/"}),
            fallbackLang: 'en',
            lang: 'de'
        })
    ],
};
~~~

#### Configuration

All properties are optional.

| Name               | Type      | Description                                                                                                                                                                  |
|--------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fallbackLang`     | `string`  | The fallback language used when a translation is missing in the current language.                                                                                            |
| `lang`             | `string`  | The initial language to set on startup.                                                                                                                                      |
| `extend`           | `boolean` | Default: `false`. When loading additional translations, merges the translations with the already loaded instread of replacing them.                                          |
| `loader`           | `Provider`| Provides a [`TranslateLoader`](/reference/translate-loader-api/) to load translations. If not using a loader, you can provide translations useing the `setTranslation()` method. |
| `compiler`         | `Provider`| Provides a [`TranslateCompiler`](/reference/translate-compiler-api/) to prepare translations after loading.                                                                  |
| `parser`           | `Provider`| Provides a [`TranslateParser`](/reference/translate-parser-api/) that interpolates parameters in translations.                                                               |
| `missingTranslationHandler` | `Provider`| Provides a [`MissingTranslationHandler`](/reference/missing-translation-handler-api/) that handles missing translations.                                                     |

If `fallbackLang` is set, ngx-translate uses that language in case no translation is found in the current language.
If it's not set, the `missingTranslationHandler` is called.

:::caution
**Provider Precedence and Overwrites**

When using `provideTranslateService`, any services (like loader, compiler, parser, or missingTranslationHandler) not explicitly provided in the configuration object will be set to their default implementations. If you later provide a custom service elsewhere (e.g., in a feature module or component), it may overwrite the default or previously configured provider, potentially leading to unexpected behavior.

**Best Practice:**  
Always provide all custom services (loader, compiler, parser, missingTranslationHandler) directly in the configuration object passed to `provideTranslateService` at the root level. This ensures your intended services are used and avoids accidental overwrites or conflicts with defaults.
:::




#### Deprecated Properties

| Name               | Type      | Description                                                                                                                                                                      |
|--------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `useDefaultLang`   | `boolean` | **Deprecated**: Use `fallbackLang` instead. If `true`, shows text from the fallback language if a translation ID is not found.                                                 |
| `defaultLanguage`  | `string`  | **Deprecated**: Use `fallbackLang` instead. The fallback language used when a translation is missing in the current language.                                                  |


### provideChildTranslateService(config: [ChildTranslateServiceConfig](#childtranslateserviceconfig))

Use this function in child injectors or lazy-loaded components when using standalone components.
This child service is directly connected with the parent `TranslateService`. Language changes to any of the
services are reflected in all services.

The parent and all children share the same translations. By default, loading new translations in a component 
adds the new translations to the parent `TranslateService`.

~~~ts title="feature.routes.ts"
import { provideChildTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const routes: Routes = [
    {
        path: 'feature',
        providers: [
            provideChildTranslateService({
                loader: provideTranslateHttpLoader({prefix:"/i18n/feature/"}),
            })
        ],
        loadChildren: () => import('./feature/feature.routes')
    }
];
~~~

#### Configuration

Configuration interface for `provideChildTranslateService()`.  All properties are optional.

| Name               | Type      | Description                                                                                                                      |
|--------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------|
| `extend`           | `boolean` | Default: `true`. When loading translations, merge the translations with the parent `TranslateService` instead of replacing them. |
| `loader`           | `Provider`| Provides a [`TranslateLoader`](/reference/translate-loader-api/) to load translations.                                           |
| `compiler`         | `Provider`| Provides a [`TranslateCompiler`](/reference/translate-compiler-api/) to prepare translations after loading.                      |
| `parser`           | `Provider`| Provides a [`TranslateParser`](/reference/translate-parser-api/) that interpolates parameters in translations.                   |
| `missingTranslationHandler` | `Provider`| Provides a [`MissingTranslationHandler`](/reference/missing-translation-handler-api/) that handles missing translations.         |

If `loader`, `compiler`, `parser` or `missingTranslationHandler` is not provided, `TranslateService` uses the ones provided in the parent `TranslateService`.

:::note
You usually might want to use the `compiler`, `parser` and `missingTranslationHandler` from the parent `TranslateService` and only provide
a new `loader` with a new path to load additional translations for this component.
:::




## Provider Functions

### Individual Provider Functions

NGX-Translate v17 uses a modern provider function pattern that replaces the traditional Angular provider syntax. For a conceptual overview, see the [Provider Functions section in Concepts](/reference/concepts/#provider-functions).

**Traditional Angular provider syntax:**
```typescript
{ provide: TranslateLoader, useClass: CustomLoader }
```

**NGX-Translate provider function syntax:**
```typescript
provideTranslateLoader(CustomLoader)
```

This pattern applies to all provider functions in ngx-translate:

~~~ts
import { 
    provideTranslateLoader,
    provideTranslateCompiler,
    provideTranslateParser,
    provideMissingTranslationHandler
} from '@ngx-translate/core';
~~~

:::caution
**Important: Always Use Provider Functions Inside provideTranslateService**

Provider functions should always be used within the `provideTranslateService` configuration object:

```typescript
// CORRECT USAGE
provideTranslateService({
  loader: provideTranslateLoader(CustomLoader),
  compiler: provideTranslateCompiler(CustomCompiler)
})
```

```typescript
// INCORRECT USAGE - Will not work as expected
[
  provideTranslateService(),
  provideTranslateLoader(CustomLoader),  // This won't be used by TranslateService
  provideTranslateCompiler(CustomCompiler)  // This won't be used by TranslateService
]
```

This is because `provideTranslateService` loads default implementations for any providers not explicitly included in its configuration object. If you provide these services separately, they won't be used by the TranslateService.
:::

#### provideTranslateLoader(loader: Type<TranslateLoader>)

Provides a custom loader implementation.

~~~ts title="app.config.ts"
import { provideTranslateLoader } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
    providers: [
        provideTranslateService({
            loader: provideTranslateLoader(MyTranslateLoader)
        })
    ],
};
~~~

#### provideTranslateCompiler(compiler: Type<TranslateCompiler>)

Provides a custom compiler implementation.

~~~ts
provideTranslateService({
    compiler: provideTranslateCompiler(MyCompiler)
})
~~~

#### provideTranslateParser(parser: Type<TranslateParser>)

Provides a custom parser implementation.

~~~ts
provideTranslateService({
    parser: provideTranslateParser(MyParser)
})
~~~

#### provideMissingTranslationHandler(handler: Type<MissingTranslationHandler>)

Provides a custom missing translation handler implementation.

~~~ts
provideTranslateService({
    missingTranslationHandler: provideMissingTranslationHandler(MyHandler)
})
~~~

## HTTP Loader Configuration

### provideTranslateHttpLoader(config?: Partial<TranslateHttpLoaderConfig>)

The HTTP loader now uses a configuration-based approach:

~~~ts title="app.config.ts"
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
    providers: [
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: '/assets/i18n/',
                suffix: '.json',
                enforceLoading: false,
                useHttpBackend: false
            })
        })
    ],
};
~~~

#### TranslateHttpLoaderConfig

| Name               | Type      | Default              | Description                                                                                                                                                            |
|--------------------|-----------|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `prefix`           | `string`  | `/assets/i18n/`      | The prefix for translation file URLs.                                                                                                                                  |
| `suffix`           | `string`  | `.json`              | The suffix for translation file URLs.                                                                                                                                  |
| `enforceLoading`   | `boolean` | `false`              | If `true`, adds a cache-busting timestamp to requests. This ensures that the translations are always fetched from the server instead of using a version from the cache |
| `useHttpBackend`   | `boolean` | `false`              | If `true`, bypasses HTTP interceptors by using `HttpBackend` directly.                                                                                                 |
