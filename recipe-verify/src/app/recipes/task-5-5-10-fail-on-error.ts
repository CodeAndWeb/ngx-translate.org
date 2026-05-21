// Recipe-verify for: 30-recipes/35-fail-on-missing-translation-file.md
import { ApplicationConfig, isDevMode } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";

const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: "/i18n/",
                suffix: ".json",
                failOnError: !isDevMode(),
            }),
            fallbackLang: "en",
        }),
    ],
};

export const _verify_fail_on_error_task_5_5_10 = appConfig;
