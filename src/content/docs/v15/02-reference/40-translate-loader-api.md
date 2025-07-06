---
title: TranslateLoader API
description: Reference documentation of the TranslateLoader API for ngx-translate.
slug: v15/reference/translate-loader-api
---

## Translate Loader API

The loader is responsible for providing translations to the application.
It can deliver either embedded translations or load them from a server.

There are several loaders already available as plugins. So in most
cases, you'll not need to create your own. See [Installation](/v15/getting-started/installation/)
on how to use the default loader `@ngx-translate/http-loader`.

You might also find 3rd party loaders in the [plugins section](/v15/resources/plugins/).

The [`TranslateModule`](/v15/reference/translate-module-api/)
can be configured with a loader which loads translation
files at runtime.

To implement your own loader, create a class derived from this
interface:

~~~ts
export abstract class TranslateLoader {
  abstract getTranslation(lang: string/): Observable<any>;
}
~~~

The `getTranslation()` receives the language code as input and
has to return a promise the resolves to a translation object.

~~~json
{
  "app.hello": "Hello World!"
}
~~~

To configure the `TranslateModule` to use your loader
change the configuration in `TranslateModule.forRoot()`:

~~~ts
TranslateModule.forRoot({
    loader: {
        provide: TranslateLoader,
        useClass: YourLoader
    }
}) 
~~~

If you are using the `HttpClient`, use a factory method to initialise it:

~~~
const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
    new YourLoader(http, yourconfig );

TranslateModule.forRoot({
  loader: {
    provide: TranslateLoader,
    useFactory: httpLoaderFactory,
    deps: [HttpClient],
  },
})
~~~
