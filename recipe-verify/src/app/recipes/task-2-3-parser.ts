// Recipe-verify for: 30-recipes/10-write-own-parser.md
// Verifies that the `MyCustomParser` class and the factory-form
// `appConfig` compile in a real Angular project.

import { ApplicationConfig, inject, Injectable } from "@angular/core";
import {
    TranslateParser,
    InterpolateFunction,
    InterpolationParameters,
    provideTranslateParser,
    provideTranslateService,
} from "@ngx-translate/core";

// Stub: ParserConfigService is user-supplied in the recipe's appConfig example.
// The recipe only passes it to the constructor via inject(); no methods are called,
// so an empty class satisfies the compiler.
class ParserConfigService {}

// ── Code block 1: MyCustomParser (extends TranslateParser) ──

@Injectable()
export class MyCustomParser extends TranslateParser {
  // The factory-form appConfig example passes ParserConfigService via inject();
  // stub an optional constructor parameter so both code blocks type-check together.
  // The recipe's class declaration does not show a constructor (it's a simple parser),
  // but adding an optional parameter here does not change public behaviour — it only
  // satisfies the compiler when the factory calls `new MyCustomParser(inject(ParserConfigService))`.
  constructor(_config?: ParserConfigService) {
    super();
  }

  interpolate(expr: InterpolateFunction | string, params?: InterpolationParameters): string | undefined {
    if (typeof expr === 'string') {
      // Custom interpolation logic using ${} syntax
      return expr.replace(/\$\{([^}]+)\}/g, (match, key) => {
        return params && params[key] !== undefined ? params[key] : match;
      });
    } else if (typeof expr === 'function') {
      return expr(params);
    }
    return undefined;
  }
}

// ── Code block 2: appConfig with factory-form provideTranslateParser ──

export const appConfig_task_2_3: ApplicationConfig = {
    providers: [
        provideTranslateService({
            parser: provideTranslateParser(
                () => new MyCustomParser(inject(ParserConfigService)),
            ),
            fallbackLang: "en",
        }),
    ],
};
