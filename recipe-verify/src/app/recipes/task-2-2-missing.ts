// Recipe-verify for: 30-recipes/08-handle-missing-translations.md
// Verifies that the `MyMissingTranslationHandler` class and the factory-form
// `appConfig` compile in a real Angular project.

import { ApplicationConfig, inject, Injectable } from "@angular/core";
import {
    MissingTranslationHandler,
    MissingTranslationHandlerParams,
    provideMissingTranslationHandler,
    provideTranslateService,
} from "@ngx-translate/core";

// Stub: LoggingService is user-supplied in the recipe's appConfig example.
// The recipe only passes it to the constructor via inject(); no methods are called,
// so an empty class satisfies the compiler.
class LoggingService {}

// ── Code block 1: MyMissingTranslationHandler (extends MissingTranslationHandler) ──

@Injectable()
export class MyMissingTranslationHandler extends MissingTranslationHandler {
  // The factory-form appConfig example passes LoggingService via inject();
  // stub an optional constructor parameter so both code blocks type-check together.
  constructor(_logging?: LoggingService) {
    super();
  }

  handle(params: MissingTranslationHandlerParams): string {
    // Log the missing translation for debugging
    console.warn(`Missing translation for key: ${params.key}`);

    // Return a formatted message instead of just the key
    return `[MISSING: ${params.key}]`;
  }
}

// ── Code block 2: appConfig with factory-form provideMissingTranslationHandler ──

export const appConfig_task_2_2: ApplicationConfig = {
    providers: [
        provideTranslateService({
            missingTranslationHandler: provideMissingTranslationHandler(
                () => new MyMissingTranslationHandler(inject(LoggingService)),
            ),
            fallbackLang: "en",
        }),
    ],
};
