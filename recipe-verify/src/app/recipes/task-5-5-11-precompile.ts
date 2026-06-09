// Recipe-verify for: 30-recipes/55-precompile-translations.md
// Verifies that `setCompiledTranslation()` accepts an
// `InterpolatableTranslationObject`, that a user-defined no-op
// `TranslateCompiler` subclass type-checks against the source's
// non-generic abstract base class, and that the built-in
// `TranslateNoOpCompiler` is exported and registrable.

import { ApplicationConfig, APP_INITIALIZER, inject } from "@angular/core";
import {
    provideTranslateService,
    provideTranslateCompiler,
    TranslateService,
    TranslateCompiler,
    TranslateNoOpCompiler,
    InterpolatableTranslationObject,
    InterpolateFunction,
    TranslationObject,
    Language,
} from "@ngx-translate/core";

class NoopTranslateCompiler extends TranslateCompiler {
    compile(value: string, _lang: Language): string | InterpolateFunction {
        return value;
    }
    compileTranslations(
        translations: TranslationObject,
        _lang: Language,
    ): InterpolatableTranslationObject {
        return translations as InterpolatableTranslationObject;
    }
}

const enCompiled: InterpolatableTranslationObject = {
    welcome: "Welcome",
    greeting: ((params?: Record<string, unknown>) =>
        `Hello ${params?.["name"]}`) as InterpolateFunction,
};

const appConfigCustomNoop: ApplicationConfig = {
    providers: [
        provideTranslateService({
            fallbackLang: "en",
            compiler: provideTranslateCompiler(() => new NoopTranslateCompiler()),
        }),
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: () => {
                const translate = inject(TranslateService);
                return () => {
                    translate.setCompiledTranslation("en", enCompiled);
                    return translate.use("en");
                };
            },
        },
    ],
};

const appConfigBuiltinNoop: ApplicationConfig = {
    providers: [
        provideTranslateService({
            fallbackLang: "en",
            compiler: provideTranslateCompiler(TranslateNoOpCompiler),
        }),
    ],
};

export const _verify_precompile_task_5_5_11 = {
    appConfigCustomNoop,
    appConfigBuiltinNoop,
};
