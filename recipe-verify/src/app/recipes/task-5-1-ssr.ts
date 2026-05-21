// Recipe-verify for: 30-recipes/30-ssr-and-prerender.md
// Verifies that the Pattern 1 (APP_INITIALIZER) appConfig compiles.

import { APP_INITIALIZER, ApplicationConfig, inject } from "@angular/core";
import { provideTranslateService, TranslateService } from "@ngx-translate/core";

// Stub: in the recipe this is `import enTranslations from "../public/i18n/en.json";`.
// The scaffold project does not bundle JSON, so inline an equivalent literal of the
// same shape (TranslationObject — a recursive string-keyed object of strings).
const enTranslations = { greeting: "Hello" };

export const appConfig_task_5_1: ApplicationConfig = {
    providers: [
        provideTranslateService({ fallbackLang: "en" }),
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: () => {
                const translate = inject(TranslateService);
                return () => {
                    translate.setTranslation("en", enTranslations);
                    return translate.use("en");
                };
            },
        },
    ],
};
