---
title: How to handle missing translations
description: Handle missing translations in ngx-translate using a MissingTranslationHandler.
slug: recipes/handle-missing-translations
---

You can set up a provider for the [`MissingTranslationHandler`](/reference/missing-translation-handler-api/) in the
bootstrap of your application (recommended), or in the `providers` property of a component. It will be called when the requested translation is not available. The only required method is `handle` where you can do whatever you want. If this method returns a value or an observable (that should return a string), then this will be used. Just don't forget that it will be called synchronously from the `instant` method.

You can use the `fallbackLang` configuration to decide whether fallback language string
should be used when there is a missing translation in current language. If no fallback language is set,
`MissingTranslationHandler` will be used instead.

## Example

### Create a Missing Translation Handler

```typescript
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable()
export class MyMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        return `Missing translation for key: ${params.key}`;
    }
}
```

### Setup with Standalone Components (Recommended)

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTranslateService, provideMissingTranslationHandler } from '@ngx-translate/core';
import { AppComponent } from './app/app.component';
import { MyMissingTranslationHandler } from './app/my-missing-translation-handler';

bootstrapApplication(AppComponent, {
  providers: [
    provideTranslateService({
      fallbackLang: 'en' // Optional: set fallback language
    }),
    provideMissingTranslationHandler(MyMissingTranslationHandler)
  ]
});
```

### Setup with NgModule

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule, MissingTranslationHandler } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { MyMissingTranslationHandler } from './my-missing-translation-handler';

@NgModule({
  imports: [
    BrowserModule,
    TranslateModule.forRoot({
      missingTranslationHandler: { 
        provide: MissingTranslationHandler, 
        useClass: MyMissingTranslationHandler 
      },
      fallbackLang: 'en' // Optional: set fallback language
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
