---
title: How to handle missing translations
description: Handle missing translations in ngx-translate using a MissingTranslationHandler.
slug: recipes/handle-missing-translations
---

You can set up a provider for the [`MissingTranslationHandler`](/reference/missing-translation-handler-api/) in the
bootstrap of your application (recommended), or in the `providers` property of a component. 
It will be called when the requested translation is not available. The only required 
method is `handle` where you can do whatever you want. If this method returns a value or 
an observable (that should return a string), then this will be used. 

You can use the `fallbackLang` configuration to decide whether fallback language string
should be used when there is a missing translation in current language. If no fallback language is set,
`MissingTranslationHandler` will be used instead.

## Building a Custom Handler

To implement your own handler, create a class that extends the `MissingTranslationHandler` abstract class and implements the `handle()` method.

Here's an example of a custom handler that logs missing translations and returns a formatted message:

```typescript
import { Injectable } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

@Injectable()
export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    // Log the missing translation for debugging
    console.warn(`Missing translation for key: ${params.key}`);
    
    // Return a formatted message instead of just the key
    return `[MISSING: ${params.key}]`;
  }
}
```

## Registering a Custom Handler

The recommended approach in v17 is to use the `provideMissingTranslationHandler()` function within `provideTranslateService()`:

```ts title="app.config.ts"
import {provideTranslateService, provideMissingTranslationHandler} from "@ngx-translate/core";
import {MyMissingTranslationHandler} from './my-missing-translation-handler';

export const appConfig: ApplicationConfig = {
    providers: [
        ...
        provideTranslateService({
            missingTranslationHandler: 
                    provideMissingTranslationHandler(MyMissingTranslationHandler),
        })
    ],
};
```

For handlers that need dependencies, use the traditional provider approach:

```ts title="app.config.ts"
import {ApplicationConfig} from "@angular/core";
import {provideTranslateService, MissingTranslationHandler} from "@ngx-translate/core";
import {MyMissingTranslationHandler} from './my-missing-translation-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    ...
    provideTranslateService({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useFactory: () => new MyMissingTranslationHandler(),
        deps: [],
      }
    })
  ],
};
```