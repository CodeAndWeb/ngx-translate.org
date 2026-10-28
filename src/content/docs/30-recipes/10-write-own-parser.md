---
title: Write Your Own Parser
description: Learn how to create and register a custom TranslateParser for ngx-translate.
slug: recipes/write-own-parser
---

The `TranslateParser` is responsible for formatting the translated messages and using parameters that are passed in. While the default parser works well for most use cases, you might want to create a custom parser for specific interpolation syntax or advanced formatting needs.

## How to Build a Custom Parser

To implement your own parser, create a class that extends the `TranslateParser` abstract class and implements the `interpolate()` method.

Here's an example of a custom parser that uses `${}` syntax instead of `{{}}`:

```typescript
import { Injectable } from '@angular/core';
import { TranslateParser, InterpolateFunction, InterpolationParameters } from '@ngx-translate/core';

@Injectable()
export class MyCustomParser extends TranslateParser {
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
```

## How to Register a Custom Parser

The recommended approach in v18 is to use the `provideTranslateParser()` function within `provideTranslateService()`:

```ts {2,8} title="app.config.ts"
import {provideTranslateService, provideTranslateParser} from "@ngx-translate/core";
import {MyCustomParser} from './my-custom-parser';

export const appConfig: ApplicationConfig = {
    providers: [
        ...
        provideTranslateService({
            parser: provideTranslateParser(MyCustomParser),
        })
    ],
};
```

### Parsers that need runtime dependencies

Use a factory function when your parser needs Angular services:

```ts title="app.config.ts"
import { inject } from "@angular/core";
import {
    provideTranslateService,
    provideTranslateParser,
} from "@ngx-translate/core";
import { ParserConfigService } from "./parser-config.service";
import { MyCustomParser } from "./my-custom-parser";

export const appConfig: ApplicationConfig = {
    providers: [
        provideTranslateService({
            parser: provideTranslateParser(
                () => new MyCustomParser(inject(ParserConfigService)),
            ),
            fallbackLang: "en",
        }),
    ],
};
```

## Usage Example

With the custom parser above, your translation files can use the `${}` syntax:

```json title="en.json"
{
  "HELLO": "Hello ${name}!",
  "WELCOME": "Welcome to ${appName}, ${name}!"
}
```

And in your component:

```typescript
// This will output: "Hello John!"
this.translate.get('HELLO', {name: 'John'}).subscribe((res: string) => {
  console.log(res);
});
```

## Nested translations

Use the outer translation's resolved language when a parameter names another
translation. This requires v18.1 or later.
The default parser does not add a `| translate` syntax inside placeholders;
this example uses a `TranslatedParam` object to identify nested keys.

1. Extend `TranslateDefaultParser` and override `formatValue()`:

```ts title="nested-translate-parser.ts"
import { inject, Injectable, Injector } from '@angular/core';
import {
  TranslateDefaultParser,
  TranslateService,
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
      return super.formatValue(
        translate.instant(value.key, undefined, context.lang),
        context,
      );
    }
    return super.formatValue(value, context);
  }
}
```

Resolving `TranslateService` inside `formatValue()` avoids a constructor-time
dependency cycle between the service and its parser. When the source language is
unknown, this example displays the nested key. You can choose a different policy
for that case.

2. Register the parser with `provideTranslateService()`:

```ts title="app.config.ts"
import type { ApplicationConfig } from '@angular/core';
import { provideTranslateParser, provideTranslateService } from '@ngx-translate/core';
import { NestedTranslateParser } from './nested-translate-parser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      parser: provideTranslateParser(NestedTranslateParser),
    }),
  ],
};
```

3. Supply a nested key as an interpolation parameter. In an Angular injection
   context, using the service configured above:

```ts
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslatedParam } from './nested-translate-parser';

const translate = inject(TranslateService);
translate.setTranslation('de', { INNER: 'deutscher innerer Wert' });
translate.setTranslation('en', {
  OUTER: 'Outer {{ nested }}',
  INNER: 'English inner value',
});
translate.setFallbackLang('en');
translate.use('de');

translate.instant('OUTER', { nested: new TranslatedParam('INNER') });
// 'Outer English inner value'
```

`OUTER` falls back to English, so its parser context supplies `lang: 'en'`.
The nested lookup explicitly requests English, even though German is active.
Load translations before using `instant()`; it does not wait for pending loads.
An explicit language lookup checks that language in the service and its parents,
without trying other fallback languages. A missing nested key goes through the
configured missing-translation handler, whose default returns the key.

If you implement `interpolate()` directly, accept an optional
`context?: InterpolationContext` argument and forward it to function expressions
as `expr(params, context)`. Existing two-argument parsers keep working but do not
forward context automatically. See the
[parser context reference](/reference/translate-parser-api/#interpolation-context).

## When to Use a Custom Parser

Consider creating a custom parser when:

- You need a different interpolation syntax (like `${}` instead of `{{}}`)
- You want to add custom formatting logic
- You need to support legacy translation formats
- You want to add validation or error handling to the interpolation process

For more complex transformations, consider using a [custom compiler](/recipes/custom-compiler-guide/) instead, which can pre-process translations before they reach the parser.
