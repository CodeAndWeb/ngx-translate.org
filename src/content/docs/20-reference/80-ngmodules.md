---
title: NgModules Support
description: Reference documentation for using ngx-translate with NgModules-based applications.
slug: reference/ngmodules
---

While ngx-translate v17+ recommends Angular's standalone components as the modern approach, it maintains full compatibility with NgModule-based applications. This document provides comprehensive information about using ngx-translate with NgModules.

## TranslateModule

The `TranslateModule` is the core module for configuring ngx-translate in NgModule-based applications. It allows you to set up basic configuration and specify which classes to override from the default implementation.

### TranslateModule.forRoot(config: TranslateModuleConfig)

Use this static method in your application's root module to provide the `TranslateService`. This service manages language changes and holds the translations.

```typescript title="app.module.ts"
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({ 
    imports: [
        BrowserModule,
        TranslateModule.forRoot({
            fallbackLang: 'en'
        })
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

#### Configuration Options

The `TranslateModuleConfig` interface provides the following configuration options (all properties are optional):

| Name               | Type      | Description                                                                                                              |
|--------------------|-----------|--------------------------------------------------------------------------------------------------------------------------|
| `fallbackLang`     | `string`  | The fallback language used when a translation is missing in the current language.                                        |
| `lang`             | `string`  | The initial language to set on startup.                                                                                  |
| `extend`           | `boolean` | Default: `false`. Extends translations for a given language instead of replacing them.                                   |
| `isolate`          | `boolean` | Default: `false`. Isolates the service instance - making allows independent switching of languages.                       |
| `loader`           | `Provider`| Provides a [`TranslateLoader`](/reference/translate-loader-api/) to load translations.                                   |
| `compiler`         | `Provider`| Provides a [`TranslateCompiler`](/reference/translate-compiler-api/) to prepare translations after loading.              |
| `parser`           | `Provider`| Provides a [`TranslateParser`](/reference/translate-parser-api/) that interpolates parameters in translations.           |
| `missingTranslationHandler` | `Provider`| Provides a [`MissingTranslationHandler`](/reference/missing-translation-handler-api/) that handles missing translations. |

### TranslateModule.forChild(config: TranslateModuleConfig)

Use this static method in your (non-root) modules to import the directive/pipe. This is not required for standalone components.

The child `TranslateService` shares the same translations and language as the `forRoot()` service by default. Use `isolate=true` to make this service's translations and language settings independent from the parent.

```typescript title="feature.module.ts"
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        TranslateModule.forChild({
            extend: true
        })
    ]
})
export class FeatureModule { }
```

## Usage with SharedModules

If you use a [`SharedModule`](https://angular.dev/guide/ngmodules/sharing) that you import in multiple other feature modules, you can export the `TranslateModule` to make sure you don't have to import it in every module.

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    exports: [
        CommonModule,
        TranslateModule
    ]
})
export class SharedModule { }
```

:::caution
Note: Never call a `forRoot` static method in the `SharedModule`. You might end up with different instances of the service in your injector tree. But you can use `forChild` if necessary.
:::

## Lazy Loaded Modules

When you lazy load a module, you should use the `forChild` static method to import the `TranslateModule`.

Since lazy loaded modules use a different injector from the rest of your application, you can configure them separately with a different loader/compiler/parser/missing translations handler.

To add the lazy loaded translations from the child module to the parent modules, `extend: true`. 

You can also isolate the service by using `isolate: true`. In which case, the service
is a completely isolated instance (for translations, current lang, events, ...). 
An isolated instance is completely independent of the others - it does not share
translations nor language settings.

Otherwise, 
by default, it will share its data (translations and language settings) with other instances of the 
service (but you can still use a different loader/compiler/parser/handler even if you don't isolate the service).

```typescript
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateLoader, provideTranslateCompiler, provideTranslateParser, provideMissingTranslationHandler } from '@ngx-translate/core';

@NgModule({
    imports: [
        TranslateModule.forChild({
            loader: provideTranslateLoader(CustomLoader),
            compiler: provideTranslateCompiler(CustomCompiler),
            parser: provideTranslateParser(CustomParser),
            missingTranslationHandler: provideMissingTranslationHandler(CustomHandler),
            isolate: true
        })
    ]
})
export class LazyLoadedModule { }
```

## Using Provider Functions with NgModules

While NgModules traditionally use the `{ provide: X, useClass: Y }` syntax for providers, ngx-translate v17 introduces provider functions that can also be used with NgModules:

```typescript
import { NgModule } from '@angular/core';
import { TranslateModule, provideTranslateLoader, provideTranslateCompiler } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
    imports: [
        TranslateModule.forRoot({
            loader: provideTranslateHttpLoader({
                prefix: '/assets/i18n/',
                suffix: '.json'
            }),
            compiler: provideTranslateCompiler(CustomCompiler),
            fallbackLang: 'en'
        })
    ]
})
export class AppModule { }
```

This approach is more consistent with the standalone component configuration.

## Initializing the TranslateService

In NgModule-based applications, you typically inject the `TranslateService` in your components 
using constructor injection:

```typescript title="app.component.ts"
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app',
    template: `
        <div>{{ 'app.hello' | translate:param }}</div>
    `
})
export class AppComponent {
    param = {value: 'world'};

    constructor(translate: TranslateService) {
        translate.setFallbackLang('en');
        translate.use('en');
    }
}
```


## Migrating from NgModules to Standalone Components

If you're considering migrating your application from NgModules to standalone components follow these instructions:

1. Replace `TranslateModule.forRoot()` with `provideTranslateService()`
2. Replace `TranslateModule.forChild()` with `provideChildTranslateService()`
3. Import `TranslatePipe` and `TranslateDirective` directly in standalone components instead of importing `TranslateModule`

`provideChildTranslateService()` is only required, if you need to load additional 
translation files - e.g. in a lazy loaded component.

Example migration:

**NgModules (Before):**
```typescript {3-10} title="app.module.ts"
@NgModule({
    imports: [
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpLoaderFactory,
                deps: [HttpClient],
            },
            fallbackLang: 'en'
        })
    ]
})
export class AppModule { }
```

```diff lang=typescript  title="mycomponent.component.ts"
@Component({
-    imports: [TranslateModule],
    ...
})
export class MyComponent { }
```

**Standalone Components (After):**
```typescript {3-9} title="app.config.ts"
export const appConfig: ApplicationConfig = {
    providers: [
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: '/assets/i18n/',
                suffix: '.json'
            }),
            fallbackLang: 'en'
        })
    ]
};
```

```diff lang=typescript  title="mycomponent.component.ts"
+import {TranslatePipe, TranslateDirective} from "@ngx-translate/core";

@Component({
    standalone: true,
+    imports: [TranslatePipe, TranslateDirective],
    // ...
})
export class MyComponent { }
```
