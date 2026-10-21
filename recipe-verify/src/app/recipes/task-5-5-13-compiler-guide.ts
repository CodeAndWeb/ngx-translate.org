// Recipe-verify for: 30-recipes/07-custom-compiler-guide.md
// Verifies the code blocks added to the custom compiler guide:
// - UpperCaseCompiler (minimal compiler example)
// - compile() returning an InterpolateFunction (%placeholder% example)
// - the MessageFormat compiler registration shape (stubbed, because the
//   real ngx-translate-messageformat-compiler package is not installed
//   in recipe-verify)

import { Injectable } from "@angular/core";
import {
    TranslateCompiler,
    Language,
    TranslationObject,
    InterpolatableTranslationObject,
    InterpolateFunction,
} from "@ngx-translate/core";

@Injectable()
export class UpperCaseCompiler extends TranslateCompiler {
    compile(value: string, _lang: Language): string | InterpolateFunction {
        return value.toUpperCase();
    }

    compileTranslations(
        translations: TranslationObject,
        lang: Language,
    ): InterpolatableTranslationObject {
        const compiled: InterpolatableTranslationObject = {};

        for (const [key, value] of Object.entries(translations)) {
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                compiled[key] = this.compileTranslations(value as TranslationObject, lang);
            } else if (typeof value === "string") {
                compiled[key] = this.compile(value, lang);
            } else {
                compiled[key] = value;
            }
        }

        return compiled;
    }
}

@Injectable()
export class PercentPlaceholderCompiler extends TranslateCompiler {
    // Matches the guide's "Returning an Interpolation Function" snippet:
    // the returned function substitutes %placeholder% at render time.
    compile(value: string, _lang: Language): string | InterpolateFunction {
        return (params) =>
            value.replace(/%(\w+)%/g, (_, key) => String(params?.[key] ?? ""));
    }

    compileTranslations(
        translations: TranslationObject,
        lang: Language,
    ): InterpolatableTranslationObject {
        const compiled: InterpolatableTranslationObject = {};

        for (const [key, value] of Object.entries(translations)) {
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                compiled[key] = this.compileTranslations(value as TranslationObject, lang);
            } else if (typeof value === "string") {
                compiled[key] = this.compile(value, lang);
            } else {
                compiled[key] = value;
            }
        }

        return compiled;
    }
}

// Stub matching the public shape used by the guide's ICU MessageFormat section.
class TranslateMessageFormatCompiler extends TranslateCompiler {
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

export const _verify_compiler_guide_task_5_5_13 = {
    UpperCaseCompiler,
    PercentPlaceholderCompiler,
    messageFormatCompiler: new TranslateMessageFormatCompiler(),
};
