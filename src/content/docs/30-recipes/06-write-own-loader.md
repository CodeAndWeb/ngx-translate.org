---
title: How to Write a Custom Loader for ngx-translate
description: Learn how to create your own custom loader for translation files in ngx-translate. Complete guide with code examples for Angular translation loading.
slug: recipes/write-own-loader
---


If you want to write your own loader, you need to create a class that
implements `TranslateLoader`. The only required method is `getTranslation` that must
return an `Observable`. If your loader is synchronous, just use `of()` from RxJS to create
an observable from your static value.

## Building a Custom Loader

To implement your own loader, create a class that extends the `TranslateLoader` abstract class and implements the `getTranslation()` method.

Here's an example of a custom loader that loads translations from local JSON files:

```ts
import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

// Import your translation files
import enTranslations from '../../public/i18n/en.json';
import deTranslations from '../../public/i18n/de.json';
import frTranslations from '../../public/i18n/fr.json';

@Injectable()
export class JsonFileLoader extends TranslateLoader {
  private translations: { [key: string]: any } = {
    'en': enTranslations,
    'de': deTranslations,
    'fr': frTranslations
  };

  getTranslation(lang: string): Observable<any> {
    // Return the imported translations for the requested language
    const translation = this.translations[lang];
    
    if (translation) {
      return of(translation);
    }
    
    // Fallback to empty object if language not found
    return of({});
  }
}
```

## Registering a Custom Loader

The recommended approach in v18 is to use the `provideTranslateLoader()` function:

```ts title="app.config.ts"
import {provideTranslateService, provideTranslateLoader} from "@ngx-translate/core";
import {JsonFileLoader} from './json-file-loader';

export const appConfig: ApplicationConfig = {
    providers: [
        ...
        provideTranslateService({
            loader: provideTranslateLoader(JsonFileLoader),
        })
    ],
};
```

### Loaders that need runtime dependencies

If your loader needs services from Angular DI (like `HttpClient`), use the factory form of
`provideTranslateLoader()` together with `inject()`:

```ts title="app.config.ts"
import { ApplicationConfig, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { provideHttpClient } from "@angular/common/http";
import {
    provideTranslateService,
    provideTranslateLoader,
} from "@ngx-translate/core";
import { MyHttpLoader } from "./my-http-loader";

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideTranslateService({
            loader: provideTranslateLoader(
                () => new MyHttpLoader(inject(HttpClient), "/i18n/"),
            ),
            fallbackLang: "en",
        }),
    ],
};
```

Signal-aware DI runs inside the factory, so `inject()` calls work the same as in
component constructors.

