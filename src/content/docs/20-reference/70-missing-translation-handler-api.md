---
title: MissingTranslationHandler API
description: Reference documentation of the MissingTranslationHandler API for ngx-translate v18.
slug: reference/missing-translation-handler-api
---

Use a `MissingTranslationHandler` to customize what happens when a translation
key cannot be resolved.

The `fallbackLang` configuration is consulted first: if a fallback language is
set, ngx-translate tries the key there before invoking the handler. With no
fallback, the handler is called immediately.

The matching provider helper is `provideMissingTranslationHandler()`. See
[Configuration → Provider helpers](/reference/configuration/#provider-helpers).

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

`handle()` is called once per missing translation with the following:

* `key`: the translation ID that was not found.
* `translateService`: the `TranslateService` instance making the lookup.
* `interpolateParams`: the parameters passed by the caller (if any).

The default handler returns the key itself.

Return value handling:

* If the handler returns a value, that value is used.
* If it returns an `Observable`, the value emitted by the observable is used,
  except when the lookup was via [`instant()`](/reference/translate-service-api/#instant),
  which is synchronous and cannot wait for an observable.
* If it returns `undefined`, the key is used as the value.

## Registering a Custom Handler

~~~ts title="app.config.ts"
import {
  provideTranslateService,
  provideMissingTranslationHandler,
} from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      missingTranslationHandler: provideMissingTranslationHandler(MyHandler),
    }),
  ],
};
~~~

Factory form:

~~~ts
provideTranslateService({
  missingTranslationHandler: provideMissingTranslationHandler(
    () => new MyHandler({ reportTo: '/missing-keys' }),
  ),
})
~~~

## How to Build a Custom Handler

For a step-by-step example see
[How to handle missing translations](/recipes/handle-missing-translations/).
