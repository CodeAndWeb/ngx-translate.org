// Recipe-verify for: 30-recipes/06-write-own-loader.md
// Verifies that the `JsonFileLoader` class and the factory-form `appConfig` compile in a real Angular project.

import { ApplicationConfig, inject, Injectable } from "@angular/core";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import {
    TranslateLoader,
    TranslationObject,
    provideTranslateService,
    provideTranslateLoader,
} from "@ngx-translate/core";

// Stub: JSON files only exist in real user apps, not in recipe-verify.
// The recipe imports them from public/i18n/; here we inline empty objects
// so the compiler can resolve the references without real files.
const enTranslations = {} as Record<string, unknown>;
const deTranslations = {} as Record<string, unknown>;
const frTranslations = {} as Record<string, unknown>;

// Stub: MyHttpLoader is user-supplied in the recipe's appConfig example.
// We define the minimal public shape required by the factory call.
class MyHttpLoader extends TranslateLoader {
    constructor(_http: HttpClient, _prefix: string) {
        super();
    }
    getTranslation(_lang: string): Observable<TranslationObject> {
        return of({});
    }
}

// ── Code block 1: JsonFileLoader (extends TranslateLoader) ───────────────────

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

// ── Code block 2: appConfig with factory-form provideTranslateLoader ─────────

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
