---
title: TranslateLoader API
description: Reference documentation of the TranslateLoader API for ngx-translate.
slug: reference/translate-loader-api
---

## Translate Loader API

The loader is responsible for providing translations to the application.
It can deliver either embedded translations or load them from a server.

There are several loaders already available as plugins. So in most
cases, you'll not need to create your own. See [Installation](/getting-started/installation)
on how to use the default loader `@codeandweb/http-loader`.

You might also find 3rd party loaders in the [plugins section](/resources/plugins).

The ngx-translate can be [configured](/reference/configuration) with 
a loader which loads translation files at runtime.

To implement your own loader, create a class derived from this
interface:

~~~ts
export abstract class TranslateLoader {
  abstract getTranslation(lang: string): Observable<any>;
}
~~~

The `getTranslation()` receives the language code as input and
has to return a promise the resolves to a translation object.

~~~json
{
  "app.hello": "Hello World!"
}
~~~

## Standalone Components

To configure ngx-translate to use your loader
change the configuration in `provideTranslationService()` function in your app.config.ts:

~~~ts {9-12} title="app.config.ts"
...
import {provideTranslationService, TranslateLoader} from "@codeandweb/ngx-translate";
...

export const appConfig: ApplicationConfig = {
    providers: [
      ...
        provideTranslationService({
            loader: {
                provide: TranslateLoader,
                userClass: YourLoader
            },
        })
    ],
};
~~~

If you are using the `HttpClient`, use a factory method to initialise it:

~~~ts {2-5,7-8,13-20} title="app.config.ts"
import {ApplicationConfig, provideZoneChangeDetection} from "@angular/core";
import {provideHttpClient} from "@angular/common/http";
import {provideTranslationService, TranslateLoader} from "@codeandweb/ngx-translate";
import {TranslateHttpLoader} from '@codeandweb/http-loader';
import {HttpClient} from '@angular/common/http';

const httpLoaderFactory: (http: HttpClient) => TranslateLoader = (http: HttpClient) =>
    new YourLoader(http);

export const appConfig: ApplicationConfig = {
  providers: [
    ...
    provideHttpClient(),
    provideTranslationService({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    })
  ],
};
~~~


## ngModules

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
