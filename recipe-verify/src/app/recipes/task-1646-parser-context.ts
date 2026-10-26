// Requires core PR #1646; mirrors the parser reference and nested translation recipe.
import { inject, Injectable, Injector, type ApplicationConfig } from '@angular/core';
import {
  TranslateDefaultParser,
  TranslateService,
  provideTranslateParser,
  provideTranslateService,
  type InterpolatableTranslation,
  type InterpolateFunction,
  type InterpolationContext,
} from '@ngx-translate/core';

export class TranslatedParam {
  constructor(public readonly key: string) {}
}

@Injectable()
export class NestedTranslateParser extends TranslateDefaultParser {
  private readonly injector = inject(Injector);

  protected override formatValue(
    value: unknown,
    context?: InterpolationContext,
  ): string | undefined {
    if (value instanceof TranslatedParam) {
      if (context?.lang === undefined) {
        return value.key;
      }
      const translate = this.injector.get(TranslateService);
      return super.formatValue(translate.instant(value.key, undefined, context.lang), context);
    }
    return super.formatValue(value, context);
  }
}

export class CustomTranslateService extends TranslateService {
  protected override getTextToInterpolate(
    key: string,
    lang?: string,
    onLookup?: (lookup: {
      translation: InterpolatableTranslation;
      context: InterpolationContext;
    }) => void,
  ): InterpolatableTranslation {
    return super.getTextToInterpolate(key, lang, onLookup);
  }
}

export const appConfig_parser_context: ApplicationConfig = {
  providers: [
    provideTranslateService({
      parser: provideTranslateParser(NestedTranslateParser),
    }),
  ],
};

export function nestedTranslationExample() {
  const translate = inject(TranslateService);
  translate.setTranslation('de', { INNER: 'deutscher innerer Wert' });
  translate.setTranslation('en', {
    OUTER: 'Outer {{ nested }}',
    INNER: 'English inner value',
  });
  translate.setFallbackLang('en');
  translate.use('de');

  return translate.instant('OUTER', { nested: new TranslatedParam('INNER') });
  // 'Outer English inner value'
}

export const compiledContextMessage: InterpolateFunction = (params, context) =>
  `${context?.key}:${context?.lang}:${params?.['name']}`;
