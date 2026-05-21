// Recipe-verify for: 30-recipes/07-custom-compiler-guide.md
// Verifies that the typed `MarkdownCompiler` class compiles against the
// `TranslateCompiler` base class signatures.

import { Injectable } from "@angular/core";
import {
    TranslateCompiler,
    Language,
    TranslationObject,
    InterpolatableTranslationObject,
    InterpolateFunction,
} from "@ngx-translate/core";

@Injectable()
export class MarkdownCompiler extends TranslateCompiler {
    compile(value: string, _lang: Language): string | InterpolateFunction {
        if (typeof value !== "string") {
            return value;
        }

        return value
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
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

export const _verify_compiler_task_5_5_7 = MarkdownCompiler;
