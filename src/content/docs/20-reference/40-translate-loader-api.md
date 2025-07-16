---
title: TranslateLoader API
description: Reference documentation of the TranslateLoader API for ngx-translate.
slug: reference/translate-loader-api
---

The loader is responsible for providing translations to the application.
It can deliver either embedded translations or load them from a server.

## API

~~~ts
export abstract class TranslateLoader {
  abstract getTranslation(lang: string): Observable<any>;
}
~~~

## API Description

The `getTranslation()` receives the language code as input and
has to return an Observable that resolves to a translation object.

~~~json
{
  "app.hello": "Hello World!"
}
~~~

There are several loaders already available as plugins. So in most
cases, you'll not need to create your own. See [Installation](/getting-started/installation/)
on how to use the default loader `@ngx-translate/http-loader`.

You might also find 3rd party loaders in the [plugins section](/resources/plugins/).

## How to Build a Custom Loader

For detailed examples and step-by-step instructions on building and registering custom loaders, see [Write & use your own loader](/recipes/write-own-loader/).

The ngx-translate can be [configured](/reference/configuration/) with 
a loader which loads translation files at runtime.
