---
title: Configuration
description: Reference documentation of the TranslateModule API for ngx-translate.
slug: reference/configuration
---

How you configure ngx-translate depends on your project setup:

- [Standalone components](#standalone-components)
- [ngModules](#ngmodules)

## Standalone components 


#### provideTranslateService(config: [TranslateModuleConfig](#translatemoduleconfig))

Use the `provideTranslateService()` function in your `appConfig`
configure the service. See [TranslateModuleConfig](#translatemoduleconfig) for available options.

~~~ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
    providers: [
        ...
        provideTranslateService({
            ... configuration ...
        })
    ],
};
~~~


## ngModules

The `TranslateModule` is used for ngModule based applications and must be initialized in your `app.module.ts`
file, depending on your Angular setup.

#### TranslateModule.forRoot(config: [TranslateModuleConfig](#translatemoduleconfig))

Use this static method in your application's root module or `app.config.ts` to
provide the `TranslateService`. See [TranslateModuleConfig](#translatemoduleconfig) for available options.

~~~ts title="app.module.ts"
@NgModule({ 
    ...
    imports: [
        TranslateModule.forRoot({
           ... configuration ...
        })],
})
export class AppModule { }
~~~

#### TranslateModule.forChild(config: [TranslateModuleConfig](#translatemoduleconfig))

Use this static method in your (non-root) modules to import the directive/pipe.
This is not required for standalone components. See [TranslateModuleConfig](#translatemoduleconfig) for available options.

~~~ts title="sub.module.ts"
    TranslateModule.forChild({
        ... configuration ...
    })
~~~


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
[plugins](/resources/plugins/) or your own implementation.

| Name                        | Type      | Description                                                                                                                                                                      |
|-----------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `loader`                    | `Provider`| Provides a [`TranslateLoader`](/reference/translate-loader-api/) to load translations.                                                                                             |
| `compiler`                  | `Provider`| Provides a [`TranslateCompiler`](/reference/translate-compiler-api/) to prepare translations after loading. The default implementation does nothing.                               |
| `parser`                    | `Provider`| Provides a [`TranslateParser`](/reference/translate-parser-api/) that interpolates parameters in translations. The default checks translations for placeholders like `{{value}}`.   |
| `missingTranslationHandler` | `Provider`| Provides a [`MissingTranslationHandler`](/reference/missing-translation-handler-api/) that handles missing translations. The default returns the translation key.                   |

Providers use the standard Angular [Providers API](https://angular.dev/guide/di/dependency-injection-providers).

For example, to use the `TranslateHttpLoader`, use:

~~~ts title="app.component.ts"
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    })
~~~

~~~ts title="app.config.ts"
    provideTranslateService({
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
