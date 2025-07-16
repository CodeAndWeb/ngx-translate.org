---
title: MissingTranslationHandler API
description: Reference documentation of the MissingTranslationHandler API for ngx-translate.
slug: reference/missing-translation-handler-api
---

Use the `MissingTranslationHandler` to customize what is happening in case
a translation is missing.

This is influenced by the `fallbackLang` configuration. If a fallback language is configured,
ngx-translate will first try to find the translation ID in the fallback language.
If this is not available, the `MissingTranslationHandler` is called. If no fallback language is set,
the handler is called immediately.

The default `MissingTranslationHandler` returns the ID of the translated message.

To implement your own handler, derive from `MissingTranslationHandler` and
configure it using the new provider functions or the traditional module configuration.

### Using Provider Functions (Recommended for v17)

```typescript
import { provideMissingTranslationHandler } from '@ngx-translate/core';
import { MyMissingTranslationHandler } from './my-missing-translation-handler';

// In your bootstrap or component providers
provideMissingTranslationHandler(MyMissingTranslationHandler)
```

### Using TranslateModule Configuration

```typescript
import { TranslateModule, MissingTranslationHandler } from '@ngx-translate/core';
import { MyMissingTranslationHandler } from './my-missing-translation-handler';

TranslateModule.forRoot({
  missingTranslationHandler: provideMissingTranslationHandler(MyMissingTranslationHandler),
  fallbackLang: 'en'
})
```

An example is available from here: [How to handle missing translations](/recipes/handle-missing-translations/).

~~~ts
export interface MissingTranslationHandlerParams {
  key: string;
  translateService: TranslateService;
  interpolateParams?: Object;
}

export abstract class MissingTranslationHandler {
  abstract handle(params: MissingTranslationHandlerParams): any;
}
~~~

The `handle()` function is called for each missing translation. It receives an object with the following values:

* `key` - the ID of the translation that was not found
* `translateService` - the current `TranslateService` object
* `interpolateParams` - an object containing all parameters passed for the translation string

Depending on the result, of the function:

* If it returns a value, then this value is used.
* If it returns an observable, the value returned by this observable will be used (except if the translation
  was done using [`instant()`](/reference/translate-service-api/#instant)).
* If the result is `undefined` the key will be used as a value
