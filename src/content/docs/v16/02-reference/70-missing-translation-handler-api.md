---
title: MissingTranslationHandler API
description: Reference documentation of the MissingTranslationHandler API for ngx-translate.
slug: v16/reference/missing-translation-handler-api
---

Use the `MissingTranslationHandler` to customize what is happening in case
a translation is missing.

This is also influenced by the configuration value [`useDefaultLang`](/v16/reference/configuration).
If `useDefaultLang=true`, ngx-translate will first try to find the translation ID in the default language.
If this is not available, the `MissingTranslationHandler` is called. If `useDefaultLang=false`, the
handler is called immediately.

The default `MissingTranslationHandler` returns the ID of the translated message.

To implement your own handler, derive from `MissingTranslationHandler` and
pass the handler during the initialization of the [`TranslateModule`](/v16/reference/configuration).

An example is available from here: [How to handle missing translations](/v16/recipes/handle-missing-translations).

```ts
export interface MissingTranslationHandlerParams {
  key: string;
  translateService: TranslateService;
  interpolateParams?: Object;
}

export abstract class MissingTranslationHandler {
  abstract handle(params: MissingTranslationHandlerParams): any;
}
```

The `handle()` function is called for each missing translation. It receives an object with the following values:

* `key` - the ID of the translation that was not found
* `translateService` - the current `TranslateService` object
* `interpolateParams` - an object containing all parameters passed for the translation string

Depending on the result, of the function:

* If it returns a value, then this value is used.
* If it returns an observable, the value returned by this observable will be used (except if the translation
  was done using [`instant()`](/v16/reference/translate-service-api#instant)).
* If the result is `undefined` the key will be used as a value
