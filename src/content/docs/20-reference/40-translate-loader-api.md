---
title: TranslateLoader API
description: Reference documentation of the TranslateLoader API for ngx-translate v18.
slug: reference/translate-loader-api
---

The loader is responsible for providing translations to your application. It
can deliver embedded translations or load them from a server.

## API

~~~ts
export abstract class TranslateLoader {
  abstract getTranslation(lang: string): Observable<TranslationObject>;
}
~~~

The matching provider helper is `provideTranslateLoader()` — see
[Configuration → Provider helpers](/reference/configuration/#provider-helpers).

## API Description

`getTranslation()` receives the language code and returns an `Observable` that
resolves to a translation object:

~~~json
{
  "app.hello": "Hello World!"
}
~~~

In most cases you do not need to write your own loader. The bundled
`@ngx-translate/http-loader` covers HTTP-based JSON loading and ships built-in
multi-resource support — see
[Configuration → HTTP Loader](/reference/configuration/#http-loader-configuration).

Third-party loaders are listed in the [plugins section](/resources/plugins/).

## Registering a Custom Loader

Pass the loader class (or a factory) to `provideTranslateLoader()`, then nest
it inside `provideTranslateService()`:

~~~ts title="app.config.ts"
import { provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      loader: provideTranslateLoader(MyTranslateLoader),
    }),
  ],
};
~~~

For loaders that need runtime arguments or values from `inject()`, use the
factory form:

~~~ts
provideTranslateService({
  loader: provideTranslateLoader(() => new MyLoader(inject(HttpClient), '/i18n')),
})
~~~

You can also pass a bare class directly — it is auto-wrapped — but doing so
emits a [bare-class auto-wrap warning](/reference/translate-service-api/#bare-class-auto-wrap-warning).

## How to Build a Custom Loader

For a step-by-step guide see [Write & use your own loader](/recipes/write-own-loader/).
