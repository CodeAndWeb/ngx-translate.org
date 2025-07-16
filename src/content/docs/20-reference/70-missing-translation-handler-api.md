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

## API

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

## API Description

The `handle()` function is called for each missing translation. It receives a `MissingTranslationHandlerParams` object with the following properties:

* `key` - the ID of the translation that was not found
* `translateService` - the current `TranslateService` object
* `interpolateParams` - an object containing all parameters passed for the translation string

The default `MissingTranslationHandler` returns the ID of the translated message.

Depending on the result of the function:

* If it returns a value, then this value is used.
* If it returns an observable, the value returned by this observable will be used (except if the translation
  was done using [`instant()`](/reference/translate-service-api/#instant)).
* If the result is `undefined` the key will be used as a value

## How to Build a Custom Handler

For detailed examples and step-by-step instructions on building and registering custom missing translation handlers, see [How to handle missing translations](/recipes/handle-missing-translations/).
