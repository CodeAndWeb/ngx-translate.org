---
title: Write & use your own loader
description: Create our own loader for translation files for ngx-translate.
slug: recipes/write-own-loader
---

## Write & use your own loader

If you want to write your own loader, you need to create a class that
implements `TranslateLoader`. The only required method is `getTranslation` that must
return an `Observable`. If your loader is synchronous, just use `of()` from RxJS to create
an observable from your static value.

### Creating a Custom Loader

~~~ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';

@Injectable()
export class CustomLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<any> {
        // Example: Return different translations based on language
        const translations = {
            en: { KEY: 'English value', HELLO: 'Hello' },
            de: { KEY: 'German value', HELLO: 'Hallo' },
            fr: { KEY: 'French value', HELLO: 'Bonjour' }
        };
        
        return of(translations[lang] || translations['en']);
    }
}
~~~

### Using Your Custom Loader

#### Standalone Components (v17)

The recommended approach is to use the `provideTranslateLoader()` function:

~~~ts
import { ApplicationConfig } from '@angular/core';
import { provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';
import { CustomLoader } from './custom-loader';

export const appConfig: ApplicationConfig = {
    providers: [
        provideTranslateService({
            loader: provideTranslateLoader(CustomLoader),
            fallbackLang: 'en'
        })
    ],
};
~~~

#### NgModule (Traditional)

~~~ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { CustomLoader } from './custom-loader';

@NgModule({
    imports: [
        BrowserModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: CustomLoader },
            fallbackLang: 'en'
        })
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
~~~
